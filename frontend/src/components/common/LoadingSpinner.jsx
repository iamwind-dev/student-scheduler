/**
 * LOADING SPINNER COMPONENT
 * Reusable loading indicator with multiple variants
 */

import React from 'react';
import PropTypes from 'prop-types';
import './LoadingSpinner.css';

const LoadingSpinner = ({
    size = 'medium',
    variant = 'primary',
    fullscreen = false,
    message = 'Đang tải...',
    overlay = false
}) => {
    const spinnerClasses = [
        'loading-spinner',
        `spinner-${size}`,
        `spinner-${variant}`,
        fullscreen && 'spinner-fullscreen',
        overlay && 'spinner-overlay'
    ].filter(Boolean).join(' ');

    const SpinnerElement = () => (
        <div className={spinnerClasses}>
            <div className="spinner-container">
                <div className="spinner-circle">
                    <div className="spinner-inner"></div>
                </div>
                {message && (
                    <div className="spinner-message">
                        {message}
                    </div>
                )}
            </div>
        </div>
    );

    if (fullscreen) {
        return (
            <div className="spinner-fullscreen-wrapper">
                <SpinnerElement />
            </div>
        );
    }

    return <SpinnerElement />;
};

LoadingSpinner.propTypes = {
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    variant: PropTypes.oneOf(['primary', 'secondary', 'accent']),
    fullscreen: PropTypes.bool,
    message: PropTypes.string,
    overlay: PropTypes.bool
};

export default LoadingSpinner;
