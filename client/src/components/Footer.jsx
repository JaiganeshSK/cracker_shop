import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, MapPin, Phone, MessageSquare, Mail, ShieldCheck, Lock } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Footer = ({ onOpenSafetyModal }) => {
  const { storeSettings } = useCart();

  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 pt-12 pb-24 md:pb-12 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-lg font-extrabold text-white">
                {storeSettings.shopName || 'Sri Krishna Fireworks'}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              {storeSettings.tagline || 'Direct Sivakasi Factory Outlet. Premium Green Fireworks with high safety standards and massive festival discounts.'}
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>100% Certified Green Crackers (CSIR-NEERI Approved)</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Customer Links</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/" className="hover:text-amber-400 transition-colors">
                  Home Page
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-amber-400 transition-colors">
                  Full Fireworks Catalog
                </Link>
              </li>
              <li>
                <Link to="/quick-order" className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1">
                  <span>⚡ Quick Order / Price List Sheet</span>
                </Link>
              </li>
              <li>
                <Link to="/track-order" className="hover:text-amber-400 transition-colors">
                  Track Consignment / Order Status
                </Link>
              </li>
              {onOpenSafetyModal && (
                <li>
                  <button
                    onClick={onOpenSafetyModal}
                    className="hover:text-emerald-400 transition-colors text-left"
                  >
                    Fireworks Safety & Advisory
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Col 3: Factory Address & Contact */}
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Factory Contact</h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {storeSettings.address || 'Factory By-Pass Road, Sivakasi, Tamil Nadu - 626123'}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <a href={`tel:${storeSettings.phone}`} className="hover:text-amber-400">
                  {storeSettings.phone || '+91 94431 23456'}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <a
                  href={`https://wa.me/${storeSettings.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-400 font-semibold"
                >
                  WhatsApp: +{storeSettings.whatsapp}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>{storeSettings.email || 'sales@srikrishnafireworks.com'}</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & Guidelines */}
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Legal Disclaimer</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
              As per Supreme Court and PESO regulations, fireworks sales are strictly compliant with environmental and safety norms. Crackers supplied are genuine Green Fireworks manufactured in Sivakasi. Safe transport via authorized logistics partners only.
            </p>
            <div className="pt-2">
              <Link
                to="/admin/login"
                className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-400 transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Admin Login Portal</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} {storeSettings.shopName || 'Sri Krishna Fireworks'}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-slate-600">Pure WebP & Fast VPS Architecture</span>
            <span className="text-slate-600">•</span>
            <span className="text-amber-500/80 font-medium">Made for Festive Celebrations</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
