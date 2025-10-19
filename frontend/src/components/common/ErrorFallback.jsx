/**
 * ERROR FALLBACK COMPONENT
 * Error boundary fallback component for graceful error handling
 */

import React from 'react';
import PropTypes from 'prop-types';
import './ErrorFallback.css';

const ErrorFallback = ({ error, resetErrorBoundary, resetKeys = [] }) => {
    const handleReload = () => {
        window.location.reload();
    };

    const handleGoHome = () => {
        window.location.href = '/';
    };

    const handleReport = () => {
        // In production, send error report to logging service
        console.error('Error reported:', error);

        // Could integrate with error reporting service like Sentry
        if (window.gtag) {
            window.gtag('event', 'exception', {
                description: error.message,
                fatal: true
            });
        }
    };

    return (
        <div className="error-fallback">
            <div className="error-container">
                <div className="error-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M12 2L2 22h20L12 2z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M12 9v4"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                        <path
                            d="M12 17h.01"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    </svg>
                </div>

                <div className="error-content">
                    <h1 className="error-title">
                        Oops! Có lỗi xảy ra
                    </h1>

                    <p className="error-description">
                        Ứng dụng đã gặp phải một lỗi không mong muốn.
                        Chúng tôi xin lỗi vì sự bất tiện này.
                    </p>

                    {process.env.NODE_ENV === 'development' && error && (
                        <details className="error-details">
                            <summary>Chi tiết lỗi (Development)</summary>
                            <div className="error-stack">
                                <strong>Lỗi:</strong> {error.message}
                                <br />
                                <strong>Stack:</strong>
                                <pre>{error.stack}</pre>
                            </div>
                        </details>
                    )}
                </div>

                <div className="error-actions">
                    {resetErrorBoundary && (
                        <button
                            className="btn btn-primary"
                            onClick={resetErrorBoundary}
                        >
                            🔄 Thử lại
                        </button>
                    )}

                    <button
                        className="btn btn-secondary"
                        onClick={handleReload}
                    >
                        ↻ Tải lại trang
                    </button>

                    <button
                        className="btn btn-outline"
                        onClick={handleGoHome}
                    >
                        🏠 Về trang chủ
                    </button>
                </div>

                <div className="error-footer">
                    <button
                        className="btn btn-text btn-sm"
                        onClick={handleReport}
                    >
                        📤 Báo cáo lỗi
                    </button>

                    <span className="error-id">
                        ID: {Date.now().toString(36)}
                    </span>
                </div>
            </div>
        </div>
    );
};

ErrorFallback.propTypes = {
    error: PropTypes.shape({
        message: PropTypes.string,
        stack: PropTypes.string
    }),
    resetErrorBoundary: PropTypes.func,
    resetKeys: PropTypes.array
};

export default ErrorFallback;
