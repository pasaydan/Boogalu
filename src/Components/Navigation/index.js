import React, { useState, useEffect, useRef } from 'react';
import { FaHome, FaBookReader, FaCloudUploadAlt, FaTrophy, FaStaylinked, FaUserAlt } from 'react-icons/fa';
import boogaluLogo from '../../Images/Boogalu-logo.svg';
import { useHistory } from "react-router-dom";
import { useStoreConsumer } from '../../Providers/StateProvider';
import { logoutUser } from '../../Actions/User';
import AccountCircleOutlinedIcon from '@material-ui/icons/AccountCircleOutlined';
import { enableLoginFlow } from "../../Actions/LoginFlow";
import { disableLoginFlow } from "../../Actions/LoginFlow";
import VideoUploader from "../VideoUploader";
import { NOTIFICATION_SUCCCESS, NOTIFICATION_ERROR } from "../../Constants";
import { displayNotification } from "../../Actions/Notification";
import * as $ from 'jquery';
const SCROLL_TOP_LIMIT = 200;

function Navigation() {
    const [goingUpClass, setGoingUpClass] = useState('');
    const [hideVdoUploadBtn, setHideVdoUploadBtn] = useState(false);
    const [didMount, setDidMount] = useState(false);
    const [isMobile, toggleMobile] = useState(false);
    const [goingDownClass, setGoingDownClass] = useState('');
    const [showProfileTab, setShowProfileTab] = useState(false);
    const ref = useRef();
    const mobilHomelinkRef = useRef();
    const history = useHistory();
    const { state, dispatch } = useStoreConsumer();
    const loggedInUser = state.loggedInUser;
    const [openVdoUploadModal, setOpenVdoUploadModal] = useState(false)
    const [activeRoute, setActiveRoute] = useState('');
    const [isNavHidden, toggleNavHidden] = useState(false);

    useOnClickOutside(ref, () => setShowProfileTab(false));

    useEffect(() => {
        setDidMount(true);
        setHideVdoUploadBtn(false);
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
        if (pathName.includes('login') || pathName.includes('register') || pathName.includes('admin')) {
            setHideVdoUploadBtn(true);
            toggleNavHidden(true);
        } else {
            toggleNavHidden(false);
        }
        setTimeout(() => {
            if (navLinks && navLinks.length) {
                navLinks.forEach((ele) => {
                    const getHref = ele.getAttribute('href').toLocaleLowerCase();
                    if (pathName?.length && getHref.includes(pathName)) {
                        ele.classList.add('active');
                    }
                });
            }
        }, 1000);

        window.addEventListener("resize", windowResize, { passive: true });
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => setDidMount(false);
    }, [isMobile]);

    useEffect(() => {
        const listenRouteChange = history.listen((location, action) => {
            const pathName = location?.pathname.split('/')[1];
            if (pathName.includes('admin') || pathName.includes('register') || pathName.includes('login')) {
                setHideVdoUploadBtn(true);   
                toggleNavHidden(true);
            } else {
                setHideVdoUploadBtn(false);
                toggleNavHidden(false);
            }
            if ((!pathName || pathName.includes('lessons') || pathName.includes('contactus') || pathName.includes('home')) && state.currentLoginFlow) {
                dispatch(disableLoginFlow());
            }
            if (state.currentLoginFlow == 'upload-video' && pathName.includes('competitions') || pathName.includes('lessons')) dispatch(disableLoginFlow());
            //set active route name

        });
    })

    const logout = () => {
        dispatch(displayNotification({
            msg: "Logout Successfully",
            type: NOTIFICATION_SUCCCESS,
            time: 3000
        }))
        console.log('logout success');
        dispatch(logoutUser());
        setShowProfileTab(false)
        history.push(`/login`);
    }

    const onClickNav = (e, route) => {
        e.preventDefault();
        const navLinks = document.querySelectorAll('.nav-ul a');

        setTimeout(() => {
            const pathName = history?.location?.pathname.split('/')[1];
            if (pathName.includes('register') || pathName.includes('admin')) setHideVdoUploadBtn(true);
            else setHideVdoUploadBtn(false);
        });

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
                if (target && target.offset()) {
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

    function navigateToUserRegistrationLogin(path) {
        setHideVdoUploadBtn(true);
        toggleNavHidden(true);
        history.push(`/${path}`)
    }

    if (!didMount) {
        return null;
    }

    const uploadVdo = (e) => {
        // setHideVdoUploadBtn(true);
        e.preventDefault();
        if (loggedInUser && loggedInUser.email && loggedInUser.phone) {
            // history.push({
            //     pathname: '/upload-video',
            //     state: null
            // })
            setOpenVdoUploadModal(true);
        } else {
            dispatch(enableLoginFlow('upload-video'));
            history.push({
                pathname: '/login',
                state: null
            })
        }
    }

    return (
        <>
            <nav className={`navigation-wrap ${goingUpClass} ${isNavHidden ? 'hide-nav' : ''} ${goingDownClass} ${!loggedInUser.username ? 'user-logged-out' : ''}`}>
                <div className="flex-container desktop-navigation">
                    <h1 title="home" >
                        <a href="/" onClick={(e) => onClickNav(e, '')}>
                            <img src={boogaluLogo} alt="Boogalu" />
                        </a>
                    </h1>
                    {
                        !isMobile ?
                            <ul className="flex-1 nav-ul">
                                {loggedInUser.username && <li><a href="#profile" onClick={(e) => onClickNav(e, 'profile')}>Profile</a></li>}
                                <li><a href="#Competitions" onClick={(e) => onClickNav(e, 'competitions')}>Competitions</a></li>
                                <li><a href="#Lessons" onClick={(e) => onClickNav(e, 'lessons')}>Lessons</a></li>
                                {
                                    !hideVdoUploadBtn ?
                                        <li>
                                            <a href="" onClick={(e) => uploadVdo(e)}>Upload</a>
                                        </li> : ''
                                }
                            </ul> : ''
                    }
                    {(!loggedInUser || !loggedInUser.phone) && <div className="flex-2 signup-wrap" >
                        <button className="btn primary-light login" onClick={() => navigateToUserRegistrationLogin('login')}>Login</button>
                        <button className="btn primary-dark signup" onClick={() => navigateToUserRegistrationLogin('register')}>Sign Up</button>
                    </div>}

                    {loggedInUser && loggedInUser.phone && <div className="flex-2 signup-wrap" >
                        <div className="profile" ref={ref}>
                            {loggedInUser.profileImage ? <div className="profile-img-wrap">
                                <img src={loggedInUser.profileImage} onClick={() => setShowProfileTab(true)} style={{ fontSize: '35px' }} />
                            </div> : <AccountCircleOutlinedIcon onClick={() => setShowProfileTab(true)} style={{ fontSize: '35px' }} />}

                            {showProfileTab && <div className="profile-tab-wrap">
                                <div className="profile" onClick={() => { history.push('/subscription'); setShowProfileTab(false) }}>Subscription</div>
                                <div className="logout" onClick={() => logout()}>Logout</div>
                            </div>}
                        </div>
                        {/* <button className="signup" onClick={() => logout()}>Logout</button> */}
                    </div>}
                </div>
                {
                    !hideVdoUploadBtn ?
                        <a href="" className="upload-btn" onClick={(e) => uploadVdo(e)}>
                            <i><FaCloudUploadAlt /></i>
                        </a> : ''
                }
                {
                    isMobile ?
                        <div className="sticky-mobile-menu">
                            <ul className="flex-1 nav-ul">
                                <li>
                                    <a href="/" ref={mobilHomelinkRef} onClick={(e) => onClickNav(e, '')} className={activeRoute == '' ? 'active' : ''}>
                                        <i>
                                            <FaHome />
                                        </i>
                                        <span>Home</span>
                                    </a>
                                </li>
                                {loggedInUser.username && <li>
                                    <a href="#profile" onClick={(e) => onClickNav(e, 'profile')} className={activeRoute == '' ? 'active' : ''}>
                                        <i><FaUserAlt /></i>
                                        <span>Profile</span>
                                    </a>
                                </li>}
                                <li>
                                    <a href="#Lessons" onClick={(e) => onClickNav(e, 'lessons')} className={activeRoute == 'competitions' ? 'active' : ''}>
                                        <i><FaBookReader /></i>
                                        <span>Lessons</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="#upload" onClick={(e) => onClickNav(e, 'competitions')} className={activeRoute == 'competitions' ? 'active' : ''}>
                                        <i><FaTrophy /></i>
                                        <span>Competition</span>
                                    </a>
                                </li>
                                {/* <li>
                                    <a href="#Subscription" onClick={(e) => onClickNav(e, 'subscription')}>
                                        <i><FaStaylinked /></i>
                                        <span>Subscription</span>
                                    </a>
                                </li> */}
                            </ul>
                        </div>
                        : ''
                }
                {openVdoUploadModal && <VideoUploader handleVdoUploadResponse={() => setOpenVdoUploadModal(false)} />}
            </nav>
        </>
    )
}
export default Navigation