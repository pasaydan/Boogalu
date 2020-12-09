import React, { useEffect, useContext, useState } from 'react';
import './navigation.css'
import { useHistory } from "react-router-dom";

function Navigation() {
    const history = useHistory();

    return (
        <>
            <nav className="flex-container">
                <img onClick={() => history.push('/')} src="https://global-uploads.webflow.com/5de6c3f14dd1a7bf391687a4/5e30b3944081802b7050f546_STEEZY_WEB_LOGO.svg" alt="" className="image-14"></img>
                <ul className="flex-1 nav-ul">
                    <li><a href="#Programs">Programs</a></li>
                    <li><a href="#Features">Features</a></li>
                    <li><a href="#Styles">Styles</a></li>
                    <li><a href="#Instructions">Instructions</a></li>
                </ul>
                <div className="flex-2 signup-wrap" >
                    <button className="login" onClick={() => history.push('/login')}>Login</button>
                    <button className="signup">Sign Up</button>
                </div>
            </nav>
        </>
    )
}
export default Navigation