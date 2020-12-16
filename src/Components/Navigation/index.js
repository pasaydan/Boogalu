import React, { useState, useEffect } from 'react';
import './navigation.css'
import { useHistory } from "react-router-dom";
import { useStoreConsumer } from '../../Providers/StateProvider';
import { logoutUser } from '../../Actions/User';

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
        if (history.location.pathname != '/') {
            e.preventDefault();
            history.push(`/#${route}`)
        }
    }

    return (
        <>
            <nav className={`flex-container navigation-wrap ${goingUpClass} ${goingDownClass}`}>
                <h1 onClick={() => history.push('/')} title="home" >
                    Boogalu
                </h1>
                <ul className="flex-1 nav-ul">
                    <li><a href="#Programs" onClick={(e) => onClickNav(e, 'Programs')}>Lessons</a></li>
                    <li><a href="#Features" onClick={(e) => onClickNav(e, 'Features')}>Competitions</a></li>
                    {/* <li><a href="#Styles" onClick={(e) => onClickNav(e, 'Styles')}>Styles</a></li> */}
                    <li><a href="#Suubscription" onClick={(e) => onClickNav(e, 'Subscription')}>Subscription</a></li>
                </ul>
                {!state.loggedInUser.phone && <div className="flex-2 signup-wrap" >
                    <button className="login" onClick={() => history.push('/login')}>Login</button>
                    <button className="signup" onClick={() => history.push('/signup')}>Sign Up</button>
                </div>}
                {state.loggedInUser.phone && <div className="flex-2 signup-wrap" >
                    <button className="signup" onClick={() => logout()}>Logout</button>
                </div>}
            </nav>
        </>
    )
}
export default Navigation