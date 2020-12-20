import React, { useState, useEffect, useRef } from 'react';
import './navigation.css'
import boogaluLogo from '../../Images/Boogalu-logo.svg';
import { useHistory } from "react-router-dom";
import { useStoreConsumer } from '../../Providers/StateProvider';
import { logoutUser } from '../../Actions/User';
import AccountCircleOutlinedIcon from '@material-ui/icons/AccountCircleOutlined';
import * as $ from 'jquery';
const SCROLL_TOP_LIMIT = 200;
function Navigation() {
    const [goingUpClass, setGoingUpClass] = useState('');
    const [goingDownClass, setGoingDownClass] = useState('');
    const [showProfileTab, setShowProfileTab] = useState(false);
    const ref = useRef();
    const history = useHistory();
    const { state, dispatch } = useStoreConsumer();
    useOnClickOutside(ref, () => setShowProfileTab(false));

    useEffect(() => {
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

        window.addEventListener("scroll", handleScroll, { passive: true });
    }, []);

    const logout = () => {
        console.log('logout success');
        dispatch(logoutUser());
        setShowProfileTab(false)
        history.push(`/login`);
    }

    const onClickNav = (e, route) => {
        e.preventDefault();
        if (route) {
            history.push(`/${route}`);
            setTimeout(() => {
                var target = $(`.${route}`);
                $('html,body').animate({
                    scrollTop: target.offset().top - 200
                }, 700);
            }, 100);
        } else {
            history.push(`/`);
            setTimeout(() => {
                var target = $(`.homepage`);
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
                    // Do nothing if clicking ref's element or descendent elements
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
            // Add ref and handler to effect dependencies
            // It's worth noting that because passed in handler is a new ...
            // ... function on every render that will cause this effect ...
            // ... callback/cleanup to run every render. It's not a big deal ...
            // ... but to optimize you can wrap handler in useCallback before ...
            // ... passing it into this hook.
            [ref, handler]
        );
    }
    return (
        <>
            <nav className={`flex-container navigation-wrap ${goingUpClass} ${goingDownClass}`}>
                <h1 title="home" >
                    <a href="/" onClick={(e) => onClickNav(e, '')}>
                        <img src={boogaluLogo} alt="Boogalu" />
                    </a>
                </h1>
                <ul className="flex-1 nav-ul">
                    <li><a href="#Lessons" onClick={(e) => onClickNav(e, 'lessons')}>Lessons</a></li>
                    <li><a href="#Competitions" onClick={(e) => onClickNav(e, 'competitions')}>Competitions</a></li>
                    <li><a href="#Subscription" onClick={(e) => onClickNav(e, 'subscription')}>Subscription</a></li>
                </ul>
                {!state.loggedInUser.phone && <div className="flex-2 signup-wrap" >
                    <button className="login" onClick={() => history.push('/login')}>Login</button>
                    <button className="signup" onClick={() => history.push('/register')}>Sign Up</button>
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
            </nav>
        </>
    )
}
export default Navigation