import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const DisclaimerModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const isAdminRoute = location.pathname.startsWith('/admin');
    const shown = sessionStorage.getItem('disclaimerShown');
    
    if (!shown && !isAdminRoute) {
      setIsOpen(true);
      sessionStorage.setItem('disclaimerShown', 'true');
      
      const timer = setTimeout(() => {
        setIsOpen(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-4 text-slate-200 animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Important Notice</h3>
              <p className="text-xs text-amber-400">Please read carefully</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-sm text-slate-300 leading-relaxed space-y-3">
          <p>
            <strong className="text-rose-400">As per 2018 supreme court order, online sale of firecrackers are not permitted!</strong> We value our customers and at the same time, respect jurisdiction.
          </p>
          <p>
            We request you to add your products to the cart and submit the required crackers through the enquiry button. We will contact you within 24 hrs and confirm the order through WhatsApp or phone call. Please add and submit your enquiries and enjoy your Diwali with <strong className="text-amber-400">ANITCHA CRACKERS</strong>.
          </p>
          <p>
            As a company following 100% legal & statutory compliances and all our shops, go-downs are maintained as per the explosive acts. We send the parcels through registered and legal transport service providers as like every other major companies in Sivakasi is doing so.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerModal;
