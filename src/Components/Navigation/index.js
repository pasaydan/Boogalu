import React, { useState, useEffect, useRef } from 'react';
import { FaHome, FaBookReader, FaCloudUploadAlt, FaTrophy, FaStaylinked } from 'react-icons/fa';
import boogaluLogo from '../../Images/Boogalu-logo.svg';
import { useHistory } from "react-router-dom";
import { useStoreConsumer } from '../../Providers/StateProvider';
import { logoutUser } from '../../Actions/User';
import AccountCircleOutlinedIcon from '@material-ui/icons/AccountCircleOutlined';
import * as $ from 'jquery';
const SCROLL_TOP_LIMIT = 200;
function Navigation() {
    const [goingUpClass, setGoingUpClass] = useState('');
    const [didMount, setDidMount] = useState(false);
    const [isMobile, toggleMobile] = useState(false);
    const [goingDownClass, setGoingDownClass] = useState('');
    const [showProfileTab, setShowProfileTab] = useState(false);
    const ref = useRef();
    const mobilHomelinkRef = useRef();
    const history = useHistory();
    const { state, dispatch } = useStoreConsumer();
    useOnClickOutside(ref, () => setShowProfileTab(false));

    useEffect(() => {
        setDidMount(true);

        let windowViewPortWidth = window.innerWidth;
        if (windowViewPortWidth > 1023) {
            toggleMobile(false);
        } else {
            toggleMobile(true);
        }

        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY < SCROLL_TOP_LIMIT) {
                setGoingUpClass('');
                setGoingDownClass('');
            } else {
                setGoingUpClass('scrolled-up');
                setTimeout(() => {
                    setGoingDownClass('scrolled-down');
                }, 200);
            }
        };

        const windowResize = () => {
            windowViewPortWidth = window.innerWidth;
            if (windowViewPortWidth > 1023) {
                toggleMobile(false);
            } else {
                toggleMobile(true);
            }   
        }

        const pathName = history?.location?.pathname.split('/')[1];
        const navLinks = document.querySelectorAll('.nav-ul a');
        if (navLinks && navLinks.length) {
            navLinks.forEach((ele) => {
                const getHref = ele.getAttribute('href').toLocaleLowerCase();
                if (pathName?.length && getHref.includes(pathName)) {
                    ele.classList.add('active');
                } else {
                    if (mobilHomelinkRef.current) {
                        mobilHomelinkRef.current.classList.add('active');
                    }
                }
            });
        }

        window.addEventListener("resize", windowResize, { passive: true });
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => setDidMount(false);
    }, [isMobile]);

    const logout = () => {
        console.log('logout success');
        dispatch(logoutUser());
        setShowProfileTab(false)
        history.push(`/login`);
    }

    const onClickNav = (e, route) => {
        e.preventDefault();
        const navLinks = document.querySelectorAll('.nav-ul a');
        if (navLinks && navLinks.length) {
            navLinks.forEach((ele) => {
                if (ele.classList.contains('active')) {
                    ele.classList.remove('active');
                }
            });
        }
        if (route) {
            history.push(`/${route}`);
            e.target.classList.add('active');
            setTimeout(() => {
                let target = $(`.${route}`);
                if(target && target.offset()){
                    $('html,body').animate({
                        scrollTop: target.offset().top - 200
                    }, 700);
                }
            }, 100);
        } else {
            history.push(`/`);
            setTimeout(() => {
                let target = $(`.homepage`);
                if (target.length) {
                    $('html,body').animate({
                        scrollTop: target.offset().top - 200
                    }, 700);
                }
            }, 100);
        }
    }
    // Hook
    function useOnClickOutside(ref, handler) {
        useEffect(
            () => {
                const listener = event => {
                    if (!ref.current || ref.current.contains(event.target)) {
                        return;
                    }

                    handler(event);
                };
                document.addEventListener('mousedown', listener);
                document.addEventListener('touchstart', listener);
                return () => {
                    document.removeEventListener('mousedown', listener);
                    document.removeEventListener('touchstart', listener);
                };
            },
            [ref, handler]
        );
    }

    if(!didMount) {
        return null;
    }

    return (
        <>
            <nav className={`navigation-wrap ${goingUpClass} ${goingDownClass}`}>
                <div className="flex-container desktop-navigation">
                    <h1 title="home" >
                        <a href="/" onClick={(e) => onClickNav(e, '')}>
                            <img src={boogaluLogo} alt="Boogalu" />
                        </a>
                    </h1>
                    {
                        !isMobile ?
                        <ul className="flex-1 nav-ul">
                            <li><a href="#Lessons" onClick={(e) => onClickNav(e, 'lessons')}>Lessons</a></li>
                            <li><a href="#Competitions" onClick={(e) => onClickNav(e, 'competitions')}>Competitions</a></li>
                            <li><a href="#Subscription" onClick={(e) => onClickNav(e, 'subscription')}>Subscription</a></li>
                        </ul> : ''
                    }
                    {!state.loggedInUser.phone && <div className="flex-2 signup-wrap" >
                        <button className="btn primary-light login" onClick={() => history.push('/login')}>Login</button>
                        <button className="btn primary-dark signup" onClick={() => history.push('/register')}>Sign Up</button>
                    </div>}
                    {state.loggedInUser.phone && <div className="flex-2 signup-wrap" >
                        <div className="profile" ref={ref}>
                            <AccountCircleOutlinedIcon onClick={() => setShowProfileTab(true)} style={{ fontSize: '35px', paddingRight: '20px' }} />
                            {showProfileTab && <div className="profile-tab-wrap">
                                <div className="profile" onClick={() => { history.push('/profile'); setShowProfileTab(false) }}>Profile</div>
                                <div className="logout" onClick={() => logout()}>Logout</div>
                            </div>}
                        </div>
                        {/* <button className="signup" onClick={() => logout()}>Logout</button> */}
                    </div>}
                </div>
                {
                    isMobile ?
                    <div className="sticky-mobile-menu">
                        <a href="#Competitions" className="upload-btn">
                            <i><FaCloudUploadAlt /></i>
                        </a>
                        <ul className="flex-1 nav-ul">
                            <li>
                                <a href="/" ref={mobilHomelinkRef} onClick={(e) => onClickNav(e, '')}>
                                    <i>
                                        <FaHome />
                                    </i>
                                    <span>Home</span>
                                </a>
                            </li>
                            <li>
                                <a href="#Lessons" onClick={(e) => onClickNav(e, 'lessons')}>
                                   <i><FaBookReader /></i>
                                   <span>Lessons</span>
                                </a>
                            </li>
                            <li>
                                <a href="#upload" onClick={(e) => onClickNav(e, 'competitions')}>
                                    <i><FaTrophy /></i>
                                    <span>Competition</span>
                                </a>
                            </li>
                            <li>
                                <a href="#Subscription" onClick={(e) => onClickNav(e, 'subscription')}>
                                    <i><FaStaylinked /></i>
                                    <span>Subscription</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                    : ''
                }
            </nav>
        </>
    )
}
export default Navigation