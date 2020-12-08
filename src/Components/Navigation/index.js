import React from 'react'
import './navigation.css'

function Navigation() {
    return (
        <>
            <nav className="flex-container">
                <img src="https://global-uploads.webflow.com/5de6c3f14dd1a7bf391687a4/5e30b3944081802b7050f546_STEEZY_WEB_LOGO.svg" alt="" class="image-14"></img>
                <ul className="flex-1 nav-ul">
                    <li>Programs</li>
                    <li>Feature</li>
                    <li>Styles</li>
                    <li>Instruction</li>
                </ul>
                <div className="flex-2 signup-wrap" >
                    <button className="login" >Login</button>
                    <button className="signup">Sign Up</button>
                </div>
            </nav>
        </>
    )
}
export default Navigation