import React from 'react';
import { useSocket } from '../context/SocketContext.jsx';
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useSocket();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => {
        const isCritical = toast.type === 'critical';
        const isSuccess = toast.type === 'success';
        const isEmergency = toast.type === 'emergency';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl border transition-all transform duration-300 animate-slide-in ${
              isCritical
                ? 'bg-red-950/95 border-red-500 text-red-100 ring-2 ring-red-500/50'
                : isEmergency
                ? 'bg-amber-950/95 border-amber-500 text-amber-100 ring-2 ring-amber-500/50'
                : isSuccess
                ? 'bg-emerald-950/95 border-emerald-500 text-emerald-100 ring-1 ring-emerald-500/40'
                : 'bg-slate-900/95 border-slate-700 text-slate-100'
            }`}
          >
            <div className="mt-0.5 flex-shrink-0">
              {isCritical ? (
                <AlertCircle className="w-6 h-6 text-red-400 animate-pulse" />
              ) : isEmergency ? (
                <AlertTriangle className="w-6 h-6 text-amber-400 animate-bounce" />
              ) : isSuccess ? (
                <CheckCircle className="w-6 h-6 text-emerald-400" />
              ) : (
                <Info className="w-6 h-6 text-blue-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold tracking-tight">{toast.title}</h4>
              <p className="text-xs mt-1 text-slate-300 leading-relaxed">{toast.message}</p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
