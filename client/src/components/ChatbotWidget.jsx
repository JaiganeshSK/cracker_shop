import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare, X, Send, ArrowRight, ExternalLink,
  Sparkles, FileText, PhoneCall, ShieldCheck, Instagram
} from 'lucide-react';
import { useCart } from '../context/CartContext';

const ChatbotWidget = () => {
  const { storeSettings, setIsPriceListModalOpen } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const widgetRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // If chat widget is explicitly disabled in settings, do not render
  if (storeSettings?.showChatWidget === false) {
    return null;
  }

  const shopName = storeSettings?.shopName || 'Public Store';
  const rawWhatsapp = String(storeSettings?.whatsapp || '').trim();
  const cleanWhatsapp = rawWhatsapp.replace(/\D/g, '');
  const rawInstagram = String(storeSettings?.instagram || '').trim();

  // Format WhatsApp URL
  const whatsappUrl = cleanWhatsapp
    ? `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(`Hello ${shopName}, I have a question about cracker orders`)}`
    : null;

  // Format Instagram URL & Display Handle
  let instagramUrl = null;
  let instagramDisplay = '';
  if (rawInstagram) {
    if (rawInstagram.startsWith('http://') || rawInstagram.startsWith('https://')) {
      instagramUrl = rawInstagram;
      const parts = rawInstagram.split('/').filter(Boolean);
      instagramDisplay = parts[parts.length - 1] ? `@${parts[parts.length - 1]}` : '@instagram';
    } else {
      const cleanHandle = rawInstagram.replace(/^@/, '').trim();
      instagramUrl = `https://instagram.com/${cleanHandle}`;
      instagramDisplay = `@${cleanHandle}`;
    }
  }

  const greeting =
    storeSettings?.chatWidgetGreeting ||
    `Hello! Welcome to ${shopName}. How can we assist you with crackers, discounts, or placing your order today?`;

  return (
    <div ref={widgetRef} className="fixed bottom-20 md:bottom-6 right-3 md:right-6 z-40 no-print font-sans">
      {/* ── Chat Popover Window ─────────────────────────────────────────── */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[320px] sm:w-[360px] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-slate-950 px-4 py-3.5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
                <MessageSquare className="w-4 h-4" />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-950" />
              </div>
              <div>
                <div className="text-sm font-bold text-white tracking-tight leading-tight">
                  {shopName} Support
                </div>
                <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Online • Quick Response</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3.5 max-h-[70vh] overflow-y-auto bg-slate-900/95">
            {/* Assistant Welcome Message */}
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 text-xs font-black mt-0.5">
                ✦
              </div>
              <div className="flex-1 bg-slate-800/80 border border-slate-700/60 rounded-2xl rounded-tl-sm p-3 text-xs text-slate-200 leading-relaxed shadow-sm">
                <p>{greeting}</p>
                <div className="text-[10px] text-slate-400 mt-2 font-mono">
                  Select a contact channel below to chat instantly:
                </div>
              </div>
            </div>

            {/* Channel 1: WhatsApp Support */}
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-3 rounded-xl bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-500/30 hover:border-emerald-400/60 transition-all text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 group-hover:scale-105 transition-transform">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Chat on WhatsApp</span>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-semibold uppercase">
                        Instant
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {rawWhatsapp || 'Click to message'}
                    </div>
                  </div>
                </div>

                <div className="w-7 h-7 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-400 transition-colors shadow-sm ml-2">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </a>
            ) : (
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs text-slate-400 text-center">
                WhatsApp contact not yet configured
              </div>
            )}

            {/* Channel 2: Instagram Support */}
            {instagramUrl ? (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-3 rounded-xl bg-pink-950/20 hover:bg-pink-900/30 border border-pink-500/30 hover:border-pink-400/60 transition-all text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Instagram className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Message on Instagram</span>
                      <span className="text-[9px] bg-pink-500/20 text-pink-300 px-1.5 py-0.2 rounded font-semibold uppercase">
                        DM
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {instagramDisplay || 'Direct Message'}
                    </div>
                  </div>
                </div>

                <div className="w-7 h-7 rounded-lg bg-pink-500 text-white flex items-center justify-center flex-shrink-0 group-hover:bg-pink-400 transition-colors shadow-sm ml-2">
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </a>
            ) : (
              <div className="p-2.5 rounded-xl bg-slate-800/30 border border-slate-700/30 text-[11px] text-slate-500 text-center">
                Instagram handle can be configured in Admin Settings
              </div>
            )}

            {/* Quick Option: Wholesale Rate List PDF */}
            {storeSettings?.priceListUrl && storeSettings?.showPriceListNotice !== false && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsPriceListModalOpen(true);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-amber-300 border border-amber-500/25 hover:border-amber-500/40 transition-all text-left text-xs font-medium"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>View Wholesale Price List (PDF)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800 text-center text-[10px] text-slate-500">
            Direct customer service • Powered by {shopName}
          </div>
        </div>
      )}

      {/* ── Floating Launcher Button ────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-12 h-12 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-200 active:scale-95 ${
          isOpen
            ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
            : 'bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/40 hover:border-amber-400 shadow-slate-950/80'
        }`}
        title={isOpen ? 'Close support chat' : 'Open live support chat'}
        aria-label={isOpen ? 'Close support chat' : 'Open live support chat'}
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <>
            <MessageSquare className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
          </>
        )}
      </button>
    </div>
  );
};

export default ChatbotWidget;
