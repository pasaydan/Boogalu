import React from 'react';
import boogaluLogo from '../../Images/Boogalu-logo.svg';

function Footer() {
    return (
        <div>
            <footer className="flex-container-VC">
                <div className="flex-1 copyright-wrap">
                    <div className="footer-logo-wrap">
                        <img src={boogaluLogo} alt="Logo" className="image-7" />
                    </div>
                    <div className="copyright-inner">
                        &#169; 2021 &nbsp;  
                        <a href="https://www.choreoculture.com/" target="_blank">
                            CHOREOCULTURE STUDIO.
                        </a>
                        <div>ALL RIGHTS RESERVED.</div>
                    </div>
                </div>
                <div className="flex-1">
                    <div className="footer-tagline" >Get the latest dance content &amp; ChoreoCulture news</div>
                    <div className="email-input-inner">
                        <input type="email" placeholder="Email" />
                    </div>
                    <button className="subscribe" >Subscribe</button>
                </div>
                <div className="footer-menus flex-1">
                    <ul className="menu-lists flex-1">
                        <li>Blog</li>
                        <li>Careers</li>
                        <li>Support</li>
                        <li>Terms</li>
                    </ul>
                    <ul className="menu-lists menu-lists-2 flex-1">
                        <li>Instagram</li>
                        <li>Twitter</li>
                        <li>Youtube</li>
                        <li>Facebook</li>
                    </ul>
                </div>
            </footer>
        </div>
    )
}

export default Footer
