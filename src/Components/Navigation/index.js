import React, { useState, useEffect } from 'react';
import './navigation.css'
import boogaluLogo from '../../Images/Boogalu-logo.svg';
import { useHistory } from "react-router-dom";
import { useStoreConsumer } from '../../Providers/StateProvider';
import { logoutUser } from '../../Actions/User';
import * as $ from 'jquery';
const SCROLL_TOP_LIMIT = 200;
function Navigation() {
    const [goingUpClass, setGoingUpClass] = useState('');
    const [goingDownClass, setGoingDownClass] = useState('');

    const history = useHistory();
    const { state, dispatch } = useStoreConsumer();

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
                    <button className="signup" onClick={() => logout()}>Logout</button>
                </div>}
            </nav>
        </>
    )
}
export default Navigation