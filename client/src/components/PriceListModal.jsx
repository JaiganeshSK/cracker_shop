import React, { useEffect } from 'react';
import { X, Download, ExternalLink, FileText, Sparkles, Printer } from 'lucide-react';
import { useCart } from '../context/CartContext';

const PriceListModal = ({ isOpen, onClose, customUrl = null, customName = null }) => {
  const { storeSettings } = useCart();

  const pdfUrl = customUrl || storeSettings?.priceListUrl || '';
  const fileName = customName || storeSettings?.priceListFileName || `${storeSettings?.shopName || 'Wholesale'}-Price-List.pdf`;

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !pdfUrl) return null;

  const handlePrint = () => {
    const iframe = document.getElementById('price-list-iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } else {
      window.open(pdfUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-200">
        
        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-3.5 bg-slate-900/90 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                  Wholesale Price List &amp; Rate Card
                </h3>
                <span className="hidden xs:inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded">
                  <Sparkles className="w-2.5 h-2.5" />
                  PDF
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">
                {storeSettings?.shopName || 'Public Store'} • Official Wholesale Rates
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              onClick={handlePrint}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Print Price List"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Open PDF in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>New Tab</span>
            </a>

            <a
              href={pdfUrl}
              download={fileName}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all active:scale-95"
              title="Download PDF to device"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Viewer Body */}
        <div className="relative flex-1 bg-slate-950 p-2 sm:p-3 overflow-hidden min-h-[50vh] sm:min-h-[65vh]">
          <iframe
            id="price-list-iframe"
            src={`${pdfUrl}#toolbar=1&navpanes=0&view=FitH`}
            className="w-full h-full rounded-xl border border-slate-800 bg-white"
            title="Price List PDF Preview"
          />

          {/* Mobile and Fallback Notice Bar */}
          <div className="sm:hidden absolute bottom-3 left-3 right-3 bg-slate-900/90 backdrop-blur border border-slate-700 rounded-xl p-2.5 flex items-center justify-between shadow-xl">
            <span className="text-[11px] text-slate-300 font-medium">
              View or save full PDF
            </span>
            <a
              href={pdfUrl}
              download={fileName}
              className="px-3 py-1 bg-amber-500 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              Download
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceListModal;
