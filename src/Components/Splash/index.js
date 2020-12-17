import React from 'react';
import boogaluLogo from '../../Images/Boogalu-logo.svg';
import './splashscreen.css';

function SplashScreen() {
    return (
        <div className="splash-screen-wrap">
            <div className="logo-wrap">
                <img src={boogaluLogo} alt="Boogalu" />
            </div>
        </div>
    )
}

export default SplashScreen;
