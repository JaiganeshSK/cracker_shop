import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled runtime error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[50vh] flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full glass-panel p-6 sm:p-8 rounded-2xl border border-rose-500/20 text-center space-y-5 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Temporary Display Issue
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                We encountered an unexpected display issue while rendering this section. Your cart and order details are safe.
              </p>
            </div>

            {/* Error diagnostics (collapsible) */}
            {this.state.error && (
              <details className="text-left bg-slate-950/80 rounded-xl p-3 border border-slate-800 text-[11px] text-slate-400 cursor-pointer">
                <summary className="font-semibold text-slate-300">Technical Details</summary>
                <div className="mt-2 font-mono text-[10px] text-rose-300 overflow-x-auto break-all">
                  {this.state.error.toString()}
                </div>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload View</span>
              </button>

              <button
                type="button"
                onClick={() => { window.location.href = '/'; }}
                className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return to Store</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
