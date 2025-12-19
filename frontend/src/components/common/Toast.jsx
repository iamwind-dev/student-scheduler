/**
 * TOAST NOTIFICATION COMPONENT
 * Simple toast notifications for user feedback
 */

import React, { useEffect, useState, useCallback } from 'react';
import { CheckIcon, ErrorIcon, InfoIcon, WarningIcon } from './Icons';
import './Toast.css';

const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icons = {
        success: <CheckIcon size={18} />,
        error: <ErrorIcon size={18} />,
        info: <InfoIcon size={18} />,
        warning: <WarningIcon size={18} />
    };

    return (
        <div className={`toast toast-${type} ${isVisible ? 'toast-show' : 'toast-hide'}`}>
            <span className="toast-icon">{icons[type]}</span>
            <span className="toast-message">{message}</span>
        </div>
    );
};

// Toast Container Component
export const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    duration={toast.duration}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
};

// Toast Hook for easy usage
export const useToast = () => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'success', duration = 3000) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type, duration }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const showSuccess = useCallback((msg) => addToast(msg, 'success'), [addToast]);
    const showError = useCallback((msg) => addToast(msg, 'error'), [addToast]);
    const showInfo = useCallback((msg) => addToast(msg, 'info'), [addToast]);
    const showWarning = useCallback((msg) => addToast(msg, 'warning'), [addToast]);

    return {
        toasts,
        addToast,
        removeToast,
        showSuccess,
        showError,
        showInfo,
        showWarning
    };
};

export default Toast;
