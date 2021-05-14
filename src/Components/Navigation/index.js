import React, { useState, useEffect, useRef } from 'react';
import { FaHome, FaBookReader, FaCloudUploadAlt, FaTrophy, FaUserAlt, FaRupeeSign } from 'react-icons/fa';
import boogaluLogo from '../../Images/Boogalu-logo.svg';
import { useHistory } from "react-router-dom";
import { useStoreConsumer } from '../../Providers/StateProvider';
import { logoutUser } from '../../Actions/User';
import { enableLoginFlow } from "../../Actions/LoginFlow";
import { disableLoginFlow } from "../../Actions/LoginFlow";
import VideoUploader from "../VideoUploader";
import { MdNotifications, MdNotificationsActive, MdAccountCircle } from "react-icons/md";
import { NOTIFICATION_SUCCCESS } from "../../Constants";
import { displayNotification } from "../../Actions/Notification";
import * as $ from 'jquery';
import {  getUserById } from '../../Services/User.service';
import {  getNotifications, acceptFollowRequest } from '../../Services/Friendship.service';

const SCROLL_TOP_LIMIT = 200;

function Navigation( {routeChangeTrigger, isUserLoggedIn} ) {
    const [goingUpClass, setGoingUpClass] = useState('');
    const [hideVdoUploadBtn, setHideVdoUploadBtn] = useState(false);
    const [didMount, setDidMount] = useState(false);
    const [isMobile, toggleMobile] = useState(false);
    const [goingDownClass, setGoingDownClass] = useState('');
    const [profileTabMenu, enableProfileTabMenu] = useState(false);
    const [showProfileTab, setShowProfileTab] = useState(false);
    const [userIconProfileMenu, setUserIconProfileMenu] = useState(false);
    const [showUserIconProfileMenu, setShowUserIconProfileMenu] = useState(false);
    const [isHomeRoute, togglHomeRouteValue] = useState(true);
    // eslint-disable-next-line no-unused-vars
    const [isNotificationsPresent, setNotificationValue] = useState(false);
    const [userNotificationMenu, setUserNotificationMenu] = useState(false);
    const [showUserNotificationMenu, setShowUserIconNotificationMenu] = useState(false);
    // eslint-disable-next-line no-unused-vars
    const [userNotificationList, setUserNotificationList] = useState([]);
    // eslint-disable-next-line no-unused-vars
    
    const ref = useRef();
    const hamburgerMenuRef = useRef(null);
    const mainNavRef = useRef(null);
    const mobilHomelinkRef = useRef();

    const history = useHistory();
    const { state, dispatch } = useStoreConsumer();
    const loggedInUser = state.loggedInUser;
    const [openVdoUploadModal, setOpenVdoUploadModal] = useState(false)
    const [activeRoute, setActiveRoute] = useState('');
    const [isNavHidden, toggleNavHidden] = useState(false);
    const [animateNavClass, toggleNavAnimation] = useState('animate');
    
    const isAppAlreadyLoaded = JSON.parse(localStorage.getItem('isAppLoaded'));

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
                setTimeout(() => {
                    setGoingUpClass('');
                    setGoingDownClass('');
                }, 200);
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
        if (pathName === '') {
            togglHomeRouteValue(true);
            toggleNavAnimation('');
            if (isAppAlreadyLoaded) {
                setTimeout(() => {
                    toggleNavAnimation('animate');
                }, 1000);
            } else {
                setTimeout(() => {
                    toggleNavAnimation('animate');
                }, 7000);
            }
        } else {
            togglHomeRouteValue(false);
            routeChangeTrigger(false);
        }

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
                    if (pathName === '') {
                        if (loggedInUser.username) {
                            if (ele.getAttribute('href') === '#Dashboard') {
                                ele.classList.add('active');
                            } 
                        }
                    }
                });
            }
            topRightNavigation();
        }, 1000);

        window.addEventListener("resize", windowResize, { passive: true });
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => setDidMount(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMobile]);

    useEffect(() => {
        const listenRouteChange = history.listen((location, action) => {
            const pathName = location?.pathname.split('/')[1];
            if (pathName.includes('admin') || pathName.includes('register') || pathName.includes('login')) {
                setHideVdoUploadBtn(true);   
                toggleNavHidden(true);
                routeChangeTrigger(false);
            } else {
                setHideVdoUploadBtn(false);
                toggleNavHidden(false);
                if (pathName !== "") {
                    routeChangeTrigger(false);
                    togglHomeRouteValue(false);
                }
            }
            if ((!pathName || pathName.includes('lessons') || pathName.includes('contactus') || pathName.includes('home')) && state.currentLoginFlow) {
                dispatch(disableLoginFlow());
            }
            if ((state.currentLoginFlow === 'upload-video' && pathName.includes('competitions')) || pathName.includes('lessons')) dispatch(disableLoginFlow());
            //set active route name

        });
        console.log('Route change handler: ', listenRouteChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, []);

    useEffect(() => {
        if (userNotificationList && userNotificationList.length > 0) {
            setNotificationValue(true);
        }
    }, [userNotificationList])

    const fetchNotifications = () => {
        let followNotificationArray = [];
        if (loggedInUser.key) {
            getNotifications(loggedInUser.key).subscribe((response) => {
                const notification = response && response.notification && response.notification ? response.notification : [];
                if (notification && Object.keys(notification).length > 0) {
                    const notificationKeys = Object.keys(notification);
                    const flatValues = Object.values(notification).flat()
                    notificationKeys.forEach((key, index) => {
                        const valuesByKey = notification[key];
                        valuesByKey.forEach((value) => {
                            getUserById(value).subscribe((response) => {
                                // eslint-disable-next-line no-unused-vars
                                let responseData = response
                                responseData = {...responseData, [key]: true}
                                followNotificationArray.push(responseData);
                                if (followNotificationArray && followNotificationArray.length === flatValues.length) {
                                    setUserNotificationList(followNotificationArray);
                                }
                            });
                        });
                    });
                }
            })
        }
    }

    const logout = () => {
        dispatch(displayNotification({
            msg: "Logout Successfully",
            type: NOTIFICATION_SUCCCESS,
            time: 3000
        }))
        console.log('logout success');
        dispatch(logoutUser());
        setShowProfileTab(false)
        enableProfileTabMenu(false);
        setShowUserIconProfileMenu(false);
        setUserIconProfileMenu(false);
        setUserNotificationMenu(false);
        if (hamburgerMenuRef.current) {
            hamburgerMenuRef.current.classList.remove('active');
        }
        if (mainNavRef.current) {
            mainNavRef.current.classList.remove('sideMenuVisible');
        }
        history.push(`/login`);
    }

    const onClickNav = (e, route) => {
        e.preventDefault();
        const navLinks = document.querySelectorAll('.nav-ul a');

        setTimeout(() => {
            const pathName = history?.location?.pathname.split('/')[1];
            if (pathName.includes('register') || pathName.includes('admin')) {
                setHideVdoUploadBtn(true);
            } else {
                setHideVdoUploadBtn(false);
            } 

            if (pathName !== "") {
                routeChangeTrigger(false);
                togglHomeRouteValue(false);
            }
        }, 0);

        if (navLinks && navLinks.length) {
            navLinks.forEach((ele) => {
                if (ele.classList.contains('active')) {
                    ele.classList.remove('active');
                }
            });
            if (loggedInUser.username && route === '') {
                navLinks.forEach((ele) => {
                    if (ele.getAttribute('href') === '#Dashboard') {
                        ele.classList.add('active');
                        setActiveRoute('');
                    }
                }); 
            }
        }
        if (route) {
            history.push(`/${route}`);
            e.target.classList.add('active');
            setActiveRoute(route);
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
            setActiveRoute('');
            if (loggedInUser.username) {
                navLinks.forEach((ele) => {
                    if (ele.getAttribute('href') === '#Dashboard') {
                        ele.classList.add('active');
                    }
                }); 
            }
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
    // function useOnClickOutside(ref, handler) {
    //     useEffect(
    //         () => {
    //             const listener = event => {
    //                 if (!ref.current || ref.current.contains(event.target)) {
    //                     return;
    //                 }

    //                 handler(event);
    //             };
    //             document.addEventListener('mousedown', listener);
    //             document.addEventListener('touchstart', listener);
    //             return () => {
    //                 document.removeEventListener('mousedown', listener);
    //                 document.removeEventListener('touchstart', listener);
    //             };
    //         },
    //         [ref, handler]
    //     );
    // }

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
        e.stopPropagation();
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

    function topRightNavigation(event, url) {
        const getLinkMenu = document.querySelectorAll('.linkMenu');
        if (event && url) {
            getLinkMenu.forEach(item => {
                if (item.classList.contains('active')) {
                    item.classList.remove('active');
                }
            });
            event.currentTarget.classList.add('active');
            history.push(`/${url}`);
            setTimeout(() => {
                $('html,body').animate({
                    scrollTop: 0
                }, 700);
            }, 100);
            setActiveRoute(url);
            setShowProfileTab(false);
            enableProfileTabMenu(false);
            setShowUserIconProfileMenu(false);
            setUserIconProfileMenu(false);
            setUserNotificationMenu(false);
            if (hamburgerMenuRef.current) {
                hamburgerMenuRef.current.classList.remove('active');
            }
            if (mainNavRef.current) {
                mainNavRef.current.classList.remove('sideMenuVisible');
            }
        } else {
            const pathName = history?.location?.pathname.split('/')[1];
            if (getLinkMenu.length) {
                getLinkMenu.forEach(item => {
                    if (item.getAttribute('data-url') === pathName) {
                        item.classList.add('active');
                    }
                });
            }
        }
    }

    function activateLeftMenuBar(event) {
        event.stopPropagation();
        event.preventDefault();
        setShowUserIconProfileMenu(false);
        setTimeout(() => {
            setUserIconProfileMenu(false);
        }, 200);

        setShowUserIconNotificationMenu(false);
        setTimeout(() => {
            setUserNotificationMenu(false);
        }, 200);

        if (hamburgerMenuRef.current) {
            if (hamburgerMenuRef.current.classList.contains('active')) {
                hamburgerMenuRef.current.classList.remove('active');
                if (mainNavRef.current) {
                    mainNavRef.current.classList.remove('sideMenuVisible');
                }
                setTimeout(() => {
                    enableProfileTabMenu(false);
                }, 100);    
                setShowProfileTab(false);
            } else {
                hamburgerMenuRef.current.classList.add('active');
                if (mainNavRef.current) {
                    mainNavRef.current.classList.add('sideMenuVisible');
                }
                enableProfileTabMenu(true);
                setTimeout(() => {
                    setShowProfileTab(true);
                }, 100);
            }
        }
    }

    function activateProfileIconMenu(event) {
        event.stopPropagation();
        if (hamburgerMenuRef.current) {
            if (hamburgerMenuRef.current.classList.contains('active')) {
                hamburgerMenuRef.current.classList.remove('active');
                if (mainNavRef.current) {
                    mainNavRef.current.classList.remove('sideMenuVisible');
                }
                setTimeout(() => {
                    enableProfileTabMenu(false);
                }, 100);    
                setShowProfileTab(false);
            }
        }

        setShowUserIconNotificationMenu(false);
        setTimeout(() => {
            setUserNotificationMenu(false);
        }, 200);

        if (userIconProfileMenu) {
            setShowUserIconProfileMenu(false);
            setTimeout(() => {
                setUserIconProfileMenu(false);
            }, 200);
        } else {
            setUserIconProfileMenu(true);
            setTimeout(() => {
                setShowUserIconProfileMenu(true);
            }, 200);
        }
    }
    
    function activateNotificationMenu(event) {
        event.stopPropagation();
        if (hamburgerMenuRef.current) {
            if (hamburgerMenuRef.current.classList.contains('active')) {
                hamburgerMenuRef.current.classList.remove('active');
                if (mainNavRef.current) {
                    mainNavRef.current.classList.remove('sideMenuVisible');
                }
                setTimeout(() => {
                    enableProfileTabMenu(false);
                }, 100);    
                setShowProfileTab(false);
            }
        }

        setShowUserIconProfileMenu(false);
        setTimeout(() => {
            setUserIconProfileMenu(false);
        }, 200);
        
        if (userNotificationMenu) {
            setShowUserIconNotificationMenu(false);
            setTimeout(() => {
                setUserNotificationMenu(false);
            }, 200);
        } else {
            setUserNotificationMenu(true);
            setTimeout(() => {
                setShowUserIconNotificationMenu(true);
            }, 200);
        }
    }

    function navBoxClick(event) {
        event.stopPropagation();
        if (event.currentTarget.nodeName.toLocaleLowerCase() === 'nav') {
            if (hamburgerMenuRef.current) {
                hamburgerMenuRef.current.classList.remove('active');
                if (mainNavRef.current) {
                    mainNavRef.current.classList.remove('sideMenuVisible');
                }
                setTimeout(() => {
                    enableProfileTabMenu(false);
                }, 100);    
                setShowProfileTab(false);
            }
            setShowUserIconProfileMenu(false);
            setTimeout(() => {
                setUserIconProfileMenu(false);
            }, 200);
            
            setShowUserIconNotificationMenu(false);
            setTimeout(() => {
                setUserNotificationMenu(false);
            }, 200);
        }
    }

    function headerMenusClicked(event) {
        event.stopPropagation();
        event.preventDefault();
        setShowProfileTab(false);
        setShowUserIconProfileMenu(false);
        setShowUserIconNotificationMenu(false);
        setTimeout(() => {
            enableProfileTabMenu(false);
            setUserIconProfileMenu(false);
            setUserNotificationMenu(false);
        }, 500);
        if (hamburgerMenuRef.current) {
            hamburgerMenuRef.current.classList.remove('active');
        }
        if (mainNavRef.current) {
            mainNavRef.current.classList.remove('sideMenuVisible');
        }
    }

    const acceptFollowRequestHandler = (event, user) => {
        event.stopPropagation();
        acceptFollowRequest(loggedInUser.key, user.key).subscribe((response) => {
            console.log("response", response);
            if (response && response.success) {
                getNotifications();
            }
        })
    }

    const rejectFollowRequestHandler = (event) => {
        event.stopPropagation();
        console.log("Reject follow request code goes here");
    }

    const blockUserHandler = (event) => {
        event.stopPropagation();
        console.log("Block user request code goes here");
    }
    return (
        <>
            <nav ref={mainNavRef}
                onClick={(e) => navBoxClick(e)} 
                className={`navigation-wrap ${animateNavClass} ${isHomeRoute && !isUserLoggedIn ? 'home-nav-style': ''} ${goingUpClass} ${isNavHidden ? 'hide-nav' : ''} ${goingDownClass} ${!loggedInUser.username ? 'user-logged-out' : ''}`}>
                <div className="flex-container desktop-navigation">
                    <h1 title="home" >
                        <a href="/" onClick={(e) => onClickNav(e, '')}>
                            <img src={boogaluLogo} alt="Boogalu" />
                        </a>
                    </h1>
                    {
                        !isMobile ?
                            <ul className="flex-1 nav-ul">
                                {loggedInUser.username && <li><a href="#Dashboard" title="Dashboard" onClick={(e) => onClickNav(e, '')}>Dashboard</a></li>}
                                <li><a href="#Competitions" title="Competitions" onClick={(e) => onClickNav(e, 'competitions')}>Competitions</a></li>
                                <li><a href="#Lessons" title="Lessons" onClick={(e) => onClickNav(e, 'lessons')}>Lessons</a></li>
                                {
                                    !hideVdoUploadBtn ?
                                        <li>
                                            <a href="#uploadVideo" onClick={(e) => uploadVdo(e)} title="upload video">Upload</a>
                                        </li> : ''
                                }
                            </ul> : ''
                    }
                    {(!loggedInUser || !loggedInUser.phone) && <div className="flex-2 signup-wrap" >
                        <button className="btn primary-light login" onClick={() => navigateToUserRegistrationLogin('login')}>Login</button>
                        <button className="btn primary-dark signup" onClick={() => navigateToUserRegistrationLogin('register')}>Sign Up</button>
                        <a href="#hamburgerMenuLink" className="hamburgerMenu" ref={hamburgerMenuRef} title={`${profileTabMenu ? 'Close menu' : 'Open menu'}`} onClick={(e) => activateLeftMenuBar(e)}>
                            <span></span>
                        </a>
                    </div>}

                    {loggedInUser && loggedInUser.phone && <div className="flex-2 signup-wrap" >
                        <div className="profile" ref={ref}>
                            <div className="profile-img-wrap userIcon">
                                <MdAccountCircle onClick={(e) => activateProfileIconMenu(e)} />
                            </div>
                            <div className={`profile-img-wrap notificationIcon ${isNotificationsPresent ? 'active' : ''}`}>
                                {
                                    isNotificationsPresent ?
                                    <span className="notificationCount">{userNotificationList.length}</span>
                                    : ''
                                }
                                {
                                    isNotificationsPresent ?
                                    <MdNotificationsActive onClick={(e) => activateNotificationMenu(e)} />
                                    :
                                    <MdNotifications onClick={(e) => activateNotificationMenu(e)} />
                                }
                            </div>
                        </div>
                        <a href="#hamburgerMenuLink" className="hamburgerMenu" ref={hamburgerMenuRef} title={`${profileTabMenu ? 'Close menu' : 'Open menu'}`} onClick={(e) => activateLeftMenuBar(e)}>
                            <span></span>
                        </a>
                        {/* <button className="signup" onClick={() => logout()}>Logout</button> */}
                    </div>}
                    {
                        profileTabMenu ?
                        <div className={`profile-tab-wrap ${showProfileTab ? 'showMenu' : ''}`} onClick={(e) => headerMenusClicked(e)}>
                            <i className="crossMenuIcon"></i>
                            <div className="innerMenuWrap">
                                <div className="linkMenu" data-url="subscription" onClick={(e) => topRightNavigation(e, 'subscription')}>Subscription</div>
                                <div className="linkMenu" data-url="aboutus" onClick={(e) => topRightNavigation(e, 'aboutus')}>About us</div>
                                <div className="linkMenu" data-url="contactus" onClick={(e) => topRightNavigation(e, 'contactus')}>Contact us</div>
                                <div className="linkMenu" data-url="privacypolicy" onClick={(e) => topRightNavigation(e, 'privacypolicy')}>Privacy policies</div>
                                <div className="linkMenu" data-url="termsandconditions" onClick={(e) => topRightNavigation(e, 'termsandconditions')}>Terms &amp; conditions</div>
                                <div className="linkMenu" data-url="refundpolicy" onClick={(e) => topRightNavigation(e, 'refundpolicy')}>Cancellation/refund policy</div>
                            </div>
                        </div> : ''
                    }
                    
                    {
                        userIconProfileMenu ?
                        <div className={`profile-tab-wrap user-icon-menu-wrap ${showUserIconProfileMenu ? 'showMenu' : ''}`} onClick={(e) => headerMenusClicked(e)}>
                            <div className="innerMenuWrap">
                                <div className="linkMenu profileLink" data-url="profile" onClick={(e) => topRightNavigation(e, 'profile')}>My account</div>
                                <div className="linkMenu" data-url="profile/edit" onClick={(e) => topRightNavigation(e, 'profile/edit')}>Edit profile</div>
                                <div className="linkMenu logoutLink" onClick={() => logout()}>Logout</div>
                            </div>
                        </div> : ''
                    }

                    {
                        userNotificationMenu ?
                        <div className={`profile-tab-wrap userNotificationOptionWrap user-icon-menu-wrap ${showUserNotificationMenu ? 'showMenu' : ''}`} onClick={(e) => headerMenusClicked(e)}>
                            <i title="close notification" className="closeNotificationIcon" onClick={(e) => headerMenusClicked(e)}></i>
                            {
                                isNotificationsPresent &&  userNotificationList && userNotificationList.length ?
                                <div className="innerMenuWrap">
                                    <ul className="notificationList">
                                        {
                                            userNotificationList.map((user, index) => {
                                                console.log("user", user);
                                                return (
                                                    <li key={index}>
                                                        <p>{user.name} has {user.followRequestedBy ? 'requested to folllow' : ' started following'} you!</p>
                                                            {user.followRequestedBy &&
                                                                <div className="notificationAction">
                                                                    <button className="btn primary-dark" onClick={(event) => acceptFollowRequestHandler(event, user)}>Accept</button>
                                                                    <button className="btn primary-light" onClick={(event) => rejectFollowRequestHandler(event, user)}>Reject</button>
                                                                </div>
                                                            }
                                                            {user.followedBy &&
                                                                <div className="notificationAction">
                                                                    <button className="btn primary-light" onClick={(event) => blockUserHandler(event, user)}>Block</button>
                                                                </div>
                                                            }
                                                    </li>
                                                )
                                            })
                                        }
{/*                                         
                                        <li>
                                            <p>Vilas Kumkar has followed you!</p>
                                            <div className="notificationAction">
                                                <button className="btn primary-dark">Unfollow</button>
                                                <button className="btn primary-light">Block</button>
                                            </div>
                                        </li>
                                        <li>
                                            <p>Bruce has requested to follow you!</p>
                                            <div className="notificationAction">
                                                <button className="btn primary-dark">Accept</button>
                                                <button className="btn primary-light">Reject</button>
                                            </div>
                                        </li>
                                        <li>
                                            <p>Vilas Kumkar has followed you!</p>
                                            <div className="notificationAction">
                                                <button className="btn primary-dark">Unfollow</button>
                                                <button className="btn primary-light">Block</button>
                                            </div>
                                        </li>
                                        <li>
                                            <p>Bruce has requested to follow you!</p>
                                            <div className="notificationAction">
                                                <button className="btn primary-dark">Accept</button>
                                                <button className="btn primary-light">Reject</button>
                                            </div>
                                        </li>
                                        <li>
                                            <p>Vilas Kumkar has followed you!</p>
                                            <div className="notificationAction">
                                                <button className="btn primary-dark">Unfollow</button>
                                                <button className="btn primary-light">Block</button>
                                            </div>
                                        </li>
                                        <li>
                                            <p>Bruce has requested to follow you!</p>
                                            <div className="notificationAction">
                                                <button className="btn primary-dark">Accept</button>
                                                <button className="btn primary-light">Reject</button>
                                            </div>
                                        </li>
                                        <li>
                                            <p>Vilas Kumkar has followed you!</p>
                                            <div className="notificationAction">
                                                <button className="btn primary-dark">Unfollow</button>
                                                <button className="btn primary-light">Block</button>
                                            </div>
                                        </li>
                                        <li>
                                            <p>Bruce has requested to follow you!</p>
                                            <div className="notificationAction">
                                                <button className="btn primary-dark">Accept</button>
                                                <button className="btn primary-light">Reject</button>
                                            </div>
                                        </li>
                                        <li>
                                            <p>Vilas Kumkar has followed you!</p>
                                            <div className="notificationAction">
                                                <button className="btn primary-dark">Unfollow</button>
                                                <button className="btn primary-light">Block</button>
                                            </div>
                                        </li> 
*/}
                                    </ul>
                                </div> 
                                : 
                                <div className="innerMenuWrap">
                                    <p className="message">No pending notifications!</p>
                                </div>
                            }
                        </div> : ''
                    }
                </div>
                {
                    !hideVdoUploadBtn ?
                        <a href="#uploadVideoLink" className="upload-btn" onClick={(e) => uploadVdo(e)}>
                            <i><FaCloudUploadAlt /></i>
                        </a> : ''
                }
                {
                    isMobile ?
                        <div className="sticky-mobile-menu">
                            <ul className="flex-1 nav-ul">
                                <li>
                                    <a href="/" ref={mobilHomelinkRef} onClick={(e) => onClickNav(e, '')} className={activeRoute === '' ? 'active' : ''}>
                                        <i>
                                            <FaHome />
                                        </i>
                                        <span>
                                            {
                                                loggedInUser.username ?
                                                'Dashboard' : 'Home'
                                            }
                                        </span>
                                    </a>
                                </li>
                                <li>
                                    <a href="#Lessons" onClick={(e) => onClickNav(e, 'lessons')} className={activeRoute === 'lessons' ? 'active' : ''}>
                                        <i><FaBookReader /></i>
                                        <span>Lessons</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="#upload" onClick={(e) => onClickNav(e, 'competitions')} className={activeRoute === 'competitions' ? 'active' : ''}>
                                        <i><FaTrophy /></i>
                                        <span>Competition</span>
                                    </a>
                                </li>
                                {loggedInUser.username && <li>
                                    <a href="#profile" onClick={(e) => onClickNav(e, 'profile')} className={activeRoute === 'profile' ? 'active' : ''}>
                                        <i><FaUserAlt /></i>
                                        <span>Profile</span>
                                    </a>
                                </li>}
                                {!loggedInUser.username && <li>
                                    <a href="#subscription" onClick={(e) => onClickNav(e, 'subscription')} className={activeRoute === 'subscription' ? 'active' : ''}>
                                        <i><FaRupeeSign /></i>
                                        <span>Pricing</span>
                                    </a>
                                </li>}
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