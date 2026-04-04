import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

type LockMethod = 'none' | 'pin' | 'passkey';

interface AppLockContextType {
  lockMethod: LockMethod;
  isLocked: boolean;
  isLoading: boolean;
  unlock: () => void;
  setLockMethod: (method: LockMethod, pin?: string) => Promise<void>;
  verifyPin: (pin: string) => Promise<boolean>;
  verifyPasskey: () => Promise<boolean>;
  registerPasskey: () => Promise<boolean>;
}

const AppLockContext = createContext<AppLockContextType | undefined>(undefined);

export function AppLockProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [lockMethod, setLockMethodState] = useState<LockMethod>('none');
  const [isLocked, setIsLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load security settings
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      setIsLocked(false);
      return;
    }

    const load = async () => {
      const { data } = await supabase
        .from('user_security')
        .select('lock_method')
        .eq('user_id', user.id)
        .maybeSingle();

      const method = (data?.lock_method as LockMethod) || 'none';
      setLockMethodState(method);

      // Lock the app if a lock method is set and app was just opened/resumed
      if (method !== 'none') {
        const lastUnlock = sessionStorage.getItem('jobdeck_unlocked');
        if (!lastUnlock) {
          setIsLocked(true);
        }
      }
      setIsLoading(false);
    };
    load();
  }, [user]);

  const unlock = useCallback(() => {
    setIsLocked(false);
    sessionStorage.setItem('jobdeck_unlocked', Date.now().toString());
  }, []);

  const setLockMethod = useCallback(async (method: LockMethod, pin?: string) => {
    if (!user) return;

    const pinHash = pin ? btoa(pin) : null; // Simple encoding for demo; in production use bcrypt edge function

    const { data: existing } = await supabase
      .from('user_security')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('user_security')
        .update({ lock_method: method, pin_hash: pinHash })
        .eq('user_id', user.id);
    } else {
      await supabase
        .from('user_security')
        .insert({ user_id: user.id, lock_method: method, pin_hash: pinHash });
    }

    setLockMethodState(method);
    if (method === 'none') {
      sessionStorage.removeItem('jobdeck_unlocked');
      setIsLocked(false);
    }
  }, [user]);

  const verifyPin = useCallback(async (pin: string): Promise<boolean> => {
    if (!user) return false;

    const { data } = await supabase
      .from('user_security')
      .select('pin_hash')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!data?.pin_hash) return false;
    const matches = btoa(pin) === data.pin_hash;
    if (matches) unlock();
    return matches;
  }, [user, unlock]);

  const registerPasskey = useCallback(async (): Promise<boolean> => {
    if (!user || !window.PublicKeyCredential) return false;

    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const userId = new TextEncoder().encode(user.id);

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: 'JobDeck', id: window.location.hostname },
          user: {
            id: userId,
            name: user.email || 'user',
            displayName: user.email || 'User',
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' },   // ES256
            { alg: -257, type: 'public-key' },  // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
          },
          timeout: 60000,
        },
      }) as PublicKeyCredential;

      if (!credential) return false;

      const response = credential.response as AuthenticatorAttestationResponse;
      const credentialId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
      const publicKey = btoa(String.fromCharCode(...new Uint8Array(response.getPublicKey?.() || new ArrayBuffer(0))));

      await supabase.from('user_passkeys').insert({
        user_id: user.id,
        credential_id: credentialId,
        public_key: publicKey,
        name: 'This Device',
      });

      return true;
    } catch (e) {
      console.error('Passkey registration failed:', e);
      return false;
    }
  }, [user]);

  const verifyPasskey = useCallback(async (): Promise<boolean> => {
    if (!user || !window.PublicKeyCredential) return false;

    try {
      const { data: passkeys } = await supabase
        .from('user_passkeys')
        .select('credential_id')
        .eq('user_id', user.id);

      if (!passkeys?.length) return false;

      const allowCredentials = passkeys.map(pk => ({
        id: Uint8Array.from(atob(pk.credential_id), c => c.charCodeAt(0)),
        type: 'public-key' as const,
      }));

      const challenge = crypto.getRandomValues(new Uint8Array(32));

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          allowCredentials,
          userVerification: 'required',
          timeout: 60000,
        },
      });

      if (assertion) {
        unlock();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Passkey verification failed:', e);
      return false;
    }
  }, [user, unlock]);

  return (
    <AppLockContext.Provider
      value={{
        lockMethod,
        isLocked,
        isLoading,
        unlock,
        setLockMethod,
        verifyPin,
        verifyPasskey,
        registerPasskey,
      }}
    >
      {children}
    </AppLockContext.Provider>
  );
}

export function useAppLock() {
  const ctx = useContext(AppLockContext);
  if (!ctx) throw new Error('useAppLock must be used within AppLockProvider');
  return ctx;
}
