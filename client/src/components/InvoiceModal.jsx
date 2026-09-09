import React, { useRef } from 'react';
import { Printer, X, Download, Check } from 'lucide-react';
import InvoiceDocument from './InvoiceDocument';
import { printInvoice } from '../utils/printInvoice';

const InvoiceModal = ({ isOpen, onClose, order, storeSettings }) => {
  const invoiceRef = useRef(null);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    printInvoice(order, storeSettings);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col h-[90vh] max-h-[90vh] overflow-hidden">
        {/* Top Control Bar (Screen only, completely hidden in print) */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-900 border-b border-slate-800 text-white no-print">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span>Tax Invoice</span>
                <span className="text-amber-400 font-mono text-xs sm:text-sm font-semibold">
                  #{order.orderId}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Professional Sivakasi Factory Direct Invoice &bull; Print-Ready A4 Format
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              type="button"
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Paper Container for Screen Preview */}
        <div
          className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-6 bg-slate-950/80 invoice-scroll-area"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="w-full max-w-[210mm] mx-auto shadow-2xl rounded-sm border border-slate-300 bg-white">
            <InvoiceDocument
              order={order}
              storeSettings={storeSettings}
              invoiceRef={invoiceRef}
            />
          </div>
        </div>

        {/* Bottom Helper Bar (Screen only) */}
        <div className="flex-shrink-0 px-4 sm:px-6 py-2.5 bg-slate-900 border-t border-slate-800 text-slate-400 text-xs flex justify-between items-center no-print">
          <span className="text-[11px]">
            Tip: In the print dialog, select <strong className="text-slate-200">Save as PDF</strong> to generate a digital PDF copy.
          </span>
          <button
            onClick={onClose}
            className="text-xs text-slate-300 hover:text-white font-medium underline cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
