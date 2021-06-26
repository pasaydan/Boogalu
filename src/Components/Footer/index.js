import React, { useEffect } from 'react';
import { useHistory } from "react-router-dom";
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
        event.preventDefault();
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
                <div className="footer-menus">
                    <ul className="menu-lists js-page-links">
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
                            <a href="https://www.instagram.com/boogaluapp/" title="Follow us on Insta" target="_blank" rel="noreferrer">
                                <i><FaInstagramSquare /></i>
                                <span>Instagram</span>
                            </a>
                        </li>
                        <li>
                            <a href="https://www.youtube.com/channel/UCne7xnq9qwMsDUNg5lzNnmw" title="Subscribe our channel" target="_blank" rel="noreferrer">
                                <i><FaYoutube /></i>
                                <span>Youtube</span>
                            </a>
                        </li>
                        <li>
                            <a href="https://www.facebook.com/profile.php?id=100069963219467" title="Like our FB page" target="_blank" rel="noreferrer">
                                <i><FaFacebookSquare /></i>
                                <span>Facebook</span>
                            </a>
                        </li>
                    </ul>
                </div>
                <div className="copyright-wrap">
                    &#169; 2021 &nbsp;  
                    BOOGALUU,&nbsp;
                    ALL RIGHTS RESERVED
                </div>
            </footer>
        </div>
    )
}

export default Footer
