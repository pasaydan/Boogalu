import React, { useState, useEffect } from 'react';
import { useHistory, Link } from "react-router-dom";
import { useStoreConsumer } from '../../Providers/StateProvider';
import { GoogleLogin } from 'react-google-login';
import FacebookLogin from 'react-facebook-login';
import FacebookIcon from '@material-ui/icons/Facebook';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import TextField from '@material-ui/core/TextField';
import boogaluLogo from '../../Images/Boogalu-logo.svg';
import waveImage from '../../Images/waves.svg';
import userIcon from '../../Images/user-login.svg';
import pwdKeyIcon from '../../Images/pwd-keys.svg';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import ArrowRightSharpIcon from '@material-ui/icons/ArrowRightSharp';
// import bgImg from '../../Images/bg1.svg';
import { loginUser } from '../../Actions/User/index';
import { getUserByEmail, getUserByPhone, updatePassword } from "../../Services/User.service";
import { getUploadedVideosByUserId } from '../../Services/UploadedVideo.service';
import VideoUploader from "../VideoUploader";
import Loader from '../Loader';
import GenericInfoModal from '../genericInfoModal';
import { displayNotification, removeNotification } from "../../Actions/Notification";
import { getUploadedVideosByUser } from "../../Actions/User";
import { NOTIFICATION_ERROR, NOTIFICATION_SUCCCESS } from "../../Constants";
// import { validateEmailId } from '../../helpers';
import { useCookies } from "react-cookie";
import { sendEmail } from "../../Services/Email.service";
import * as $ from 'jquery';
const restLinkUrlQuery = '?reset-password='

export default function Login(props) {
    const { state, dispatch } = useStoreConsumer();
    const history = useHistory();
    const [cookie, setCookie] = useCookies();
    const [resetPswCookie, setResetPswCookie] = useState(cookie['_rst_bgl_']);
    const [loginCred, setloginCred] = useState({ username: "", password: "", showPassWord: false });
    const [LoginError, setLoginError] = useState(null);
    const [thirdPartyResponse, setThirdPartyResponse] = useState({ isLogginSuccess: false, data: null, source: '' });
    const [openVdoUploadModal, setOpenVdoUploadModal] = useState(false);
    const [componentShowClass, toggleShowClass] = useState('');
    const [emailVerifyMessage, setEmailVerificationMessage] = useState('');
    const [emailVerifyClass, toggleEmailVerifyClass] = useState('');
    const [isResetClicked, toggleResetLink] = useState(false);
    const [isPageLoaderActive, togglePageLoader] = useState(false);
    const [isResetPasswordViewOpen, toggleResetPwdModal] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [confirmPasswordMessage, setConfirmPwdMessage] = useState('');
    const [resetPassword, setResetPassword] = useState({ password: '', confirmPassword: '' });
    const [openInformationModal, toggleInfoModal] = useState(false); 
    const [infoModalTitle, setInfoModalTitle] = useState(''); 
    const [infoModalMessage, setInfoModalMessage] = useState(''); 
    const [infoModalStatus, setInfoModalStatus] = useState(''); 
    const [navigateLink, setInfoModalNavigateLink] = useState(''); 
    // const resetEmailRef = useRef(null);

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

        const searchQuery = history?.location?.search;
        if (searchQuery.includes('?')) {
            //check for reset link
            if (searchQuery.includes(restLinkUrlQuery)) {
                // validate reset code in url
                const resetCodeFromUrl = searchQuery.split('=')[1];
                if (resetPswCookie?.code === resetCodeFromUrl) {
                    //valid code
                    toggleResetPwdModal(true);
                    //redirect to reset password screen

                } else {
                    //invalid code
                    history.replace(window.location.pathname);
                    dispatch(displayNotification({
                        msg: "Password reset link expired!",
                        type: NOTIFICATION_ERROR,
                        time: 3000
                    }));
                }
            } else {
                //false query then remove it from url
                history.replace(window.location.pathname);
            }
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    function shouldCloseInfoModal(navigationValue) {
        setInfoModalTitle('');
        setInfoModalMessage('');
        setInfoModalStatus('');
        setInfoModalNavigateLink('');
        toggleInfoModal(false);
        if (navigationValue) {
            history.push(navigationValue);
        }
    }

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
        try {
            return new Promise((res, rej) => {
                getUserByPhone(phone).subscribe((data) => {
                    if (data && data.length) res(data);
                    else res(null);
                })
            });
        } catch (e) {
            console.log('check phone error: ', e);
        }
    }

    const checkForUserEmail = (email) => {
        try {
            return new Promise((res, rej) => {
                getUserByEmail(email).subscribe((data) => {
                    if (data && data.length) res(data);
                    else res(null);
                })
            });
        } catch (e) {
            console.log('check user email erro: ', e);
        }
    }

    const getUserLoginData = (userData) => {
        togglePageLoader(true);
        try {
            return new Promise((res, rej) => {
                if (thirdPartyResponse.data && thirdPartyResponse.data.email) {
                    // with gmail or fb flow
                    getUserByEmail(userData.email).subscribe((isRegisteredUser) => {
                        togglePageLoader(false);
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
                        togglePageLoader(false);
                        if (isRegisteredUser && isRegisteredUser.length) {
                            if (isRegisteredUser[0].password === userData.password) res(isRegisteredUser[0]);
                            else {
                                setLoginError('Please enter correct credentials.')
                                rej();
                            }
                        } else {
                            checkForUserPhone(userData.emailOrPhone).then((isRegisteredUser) => {
                                togglePageLoader(false);
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
            });
        } catch (e) {
            togglePageLoader(false);
            console.log('user login data error: ', e);
        }
    }

    function getUsersVideoList(userKey) {
        if (userKey) {
            togglePageLoader(true);
            try {
                getUploadedVideosByUserId(userKey).subscribe( list => {
                    togglePageLoader(false);
                    dispatch(getUploadedVideosByUser(list));
                });
            } catch(e) {
                togglePageLoader(false);
                console.log('Video fetch error: ', e);
            }
        }
    }

    const signinUser = (e, status) => {
        togglePageLoader(true);
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
                        getUsersVideoList(data.key);
                        togglePageLoader(false);
                        setLoginResponseToServer();
                        data.source = 'Website';
                        dispatch(loginUser(data));
                        dispatch(displayNotification({
                            msg: "Login successfully",
                            type: NOTIFICATION_SUCCCESS,
                            time: 3000
                        }));
                        if (state.currentLoginFlow === 'competition') {
                            history.push('/competitions');
                        } else if (state.currentLoginFlow === 'subscription') {
                            history.push('/subscription');
                        } else if (state.currentLoginFlow === 'lessons') {
                            history.push('/lessons');
                        } else if (state.currentLoginFlow === 'upload-video') {
                            if (state.userVideosList && state.userVideosList.length < 4) {
                                setOpenVdoUploadModal(true);
                            } else {
                                setVideoLimitParameters();
                            }
                        } else {
                            history.push('/');
                        } 
                    })
                    .catch((data) => {
                        togglePageLoader(false);
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
                        getUsersVideoList(data.key);
                        togglePageLoader(false);
                        setLoginResponseToServer();
                        data.source = thirdPartyResponse.source;
                        dispatch(loginUser(data));
                        dispatch(displayNotification({
                            msg: "Login successfully",
                            type: NOTIFICATION_SUCCCESS,
                            time: 3000
                        }));
                        if (state.currentLoginFlow === 'competition') {
                            history.push('/competitions');
                        } else if (state.currentLoginFlow === 'subscription') {
                            history.push('/subscription');
                        } else if (state.currentLoginFlow === 'lessons') {
                            history.push('/lessons');
                        } else if (state.currentLoginFlow === 'upload-video') {
                            if (state.userVideosList && state.userVideosList.length < 4) {
                                setOpenVdoUploadModal(true);
                            } else {
                                setVideoLimitParameters();
                                history.push('/profile');
                            }
                        } else {
                            history.push('/');
                        } 
                    })
                    .catch((data) => {
                        togglePageLoader(false);
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

    function setVideoLimitParameters() {
        setInfoModalMessage('You have reached your maximum video upload limit of 4, please delete some videos to upload another one!');
        setInfoModalStatus('error');
        toggleInfoModal(true);
        setInfoModalNavigateLink('/profile');
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
        if (loginCred.username.includes('@') && action) {
            setResetEmail(loginCred.username);
        } else setResetEmail('')
        toggleResetLink(action);
        if (isResetPasswordViewOpen) {
            toggleResetPwdModal(false);
        }
    }

    const sendEmailToUser = (userDetails, resetLink) => {
        togglePageLoader(true);
        try {
            return new Promise((resolve, reject) => {
                const { email, name } = userDetails;
                let emailBody =
                    `<div>
                        <p>Hi ${name}, need to reset your password? No problem! just click the link bellow and you'll be on your way. If you did not make this request, please ignore this email. </p>.
                        <div>
                            <a href=${resetLink}>Reset Password</a> 
                        </div>
                        <div>If you don't use this link within 30 minutes, it will expire. To get new password reset link, visit:
                            <a href=https://boogalusite.web.app >New Reset Password Link</a>
                        </div>
                    </div>`;
                let payload = {
                    mailTo: email,
                    title: 'Boogalu- Reset Password',
                    content: emailBody
                }
                sendEmail(payload).subscribe((res) => {
                    togglePageLoader(false);
                    if (!('error' in res)) {
                        console.log('User Email Send Successfully.');
                        resolve();
                    } else {
                        console.log('User Email Send Failed.');
                        reject();
                    }
                })
            });
        } catch (e) {
            togglePageLoader(false);
            console.log('email to user error: ', e);
        }
    }

    function sendResetEmailLink() {
        togglePageLoader(true);
        if (!resetEmail) {
            togglePageLoader(false);
            dispatch(displayNotification({
                msg: "Please enter valid email",
                type: NOTIFICATION_ERROR,
                time: 3000
            }));
            return;
        }
        try {
            checkForUserEmail(resetEmail).then((isRegisteredUser) => {
                if (isRegisteredUser && isRegisteredUser.length !== 0) {
                    const resetLinkCode = Math.random().toString(36).substring(2);//generate dynamic string for link identification
                    const resetLink = window.location.href + restLinkUrlQuery + resetLinkCode;
                    try {
                        sendEmailToUser(isRegisteredUser[0], resetLink).then(() => {
                            togglePageLoader(false);
                            // email send successfully now set reset data to cookie
                            const cookieData = {
                                email: resetEmail,
                                id: isRegisteredUser[0].key,
                                code: resetLinkCode
                            }
                            setCookie("_rst_bgl_", cookieData, {
                                path: "/",
                                expires: new Date(new Date().setMinutes(new Date().getMinutes() + 15)),//remove cookies after 15 min
                                sameSite: true,
                            })
                            dispatch(displayNotification({
                                msg: `Reset link send to ${resetEmail}`,
                                type: NOTIFICATION_SUCCCESS,
                                time: 3000
                            }));
                        }).catch(() => {
                            //email sending failed so do nothing
                            togglePageLoader(false);
                            dispatch(displayNotification({
                                msg: "Reset link sending failed",
                                type: NOTIFICATION_ERROR,
                                time: 3000
                            }));
                        });
                    } catch (e) {
                        togglePageLoader(false);
                        dispatch(displayNotification({
                            msg: "Something went wrong with the network, please try in sometime!",
                            type: NOTIFICATION_ERROR,
                            time: 5000
                        }));
                        console.log('send reset email error: ', e);
                    }
                } else {
                    //user not registered
                    togglePageLoader(false);
                    dispatch(displayNotification({
                        msg: "Seems like you not registered yet, please register!",
                        type: NOTIFICATION_ERROR,
                        time: 3000
                    }));
                    history.push('register');
                }
            });
        } catch (e) {
            togglePageLoader(false);
            console.log('Error in sending reset link: ', e);
        }
    }

    function resetNewPassword(newPwd, type) {
        if (type === 'new') {
            setResetPassword({ ...resetPassword, 'password': newPwd });
        } else {
            setResetPassword({ ...resetPassword, 'confirmPassword': newPwd });
        }
    }

    function updateUserPassword() {
        if (resetPassword.password && resetPassword.confirmPassword) {
            if (resetPassword.password === resetPassword.confirmPassword) {
                const userIdFromCookie = resetPswCookie?.id;
                togglePageLoader(true);
                toggleEmailVerifyClass('');
                setConfirmPwdMessage('');
                try {
                    updatePassword(userIdFromCookie, resetPassword.password).subscribe(() => {
                        togglePageLoader(false);
                        toggleResetPwdModal(false);
                        //password reset success
                        dispatch(displayNotification({
                            msg: "Password changed successfully",
                            type: NOTIFICATION_SUCCCESS,
                            time: 3000
                        }));
                        //to login with new password redirect to login screen
                    });
                } catch (e) {
                    togglePageLoader(false);
                    dispatch(displayNotification({
                        msg: "Something went wrong, please try again in sometime!",
                        type: NOTIFICATION_ERROR,
                        time: 3000
                    }));
                    console.log('password change error: ', e);
                }
            } else {
                toggleEmailVerifyClass('error');
                setConfirmPwdMessage('Password should match!');
            }
        } else {
            toggleEmailVerifyClass('error');
            setConfirmPwdMessage('Please enter password and confirm password!');
        }
    }

    // function sendResetEmailLink() {
    //     if (resetEmailRef.current) {
    //         const resetEmailValue = resetEmailRef.current.value;
    //         if (!resetEmailValue) {
    //             setEmailVerificationMessage('Enter email id!');
    //             toggleEmailVerifyClass('error');
    //         } else if (resetEmailValue.length && !validateEmailId(resetEmailValue)) {
    //             setEmailVerificationMessage('Enter valid email id!');
    //             toggleEmailVerifyClass('error');
    //         } else {
    //             setEmailVerificationMessage('');
    //             toggleEmailVerifyClass('');
    //             try {
    //                 firebase.auth().sendPasswordResetEmail(resetEmailValue)
    //                     .then(function () {
    //                         setEmailVerificationMessage('Please check your email for reset link!');
    //                         toggleEmailVerifyClass('success');
    //                     }).catch(function (e) {
    //                         setEmailVerificationMessage('Something went wrong, try login with Gmail or Facebook!');
    //                         toggleEmailVerifyClass('error');
    //                     });
    //             } catch (e) {
    //                 setEmailVerificationMessage('Something went wrong, try login with Gmail or Facebook!');
    //                 toggleEmailVerifyClass('error');
    //             }
    //         }
    //     }
    // }

    return (
        <div className="login-wrap new-login-signup-ui clearfix gradient-bg-animation darkMode">
            {
                isPageLoaderActive ?
                    <Loader /> : ''
            }
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
                        By logging in you agree to our<br />
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
                                <input
                                    type="email"
                                    placeholder="Enter valid email id"
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                    title="Email" />
                                <p className="emailLinkBtn" onClick={() => sendResetEmailLink()} title="send link to email">
                                    <label>
                                        <span>Send</span>
                                    </label>
                                </p>
                            </div>
                            <p className={`emailVerifyMessage ${emailVerifyClass}`}>{emailVerifyMessage}</p>
                        </div> : ''
                }
                {
                    isResetPasswordViewOpen ?
                        <div className="forgotPwdBox resetPwdBox">
                            <div className="logoWrap">
                                <img src={boogaluLogo} alt="Boogalu" />
                            </div>
                            <p className="closeModal" onClick={() => togglePwdResetLayer(false)}></p>
                            <h2>Reset your password</h2>
                            <div className="inputWrap">
                                <input
                                    type="password"
                                    placeholder="New password"
                                    value={resetPassword.password}
                                    onChange={(e) => resetNewPassword(e.target.value, 'new')}
                                    title="New password" />
                                <input
                                    type="password"
                                    placeholder="Confirm password"
                                    value={resetPassword.confirmPassword}
                                    onChange={(e) => resetNewPassword(e.target.value, 'confirm')}
                                    title="New password" />
                                <p className="emailLinkBtn" onClick={() => updateUserPassword()} title="send link to email">
                                    <label>
                                        <span>Reset</span>
                                    </label>
                                </p>
                            </div>
                            <p className={`emailVerifyMessage ${emailVerifyClass}`}>{confirmPasswordMessage}</p>
                        </div> : ''
                }
            </div>
            {/* <div className="img-wrap">
                <img src={bgImg} alt="background" />
            </div> */}
            {openVdoUploadModal ? <VideoUploader handleClose={() => setOpenVdoUploadModal(false)} /> : ''}
            {openInformationModal ? <GenericInfoModal 
                title={infoModalTitle}
                message={infoModalMessage}
                status={infoModalStatus}
                navigateUrl={navigateLink}
                closeInfoModal={shouldCloseInfoModal}
            /> : ''}
            {/* <ul className="circles">
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
            </ul> */}
        </div>
    );
}