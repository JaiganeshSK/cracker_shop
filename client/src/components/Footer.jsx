import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, MapPin, Phone, MessageSquare, Mail, ShieldCheck, Lock, ListOrdered, LayoutGrid } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Footer = ({ onOpenSafetyModal }) => {
  const { storeSettings } = useCart();

  return (
    <footer className="relative z-20 bg-[#080c14] border-t border-white/[0.08] text-slate-400 text-sm">

      {/* Main Footer Body with generous bottom padding to prevent clipping by bottom bars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-48 sm:pb-40 md:pb-32 pb-safe">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Col 1: Brand */}
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 mb-4">
              {storeSettings.logoUrl ? (
                <div className="h-9 max-w-[130px] flex items-center flex-shrink-0">
                  <img
                    src={storeSettings.logoUrl}
                    alt={storeSettings.shopName || 'Store Logo'}
                    className="max-h-full max-w-full object-contain rounded"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-[#d4a017] flex items-center justify-center flex-shrink-0">
                  <Flame className="w-4 h-4 text-[#080c14] fill-current" />
                </div>
              )}
              <span className="text-base font-bold text-white leading-tight break-words">
                {storeSettings.shopName || 'Sri Krishna Fireworks'}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-5 break-words">
              {storeSettings.tagline || 'Direct Sivakasi Factory Outlet. Premium Green Fireworks with high safety standards and massive festival discounts.'}
            </p>
            {/* WhatsApp CTA */}
            <a
              href={`https://wa.me/${storeSettings.whatsapp}?text=Hello%20Sri%20Krishna%20Fireworks,%20I%20want%20to%20place%20an%20order`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 border border-emerald-500/30 px-3.5 py-2 rounded-lg hover:bg-emerald-500/10 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Chat on WhatsApp
            </a>
          </div>

          {/* Col 2: Quick Links */}
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest mb-4">Quick Links</h4>
            <ul className="space-y-3 text-xs">
              <li>
                <Link to="/" className="flex items-center gap-2 text-gold-400 hover:text-gold-300 font-semibold transition-colors">
                  <ListOrdered className="w-3.5 h-3.5" />
                  Quick Order Sheet
                </Link>
              </li>
              <li>
                <Link to="/products" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                  <LayoutGrid className="w-3.5 h-3.5" />
                  Products Catalog
                </Link>
              </li>
              <li>
                <Link to="/track-order" className="text-slate-400 hover:text-white transition-colors">
                  Track My Order
                </Link>
              </li>
              {onOpenSafetyModal && (
                <li>
                  <button
                    onClick={onOpenSafetyModal}
                    className="text-emerald-400/90 hover:text-emerald-300 transition-colors text-left flex items-center gap-2"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Safety Advisory
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Col 3: Contact */}
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest mb-4">Contact Us</h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed break-words text-slate-300">
                  {storeSettings.address || 'Factory By-Pass Road, Sivakasi, Tamil Nadu – 626123'}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <a href={`tel:${storeSettings.phone}`} className="hover:text-white font-medium text-slate-300 transition-colors break-words">
                  {storeSettings.phone || '+91 94431 23456'}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <a
                  href={`https://wa.me/${storeSettings.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-300 text-emerald-400 font-medium transition-colors break-words"
                >
                  WhatsApp: +{storeSettings.whatsapp}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <span className="text-slate-300 break-words">{storeSettings.email || 'sales@srikrishnafireworks.com'}</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal */}
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest mb-4">Legal</h4>
            <div className="flex items-start gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-3 py-2.5 rounded-lg mb-4">
              <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>100% Green Certified (CSIR-NEERI)</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-4 break-words">
              All products comply with Supreme Court &amp; PESO regulations. Transport via authorised logistics partners only.
            </p>
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              Admin Portal
            </Link>
          </div>
        </div>

        {/* Bottom Bar — Clearly visible text, not cut off */}
        <div className="pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>© {new Date().getFullYear()} {storeSettings.shopName || 'Sri Krishna Fireworks'}. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <span>Sivakasi Factory Direct</span>
            <span className="text-slate-600">·</span>
            <span className="text-gold-400 font-semibold">Made for Celebrations</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
