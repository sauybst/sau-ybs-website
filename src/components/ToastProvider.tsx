"use client";

import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

    // Bileşen unmount olduğunda tüm timer'ları temizle
    useEffect(() => {
        return () => {
            timers.current.forEach((timer) => clearTimeout(timer));
            timers.current.clear();
        };
    }, []);

    const removeToast = useCallback((id: number) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
        const timer = timers.current.get(id);
        if (timer) {
            clearTimeout(timer);
            timers.current.delete(id);
        }
    }, []);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);

        // 3 saniye sonra otomatik kaldır
        const timer = setTimeout(() => {
            removeToast(id);
        }, 3000);
        timers.current.set(id, timer);
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Bildirimlerin Ekranda Görüneceği Alan (Sağ Alt Köşe) */}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                {toasts.map((toast) => (
                    <div 
                        key={toast.id} 
                        className={`pointer-events-auto flex items-center w-full max-w-sm p-4 bg-white rounded-2xl shadow-2xl border-l-4 transform transition-all duration-500 ease-out translate-y-0 opacity-100 ${
                            toast.type === 'success' ? 'border-green-500' : 
                            toast.type === 'error' ? 'border-red-500' : 
                            'border-brand-500'
                        }`}
                    >
                        <div className="flex-shrink-0">
                            {toast.type === 'success' && <CheckCircle className="w-6 h-6 text-green-500" />}
                            {toast.type === 'error' && <XCircle className="w-6 h-6 text-red-500" />}
                            {toast.type === 'info' && <Info className="w-6 h-6 text-brand-500" />}
                        </div>
                        <div className="ml-3 text-sm font-semibold text-slate-700">
                            {toast.message}
                        </div>
                        <button 
                            onClick={() => removeToast(toast.id)} 
                            className="ml-auto -mx-1.5 -my-1.5 text-gray-400 hover:text-gray-900 rounded-lg p-1.5 hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

// Diğer sayfalarda kullanmak için Custom Hook
export const useToast = () => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};