import { useState, useEffect } from 'react';

const STORAGE_KEY = 'wanshape-cookie-consent';

type Consent = 'accepted' | 'refused' | null;

function getConsent(): Consent {
  const v = localStorage.getItem(STORAGE_KEY);
  if (v === 'accepted' || v === 'refused') return v;
  return null;
}

function loadAdSense() {
  if (document.querySelector('script[src*="adsbygoogle"]')) return;
  const s = document.createElement('script');
  s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8350548712670804';
  s.async = true;
  s.crossOrigin = 'anonymous';
  document.head.appendChild(s);
}

export function CookieConsent() {
  const [consent, setConsent] = useState<Consent>(getConsent);

  useEffect(() => {
    if (consent === 'accepted') loadAdSense();
  }, [consent]);

  if (consent !== null) return null;

  function handleChoice(choice: 'accepted' | 'refused') {
    localStorage.setItem(STORAGE_KEY, choice);
    setConsent(choice);
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
      <div className="mx-auto max-w-lg bg-[#1a1a23] border border-white/10 rounded-2xl shadow-2xl p-5 space-y-4">
        <div>
          <h3 className="text-white font-semibold text-base mb-1">Cookies & publicites</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            WAN SHAPE est 100% gratuit. On utilise des cookies pour afficher
            des publicites qui financent le service.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => handleChoice('refused')}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-400 bg-white/5 border border-white/10 active:scale-[0.97] transition-all"
          >
            Refuser
          </button>
          <button
            onClick={() => handleChoice('accepted')}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-500 shadow-lg shadow-indigo-500/25 active:scale-[0.97] transition-all"
          >
            Accepter
          </button>
        </div>


      </div>
    </div>
  );
}
