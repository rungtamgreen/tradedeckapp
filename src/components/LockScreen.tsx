import { useState } from 'react';
import { useAppLock } from '@/hooks/useAppLock';
import { Button } from '@/components/ui/button';
import { Fingerprint, KeyRound, Wrench } from 'lucide-react';

export function LockScreen() {
  const { lockMethod, verifyPin, verifyPasskey } = useAppLock();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePinSubmit = async () => {
    setError('');
    setLoading(true);
    const ok = await verifyPin(pin);
    if (!ok) {
      setError('Incorrect PIN');
      setPin('');
    }
    setLoading(false);
  };

  const handlePasskey = async () => {
    setError('');
    setLoading(true);
    const ok = await verifyPasskey();
    if (!ok) setError('Biometric verification failed. Try again.');
    setLoading(false);
  };

  const handlePinDigit = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setError('');
      if (newPin.length === 4) {
        setTimeout(async () => {
          setLoading(true);
          const ok = await verifyPin(newPin);
          if (!ok) {
            setError('Incorrect PIN');
            setPin('');
          }
          setLoading(false);
        }, 100);
      }
    }
  };

  const handleBackspace = () => {
    setPin(p => p.slice(0, -1));
    setError('');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground mb-4">
            <Wrench className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">JobDeck</h1>
          <p className="text-muted-foreground text-sm">Unlock to continue</p>
        </div>

        {lockMethod === 'passkey' && (
          <div className="space-y-4">
            <button
              onClick={handlePasskey}
              disabled={loading}
              className="mx-auto flex items-center justify-center w-24 h-24 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 transition-all active:scale-95"
            >
              <Fingerprint className="h-12 w-12" />
            </button>
            <p className="text-sm text-muted-foreground">
              Tap to unlock with biometrics
            </p>
          </div>
        )}

        {lockMethod === 'pin' && (
          <div className="space-y-6">
            {/* PIN dots */}
            <div className="flex justify-center gap-4">
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full transition-all ${
                    i < pin.length ? 'bg-accent scale-110' : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            {/* Number pad */}
            <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                <button
                  key={n}
                  onClick={() => handlePinDigit(String(n))}
                  disabled={loading}
                  className="h-14 rounded-xl bg-card border border-border text-xl font-bold text-foreground hover:bg-muted active:scale-95 transition-all"
                >
                  {n}
                </button>
              ))}
              <div />
              <button
                onClick={() => handlePinDigit('0')}
                disabled={loading}
                className="h-14 rounded-xl bg-card border border-border text-xl font-bold text-foreground hover:bg-muted active:scale-95 transition-all"
              >
                0
              </button>
              <button
                onClick={handleBackspace}
                disabled={loading}
                className="h-14 rounded-xl bg-card border border-border text-sm font-medium text-muted-foreground hover:bg-muted active:scale-95 transition-all"
              >
                ⌫
              </button>
            </div>
          </div>
        )}

        {error && <p className="text-destructive text-sm font-medium">{error}</p>}
      </div>
    </div>
  );
}
