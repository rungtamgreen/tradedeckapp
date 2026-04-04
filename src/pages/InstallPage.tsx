import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Download, CheckCircle, Share, ArrowLeft } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPage() {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);

    const installedHandler = () => setIsInstalled(true);
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setDeferredPrompt(null);
  };

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
      <button onClick={() => navigate('/')} className="absolute top-4 left-4 p-2 touch-target">
        <ArrowLeft className="h-6 w-6 text-foreground" />
      </button>

      <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center mb-6">
        <Download className="h-10 w-10 text-primary-foreground" />
      </div>

      {isInstalled ? (
        <>
          <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">App Installed!</h1>
          <p className="text-muted-foreground mb-6">JobDeck is on your home screen. Open it anytime like a real app.</p>
          <Button size="lg" className="h-14 text-lg px-8" onClick={() => navigate('/')}>
            Open App
          </Button>
        </>
      ) : isIOS ? (
        <>
          <h1 className="text-2xl font-bold text-foreground mb-2">Install JobDeck</h1>
          <p className="text-muted-foreground mb-6">Add this app to your home screen for instant access.</p>
          <div className="bg-card border border-border rounded-xl p-6 text-left space-y-4 w-full max-w-sm">
            <div className="flex items-start gap-3">
              <span className="bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shrink-0">1</span>
              <p className="text-foreground text-sm">Tap the <Share className="inline h-4 w-4" /> <strong>Share</strong> button in Safari</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shrink-0">2</span>
              <p className="text-foreground text-sm">Scroll down and tap <strong>"Add to Home Screen"</strong></p>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shrink-0">3</span>
              <p className="text-foreground text-sm">Tap <strong>"Add"</strong> — that's it!</p>
            </div>
          </div>
        </>
      ) : deferredPrompt ? (
        <>
          <h1 className="text-2xl font-bold text-foreground mb-2">Install JobDeck</h1>
          <p className="text-muted-foreground mb-6">Get instant access from your home screen. No app store needed.</p>
          <Button
            size="lg"
            className="h-16 text-lg px-10 bg-accent text-accent-foreground hover:bg-accent/90 active:scale-[0.97] transition-transform"
            onClick={handleInstall}
          >
            <Download className="h-6 w-6 mr-2" />
            Install App
          </Button>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-foreground mb-2">Install TradeFlow</h1>
          <p className="text-muted-foreground mb-6">Open this page in Chrome or Safari, then use the browser menu to add it to your home screen.</p>
        </>
      )}
    </div>
  );
}
