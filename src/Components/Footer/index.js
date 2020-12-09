import React from 'react'
import './footer.css'

function Footer() {
    return (
        <div>
            <footer className="flex-container-VC">
                <div className="flex-1 copyright-wrap">
                    <div><img src="https://global-uploads.webflow.com/5dbb40d6d8c97447e9450447/5e604560e2c5a570b6d92ae1_STEEZY_LOGOMARK.svg" alt="" className="image-7" /></div>
                    <div>&#169; 2020 STEEZY STUDIO.</div>
                    <div>ALL RIGHTS RESERVED.</div>
                </div>
                <div className="flex-1">
                    <div className="footer-tagline" >Get the latest dance content & STEEZY news</div>
                    <div>
                        <input type="email" placeholder="Email" />
                    </div>
                    <button className="subscribe" >Subscribe</button>
                </div>
                <div className="flex-1"></div>
                <ul className="flex-1">
                    <li>Blog</li>
                    <li>Careers</li>
                    <li>Support</li>
                    <li>Terms</li>
                </ul>
                <ul className="flex-1">
                    <li>Instagram</li>
                    <li>Twitter</li>
                    <li>Youtube</li>
                    <li>Facebook</li>
                </ul>
            </footer>
        </div>
    )
}

export default Footer
