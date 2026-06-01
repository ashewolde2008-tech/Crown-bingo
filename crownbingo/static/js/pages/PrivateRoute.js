import React from 'react';
import {
    Navigate
} from 'react-router-dom';

const PrivateRoute = ({
    children
}) => {
    const isSessionActive = () => {
        const sessionExpiration = localStorage.getItem('sessionExpiration');
        if (!sessionExpiration) return false;
        return new Date().getTime() < parseInt(sessionExpiration, 10);
    };

    // Redirect to login page if the session is inactive
    return isSessionActive() ? children : < Navigate to = "/"
    replace / > ;
};

export default PrivateRoute;