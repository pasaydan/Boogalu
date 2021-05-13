import React, { useEffect } from 'react';
import { useHistory } from "react-router-dom";
import boogaluLogo from '../../Images/Boogalu-logo.svg';
import { FaInstagramSquare, FaYoutube, FaFacebookSquare } from 'react-icons/fa';
import * as $ from 'jquery';

function Footer() {
    const history = useHistory();
    
    useEffect(() => {
        setTimeout(() => {
            const pathName = history?.location?.pathname.split('/')[1];
            const footerLinks = document.querySelectorAll('.js-page-links li');

            if (footerLinks && footerLinks.length) {
                footerLinks.forEach((ele) => {
                    const getData = ele.getAttribute('data-name').toLocaleLowerCase();
                    if (pathName?.length && getData.includes(pathName)) {
                        ele.classList.add('active');
                    }
                });
            }

        }, 1000);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function navigatePageLinks(event, path) {
        event.stopPropagation();
        event.perventDefault();
        const footerLinks = document.querySelectorAll('.js-page-links li');
        if (footerLinks && footerLinks.length) {
            footerLinks.forEach((ele) => {
                const getData = ele.getAttribute('data-name').toLocaleLowerCase();
                if (path?.length && getData.includes(path)) {
                    ele.classList.add('active');
                } else {
                    if (ele.classList.contains('active')) {
                        ele.classList.remove('active');    
                    }
                }
            });
        }
        history.push(`/${path}`);
        if (path) {
            setTimeout(() => {
                $('html,body').animate({
                    scrollTop: 0
                }, 700);
            }, 100);
        }
    }

    return (
        <div>
            <footer className="flex-container-VC">
                <div className="footer-logo-wrap">
                    <img src={boogaluLogo} alt="Logo" className="image-7" />
                </div>
                {/* <div className="flex-1">
                    <div className="footer-tagline" >Get the latest dance content &amp; ChoreoCulture news</div>
                    <div className="email-input-inner">
                        <input type="email" placeholder="Email" />
                    </div>
                    <button className="subscribe" >Subscribe</button>
                </div> */}
                <div className="footer-menus">
                    <ul className="menu-lists js-page-links">
                        {/* <li data-name="admin">
                            <a href="/adminpanel" title="Admin panel">Admin panel</a>
                        </li> */}
                        <li data-name="aboutus">
                            <a href="#aboutus" onClick={(e) => navigatePageLinks(e, 'aboutus')} title="about us">About us</a>
                        </li>
                        <li data-name="contactus">
                            <a href="#contactus" onClick={(e) => navigatePageLinks(e, 'contactus')} title="contact us">Contact us</a>
                        </li>
                        <li data-name="pricing">
                            <a href="#pricing" onClick={(e) => navigatePageLinks(e, 'pricing')} title="pricing">Pricing</a>
                        </li>
                        <li data-name="privacypolicy">
                            <a href="#privacypolicy" onClick={(e) => navigatePageLinks(e, 'privacypolicy')} title="privacy policy">Privacy Policy</a>
                        </li>
                        <li data-name="terms">
                            <a href="#terms" onClick={(e) => navigatePageLinks(e, 'termsandconditions')} title="terms and conditions">Terms &amp; Conditions</a>
                        </li>
                        <li data-name="refundpolicy">
                            <a href="#refundpolicy" onClick={(e) => navigatePageLinks(e, 'refundpolicy')} title="refund policy">Cancellation/Refund Policy</a>
                        </li>
                    </ul>
                    <ul className="menu-lists menu-lists-2">
                        <li>
                            <a href="https://www.instagram.com/choreo_culture/?hl=en" title="Follow us on Insta" target="_blank" rel="noreferrer">
                                <i><FaInstagramSquare /></i>
                                <span>Instagram</span>
                            </a>
                        </li>
                        <li>
                            <a href="https://www.youtube.com/user/anjanevents" title="Subscribe our channel" target="_blank" rel="noreferrer">
                                <i><FaYoutube /></i>
                                <span>Youtube</span>
                            </a>
                        </li>
                        <li>
                            <a href="https://www.facebook.com/choreocultureindia/" title="Like our FB page" target="_blank" rel="noreferrer">
                                <i><FaFacebookSquare /></i>
                                <span>Facebook</span>
                            </a>
                        </li>
                    </ul>
                </div>
                <div className="copyright-wrap">
                    &#169; 2021 &nbsp;  
                    <a href="https://www.choreoculture.com/" target="_blank" rel="noreferrer">
                        CHOREOCULTURE STUDIO.
                    </a> ALL RIGHTS RESERVED
                </div>
            </footer>
        </div>
    )
}

export default Footer
