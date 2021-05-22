import React, { useState, useEffect, useRef } from 'react';
import { useHistory, Link } from "react-router-dom";
import { useStoreConsumer } from '../../Providers/StateProvider';
import { GoogleLogin } from 'react-google-login';
import FacebookLogin from 'react-facebook-login';
import FacebookIcon from '@material-ui/icons/Facebook';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import boogaluLogo from '../../Images/Boogalu-logo.svg';
import waveImage from '../../Images/waves.svg';
import userIcon from '../../Images/user-login.svg';
import pwdKeyIcon from '../../Images/pwd-keys.svg';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import ArrowRightSharpIcon from '@material-ui/icons/ArrowRightSharp';
import bgImg from '../../Images/bg1.svg';
import { loginUser } from '../../Actions/User/index';
import { getUserByEmail, getUserByPhone } from "../../Services/User.service";
import VideoUploader from "../VideoUploader";
import { enableLoading, disableLoading } from "../../Actions/Loader";
import { displayNotification, removeNotification } from "../../Actions/Notification";
import { NOTIFICATION_SUCCCESS } from "../../Constants";
import { validateEmailId } from '../../helpers';
import * as $ from 'jquery';

const firebase = require("firebase");

export default function Login(props) {
    const { state, dispatch } = useStoreConsumer();
    const history = useHistory();
    const [loginCred, setloginCred] = useState({ username: "", password: "", showPassWord: false });
    const [LoginError, setLoginError] = useState(null);
    const [thirdPartyResponse, setThirdPartyResponse] = useState({ isLogginSuccess: false, data: null, source: '' });
    const [openVdoUploadModal, setOpenVdoUploadModal] = useState(false);
    const [componentShowClass, toggleShowClass] = useState('');
    const [emailVerifyMessage, setEmailVerificationMessage] = useState('');
    const [emailVerifyClass, toggleEmailVerifyClass] = useState('');
    const [isResetClicked, toggleResetLink] = useState(false);

    const resetEmailRef = useRef(null);

    useEffect(() => {
        if (thirdPartyResponse.source === 'Facebook') signinUser('', 'Facebook');
        if (thirdPartyResponse.source === 'Google') signinUser('', 'Google');
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [thirdPartyResponse]);

    useEffect(() => {
        dispatch(removeNotification({
            msg: "",
            type: NOTIFICATION_SUCCCESS,
            time: 0
        }));
        
        setTimeout(() => {
            toggleShowClass('show');
        }, 300);

        $('html,body').animate({
            scrollTop: 0
        }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const setLoginResponseToServer = () => {
        // notify server that user is loggedin
        console.log('Save loggin user to db')

    }
    const successResponseGoogle = function (response) {
        console.log(response);
        let loginResponse = {
            data: {
                name: response.profileObj.name,
                email: response.profileObj.email,
                token: response.googleId,
                profileImage: response.profileObj.imageUrl,
            },
            source: 'Google'
        }
        setThirdPartyResponse(loginResponse);
    }

    const failureResponseGoogle = function (response) {
        if (response.error !== "idpiframe_initialization_failed") {
            setLoginError('Sorry there was a problem with your google login request.')
        }
    }

    const responseFacebook = (response) => {
        console.log(response);
        if (response && response.userID) {
            let loginResponse = {
                isLogginSuccess: true,
                data: response,
                source: 'Facebook'
            }
            setThirdPartyResponse(loginResponse);
        } else {
            setLoginError('Sorry there was a problem with your facebook login request.')
            console.log("facebook login error", response);
        }
    }

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const handleChange = (prop) => (event) => {
        setLoginError(null);
        setloginCred({ ...loginCred, [prop]: event.target.value });
    };

    const showPassword = () => {
        setloginCred({ ...loginCred, showPassWord: (loginCred.showPassWord ? false : true) })
    }

    const checkForUserPhone = (phone) => {
        return new Promise((res, rej) => {
            getUserByPhone(phone).subscribe((data) => {
                if (data && data.length) res(data);
                else res(null);
            })
        })
    }

    const checkForUserEmail = (email) => {
        return new Promise((res, rej) => {
            getUserByEmail(email).subscribe((data) => {
                if (data && data.length) res(data);
                else res(null);
            })
        })
    }

    const getUserLoginData = (userData) => {
        return new Promise((res, rej) => {
            if (thirdPartyResponse.data && thirdPartyResponse.data.email) {
                // with gmail or fb flow
                getUserByEmail(userData.email).subscribe((isRegisteredUser) => {
                    if (isRegisteredUser.length) {
                        res(isRegisteredUser[0]);
                    } else {
                        setLoginError('Please enter correct credentials.')
                        rej({ ...userData, isRegistered: false });
                    }
                })
            } else {
                // without gmail fb flow
                checkForUserEmail(userData.emailOrPhone).then((isRegisteredUser) => {
                    if (isRegisteredUser && isRegisteredUser.length) {
                        if (isRegisteredUser[0].password === userData.password) res(isRegisteredUser[0]);
                        else {
                            setLoginError('Please enter correct credentials.')
                            rej();
                        }
                    } else {
                        checkForUserPhone(userData.emailOrPhone).then((isRegisteredUser) => {
                            if (isRegisteredUser && isRegisteredUser.length) {
                                if (isRegisteredUser[0].password === userData.password) res(isRegisteredUser[0]);
                                else {
                                    setLoginError('Please enter correct credentials.')
                                    rej();
                                }
                            } else {
                                setLoginError('Please enter correct credentials.')
                                rej();
                            }
                        })
                    }
                })
            }
        })
    }
    const signinUser = (e, status) => {
        dispatch(enableLoading());
        setLoginError(null);
        let userData = {};
        switch (status) {
            case 'cred':
                setThirdPartyResponse({ isLogginSuccess: false, data: null, source: '' })
                e.preventDefault();
                e.stopPropagation();
                userData = {
                    ...loginCred,
                    phone: loginCred.username,
                    email: loginCred.username,
                    emailOrPhone: loginCred.username
                }
                getUserLoginData(userData)
                    .then((data) => {
                        //user is registered
                        setLoginResponseToServer();
                        data.source = 'Website';
                        dispatch(loginUser(data));
                        dispatch(disableLoading());
                        dispatch(displayNotification({
                            msg: "Login successfully",
                            type: NOTIFICATION_SUCCCESS,
                            time: 3000
                        }));
                        if (state.currentLoginFlow === 'competition') history.push('/competitions');
                        else if (state.currentLoginFlow === 'subscription') history.push('/subscription');
                        else if (state.currentLoginFlow === 'lessons') history.push('/lessons');
                        else if (state.currentLoginFlow === 'upload-video') setOpenVdoUploadModal(true);
                        else history.push('/')
                    })
                    .catch((data) => {
                        dispatch(disableLoading());
                        if (data) {
                            //user not registered
                            history.push({
                                pathname: '/register',
                                state: data
                            })
                        }
                    })
                break;
            case 'Google': case 'Facebook':
                userData = {
                    name: thirdPartyResponse.data.name,
                    email: thirdPartyResponse.data.email,
                }
                getUserLoginData(userData)
                    .then((data) => {
                        //user is registered
                        dispatch(disableLoading());
                        setLoginResponseToServer();
                        data.source = thirdPartyResponse.source;
                        dispatch(loginUser(data));
                        dispatch(displayNotification({
                            msg: "Login successfully",
                            type: NOTIFICATION_SUCCCESS,
                            time: 3000
                        }));
                        if (state.currentLoginFlow === 'competition') history.push('/competitions');
                        else if (state.currentLoginFlow === 'subscription') history.push('/subscription');
                        else if (state.currentLoginFlow === 'lessons') history.push('/lessons');
                        else if (state.currentLoginFlow === 'upload-video') setOpenVdoUploadModal(true);
                        else history.push('/')
                    })
                    .catch((data) => {
                        dispatch(disableLoading());
                        if (data) {
                            data.source = thirdPartyResponse.source;
                            //user not registered
                            history.push({
                                pathname: '/register',
                                state: data
                            });
                        }
                    })
                break;
            default: break;
        }
    }

    function goToPrevious(event) {
        event.stopPropagation();
        event.preventDefault();
        props.backToHome('login');
        history.goBack();
    }

    function redirectToPolicies(route) {
        if (route) {
            history.push({
                pathname: `/${route}`
            });
        }
    }

    function togglePwdResetLayer(action) {
        toggleResetLink(action);
    }

    function sendResetEmailLink() {
        if (resetEmailRef.current) {
            const resetEmailValue = resetEmailRef.current.value;
            if (!resetEmailValue) {
                setEmailVerificationMessage('Enter email id!');
                toggleEmailVerifyClass('error');
            } else if (resetEmailValue.length && !validateEmailId(resetEmailValue)) {
                setEmailVerificationMessage('Enter valid email id!');
                toggleEmailVerifyClass('error');
            } else {
                setEmailVerificationMessage('');
                toggleEmailVerifyClass('');
                try {
                    firebase.auth().sendPasswordResetEmail(resetEmailValue)
                    .then(function () {
                        setEmailVerificationMessage('Please check your email for reset link!');
                        toggleEmailVerifyClass('success');
                    }).catch(function (e) {
                        setEmailVerificationMessage('Something went wrong, try social login!');
                        toggleEmailVerifyClass('error');
                    });
                } catch (e) {
                    setEmailVerificationMessage('Something went wrong, try social login!');
                    toggleEmailVerifyClass('error');
                }
            }
        }
    }

    return (
        <div className="login-wrap new-login-signup-ui clearfix gradient-bg-animation darkMode">
            <div className={`inner-form-wrap ${componentShowClass}`}>
                <form className="form-wrap clearfix" onSubmit={(e) => signinUser(e, 'cred')}>
                    <div className="heading-outer">
                        <a href="#previousLink" onClick={(e) => goToPrevious(e)} className="arrow-back-home" title="Back">
                            <ArrowBackIcon />
                        </a>
                        <a href="/" className="logo" title="Back to Home">
                            <img src={boogaluLogo} alt="Boogalu" />
                        </a>
                        <div className="heading1">Welcome Back!</div>
                        <div className="heading2">Login to your existing Boogalu account.</div>
                    </div>
                    <div className="form-outer clearfix">
                        <div className="input-wrap">
                            <i className="labelIcons">
                                <img src={userIcon} alt="user" />
                            </i>
                            <TextField className="input-field"
                                required
                                id="outlined-required-username"
                                label="Username / Email / Phone"
                                onChange={handleChange('username')}
                                value={loginCred.username}
                                variant="outlined"
                            />
                        </div>
                        <div className="input-wrap">
                            <i className="labelIcons">
                                <img src={pwdKeyIcon} alt="pwd" />
                            </i>
                            <TextField className="input-field"
                                required
                                id="outlined-adornment-password"
                                label="Password"
                                type={loginCred.showPassWord ? 'text' : 'password'}
                                onChange={handleChange('password')}
                                value={loginCred.password}
                                variant="outlined"
                            />
                            <div className="showHideBtn">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={showPassword}
                                    onMouseDown={handleMouseDownPassword}
                                    edge="end"
                                >
                                    {loginCred.showPassWord ? <Visibility /> : <VisibilityOff />}
                                </IconButton>
                            </div>
                        </div>
                        {/* <div className="input-wrap">
                            <FormControl className="" variant="outlined" style={{ width: '100%' }}>
                                <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                                <OutlinedInput
                                    required
                                    id="outlined-adornment-password"
                                    type={loginCred.showPassWord ? 'text' : 'password'}
                                    value={loginCred.password}
                                    onChange={handleChange('password')}
                                    endAdornment={
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={showPassword}
                                                onMouseDown={handleMouseDownPassword}
                                                edge="end"
                                            >
                                                {loginCred.showPassWord ? <Visibility /> : <VisibilityOff />}
                                            </IconButton>
                                        </InputAdornment>
                                    }
                                    labelWidth={70}
                                />
                            </FormControl>
                        </div>
                         */}
                        <div className="action-wrap">
                            <div className="submit-btn clearfix">
                                <Button variant="contained" type="submit" color="primary">Sign In
                                <ArrowRightSharpIcon />
                                </Button>
                            </div>
                            <div className="forgot-password clearfix" onClick={() => togglePwdResetLayer(true)}>
                                <div>Forgot Password ?</div>
                            </div>
                        </div>
                        {LoginError && <div className="login-error">
                            {LoginError}
                        </div>}
                        <div className="or-seprator clearfix">
                            <span></span>
                            <div>OR</div>
                            <span></span>
                        </div>
                        <div className="login-with">
                            <p className="loginWithTitle">Login with</p>
                            <div className="login-with-google">
                                <GoogleLogin
                                    className="google-login-btn"
                                    clientId="417866547364-mesv7a9cn6bj4n3ge45s8b6hhl1vdam0.apps.googleusercontent.com"
                                    buttonText="Login with Google"
                                    onSuccess={successResponseGoogle}
                                    onFailure={failureResponseGoogle} >
                                </GoogleLogin>
                            </div>
                            <div className="login-with-fb">
                                <div className="login-with-fb">
                                    <FacebookLogin
                                        appId="813330422546108"
                                        autoLoad={false}
                                        fields="name,email,picture"
                                        callback={responseFacebook}
                                        cssClass="facebook-login-btn"
                                        icon={<FacebookIcon />}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="singupLink">
                        New to Boogalu? <Link to="/register" className="registerLink" title="Register to Boogalu">Sign Up</Link>
                    </div>
                </form>
                <div className="image-wrap">
                    <img src="https://i.imgur.com/KS2W5BM.jpg" alt="signup" />
                    <div className="singup-details">
                        <div className="already-login-wrap">
                            <div className="text-wrap">
                                New to Boogalu?
                                <p className="sub-text">Singup and get a chance to enroll on different competitions and win awesome prizes!</p>
                            </div>
                            <Button className="singup-btn" color="primary" onClick={() => history.push('/register')}>SIGN UP</Button>
                        </div>
                    </div>
                </div>
                <div className="footerBox">
                    <img src={waveImage} alt="waves" />
                    <p className="loginMessage">
                        By logging in you agree to our<br/> 
                        <span onClick={() => redirectToPolicies('privacypolicy')}>Privacy policy</span> &amp; 
                        <span onClick={() => redirectToPolicies('termsandconditions')}>Terms of use</span>
                    </p>
                </div>
                {
                    isResetClicked ?
                    <div className="forgotPwdBox">
                        <div className="logoWrap">
                            <img src={boogaluLogo} alt="Boogalu" />
                        </div>
                        <p className="closeModal" onClick={() => togglePwdResetLayer(false)}></p>
                        <h2>Enter email for reset link</h2>
                        <div className="inputWrap">
                            <input type="email" placeholder="Enter valid email id" ref={resetEmailRef} title="Email" />
                            <p className="emailLinkBtn" onClick={() => sendResetEmailLink()} title="send link to email">
                                <label>
                                    <span>Send</span>
                                </label>
                            </p>
                        </div>
                        <p className={`emailVerifyMessage ${emailVerifyClass}`}>{emailVerifyMessage}</p>
                    </div> : ''
                }
            </div>
            <div className="img-wrap">
                <img src={bgImg} alt="background" />
            </div>
            {openVdoUploadModal && <VideoUploader handleClose={() => setOpenVdoUploadModal(false)} />}
            <ul className="circles">
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
            </ul>
        </div>
    );
}