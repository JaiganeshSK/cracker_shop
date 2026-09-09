import React from 'react';
import { X, ShieldAlert, CheckCircle2, AlertTriangle, Phone, Flame } from 'lucide-react';
import { useCart } from '../context/CartContext';

const SafetyModal = ({ isOpen, onClose }) => {
  const { storeSettings } = useCart();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 text-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Fireworks Safety & Green Guidelines</h3>
              <p className="text-xs text-slate-400">CSIR-NEERI Certified Green Crackers Advisory</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certified Green Notice */}
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-xs text-emerald-300 flex items-start gap-3">
          <Flame className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">100% Certified Green Crackers</span>
            <p className="text-emerald-300/80 mt-1 leading-relaxed">
              All fireworks supplied from {storeSettings?.shopName || 'Sri Krishna Fireworks Sivakasi'} are manufactured under PESO licensed formulations with reduced particulate emissions (SWAS, STAR, SAFAL) in compliance with Supreme Court directives.
            </p>
          </div>
        </div>

        {/* Dos and Don'ts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* DOs */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
              <CheckCircle2 className="w-4 h-4" />
              <span>Safety DOs</span>
            </div>
            <ul className="space-y-2 text-slate-300">
              <li>• Always ignite crackers outdoors in wide open spaces away from buildings.</li>
              <li>• Keep a bucket of clean water and sand nearby for quick safety.</li>
              <li>• Always light sparklers, flowerpots, and aerial fireworks with an extended incense stick (agarbatti).</li>
              <li>• Ensure adult supervision when children light sparklers or chakkars.</li>
            </ul>
          </div>

          {/* DONTs */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-rose-400 font-bold uppercase tracking-wider text-[11px]">
              <AlertTriangle className="w-4 h-4" />
              <span>Safety DONTs</span>
            </div>
            <ul className="space-y-2 text-slate-300">
              <li>• Never hold crackers in hand while lighting them.</li>
              <li>• Never bend over fireworks when igniting the fuse.</li>
              <li>• If a cracker fails to burst, never approach it immediately. Wait 15 minutes and douse with water.</li>
              <li>• Never ignite fireworks near electric cables, parking lots, or dry grass.</li>
            </ul>
          </div>
        </div>

        {/* Emergency Info */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-amber-400" />
            <span>Emergency Services: 101 (Fire) / 108 (Ambulance)</span>
          </span>
          <button
            onClick={onClose}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl transition-all"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default SafetyModal;
