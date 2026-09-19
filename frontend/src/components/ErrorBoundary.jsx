import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="bg-white border-2 border-red-600 p-8 shadow-hard text-center space-y-4 my-6">
          <div className="w-16 h-16 bg-red-100 border-2 border-red-600 rounded-full flex items-center justify-center mx-auto text-red-600 shadow-[3px_3px_0px_0px_rgba(220,38,38,1)]">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-black text-primary-dark uppercase">
            Terjadi Kendala Memuat Komponen
          </h2>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            {this.props.message || 'Komponen ini mengalami error saat merender data. Kemungkinan server backend sedang dalam proses update atau perlu di-restart.'}
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                if (this.props.onRetry) {
                  this.props.onRetry();
                } else {
                  window.location.reload();
                }
              }}
              className="inline-flex items-center gap-2 bg-primary text-white font-bold text-xs uppercase px-5 py-2.5 border-2 border-primary-dark shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all"
            >
              <RefreshCw size={16} /> Coba Muat Ulang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
