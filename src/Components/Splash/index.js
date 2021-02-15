import React from 'react';
import boogaluLogo from '../../Images/Boogalu-logo.svg';

function SplashScreen() {
    return (
        <div className="splash-screen-wrap">
            <span id="splash-overlay" class="splash"></span>
            <span id="welcome" class="z-depth-4"></span>
            <div className="logo-wrap">
                <img src={boogaluLogo} alt="Boogalu" />
            </div>
        </div>
    )
}

export default SplashScreen;
