import React from 'react';
import './navigation.css'
import { useHistory } from "react-router-dom";
import { useStoreConsumer } from '../../Providers/StateProvider';
import { logoutUser } from '../../Actions/User';

function Navigation() {
    const history = useHistory();
    const { state, dispatch } = useStoreConsumer();

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
            <nav className="flex-container">
                <img onClick={() => history.push('/')} src="https://global-uploads.webflow.com/5de6c3f14dd1a7bf391687a4/5e30b3944081802b7050f546_STEEZY_WEB_LOGO.svg" alt="" className="image-14"></img>
                <ul className="flex-1 nav-ul">
                    <li><a href="#Programs" onClick={(e) => onClickNav(e, 'Programs')}>Programs</a></li>
                    <li><a href="#Features" onClick={(e) => onClickNav(e, 'Features')}>Features</a></li>
                    <li><a href="#Styles" onClick={(e) => onClickNav(e, 'Styles')}>Styles</a></li>
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