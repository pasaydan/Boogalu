import React, { useState } from 'react';
import boogaluLogo from '../../Images/Boogaluu-logo.png';
import waveImage from '../../Images/waves.svg';
import userIcon from '../../Images/user-login.svg';
import pwdKeyIcon from '../../Images/pwd-keys.svg';

function JudgesLogin(props) {
    const intialLoginData = {
        user: null,
        pwd: null
    };
    const [loginData, setLoginData] = useState(intialLoginData);

    function onLoginValueChange(e, type) {
        if (type) {
            if (type === 'username') {
                setLoginData({...loginData, 'user': e.target.value}); 
            }
            if (type === 'password') {
                setLoginData({...loginData, 'pwd': e.target.value}); 
            }
        }
    }

    function triggerJudgesLogin() {
        props.loginAction(loginData);
    }

    function enterPressed(event) {
        const keyCode = event.keyCode || event.which;
        if (keyCode === 13) {
            triggerJudgesLogin();
        }
    }

    function showPrivacyModal() {
        props.showPrivacyPolicy(true);
    }
    
    function showTermsOfUseModal() {
        props.showTermsOfUse(true);
    }

    return (
        <div className="judegesLoginBox">
            <a href="/" className="logo" title="Back to Home">
                <img src={boogaluLogo} alt="Boogalu" />
            </a>
            <div className="loginForm">
                <label htmlFor="judgeloginuser" className="loginLabels">
                    <i className="labelIcons">
                        <img src={userIcon} alt="user" />
                    </i>
                    <input 
                        onChange={(e) => onLoginValueChange(e, 'username')} 
                        type="text" placeholder="Username" 
                        id="judgeloginuser" 
                        autoComplete="off"
                        onKeyPress={(e) => enterPressed(e)} 
                    />
                </label>
                <label htmlFor="judgeloginpwd" className="loginLabels">
                    <i className="labelIcons">
                        <img src={pwdKeyIcon} alt="pwd" />
                    </i>
                    <input 
                        onChange={(e) => onLoginValueChange(e, 'password')} 
                        type="password" 
                        placeholder="Password" 
                        id="judgeloginpwd" 
                        autoComplete="off"
                        onKeyPress={(e) => enterPressed(e)} 
                    />
                </label>
                <button className="loginBtn" onClick={triggerJudgesLogin}>Login</button>
                <p className="messages">{ props.message }</p>
            </div>
            <div className="footerBox">
                <img src={waveImage} alt="waves" />
                <p className="loginMessage">
                    By logging in you agree to our<br/> <span onClick={showPrivacyModal}>Privacy policy</span> &amp; <span onClick={showTermsOfUseModal}>Terms of use</span>
                </p>
            </div>
        </div>
    )
}

export default JudgesLogin;