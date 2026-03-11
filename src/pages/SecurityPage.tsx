import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { useAppLock } from '@/hooks/useAppLock';
import { toast } from 'sonner';
import { ArrowLeft, Fingerprint, KeyRound, ShieldOff, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SecurityPage() {
  const navigate = useNavigate();
  const { lockMethod, setLockMethod, registerPasskey } = useAppLock();
  const [settingUp, setSettingUp] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'choose' | 'pin-enter' | 'pin-confirm'>('choose');
  const [loading, setLoading] = useState(false);

  const supportsPasskey = !!window.PublicKeyCredential;

  const handleSetNone = async () => {
    setLoading(true);
    await setLockMethod('none');
    toast.success('App lock disabled');
    setLoading(false);
  };

  const handleStartPin = () => {
    setStep('pin-enter');
    setPin('');
    setConfirmPin('');
  };

  const handlePinDigit = (digit: string, target: 'pin' | 'confirm') => {
    if (target === 'pin') {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin.length === 4) {
        setTimeout(() => setStep('pin-confirm'), 200);
      }
    } else {
      const newConfirm = confirmPin + digit;
      setConfirmPin(newConfirm);
      if (newConfirm.length === 4) {
        if (newConfirm === pin) {
          setLoading(true);
          setLockMethod('pin', newConfirm).then(() => {
            toast.success('PIN lock enabled!');
            setStep('choose');
            setLoading(false);
          });
        } else {
          toast.error("PINs don't match. Try again.");
          setStep('pin-enter');
          setPin('');
          setConfirmPin('');
        }
      }
    }
  };

  const handlePasskey = async () => {
    setLoading(true);
    const ok = await registerPasskey();
    if (ok) {
      await setLockMethod('passkey');
      toast.success('Biometric lock enabled!');
    } else {
      toast.error('Could not set up biometrics. Your device may not support it.');
    }
    setLoading(false);
  };

  const PinPad = ({ value, target }: { value: string; target: 'pin' | 'confirm' }) => (
    <div className="space-y-6">
      <div className="flex justify-center gap-4">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full transition-all ${
              i < value.length ? 'bg-accent scale-110' : 'bg-muted'
            }`}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
          <button
            key={n}
            onClick={() => handlePinDigit(String(n), target)}
            disabled={loading}
            className="h-14 rounded-xl bg-card border border-border text-xl font-bold text-foreground hover:bg-muted active:scale-95 transition-all"
          >
            {n}
          </button>
        ))}
        <div />
        <button
          onClick={() => handlePinDigit('0', target)}
          disabled={loading}
          className="h-14 rounded-xl bg-card border border-border text-xl font-bold text-foreground hover:bg-muted active:scale-95 transition-all"
        >
          0
        </button>
        <button
          onClick={() => target === 'pin' ? setPin(p => p.slice(0, -1)) : setConfirmPin(p => p.slice(0, -1))}
          disabled={loading}
          className="h-14 rounded-xl bg-card border border-border text-sm font-medium text-muted-foreground hover:bg-muted active:scale-95 transition-all"
        >
          ⌫
        </button>
      </div>
    </div>
  );

  return (
    <AppLayout
      title="Security"
      action={
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="touch-target">
          <ArrowLeft className="h-5 w-5" />
        </Button>
      }
    >
      {step === 'choose' && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Choose how to lock your app when you return:</p>

          <div className="space-y-3">
            {/* Passkey / Biometric */}
            {supportsPasskey && (
              <button
                onClick={handlePasskey}
                disabled={loading}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all active:scale-[0.98] ${
                  lockMethod === 'passkey'
                    ? 'border-accent bg-accent/10'
                    : 'border-border bg-card hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent/20 text-accent-foreground">
                  <Fingerprint className="h-6 w-6" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-foreground">Fingerprint / Face ID</p>
                  <p className="text-xs text-muted-foreground">Use biometrics to unlock</p>
                </div>
                {lockMethod === 'passkey' && <Check className="h-5 w-5 text-accent" />}
              </button>
            )}

            {/* PIN */}
            <button
              onClick={handleStartPin}
              disabled={loading}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all active:scale-[0.98] ${
                lockMethod === 'pin'
                  ? 'border-accent bg-accent/10'
                  : 'border-border bg-card hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/20 text-primary">
                <KeyRound className="h-6 w-6" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-foreground">4-Digit PIN</p>
                <p className="text-xs text-muted-foreground">Quick numeric unlock</p>
              </div>
              {lockMethod === 'pin' && <Check className="h-5 w-5 text-accent" />}
            </button>

            {/* None */}
            <button
              onClick={handleSetNone}
              disabled={loading}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all active:scale-[0.98] ${
                lockMethod === 'none'
                  ? 'border-accent bg-accent/10'
                  : 'border-border bg-card hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-muted text-muted-foreground">
                <ShieldOff className="h-6 w-6" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-foreground">No Lock</p>
                <p className="text-xs text-muted-foreground">Stay signed in without a lock</p>
              </div>
              {lockMethod === 'none' && <Check className="h-5 w-5 text-accent" />}
            </button>
          </div>
        </div>
      )}

      {step === 'pin-enter' && (
        <div className="space-y-6 text-center">
          <p className="text-lg font-semibold text-foreground">Enter a 4-digit PIN</p>
          <PinPad value={pin} target="pin" />
          <Button variant="ghost" onClick={() => { setStep('choose'); setPin(''); }} className="text-muted-foreground">
            Cancel
          </Button>
        </div>
      )}

      {step === 'pin-confirm' && (
        <div className="space-y-6 text-center">
          <p className="text-lg font-semibold text-foreground">Confirm your PIN</p>
          <PinPad value={confirmPin} target="confirm" />
          <Button variant="ghost" onClick={() => { setStep('pin-enter'); setPin(''); setConfirmPin(''); }} className="text-muted-foreground">
            Back
          </Button>
        </div>
      )}
    </AppLayout>
  );
}
