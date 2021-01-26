import React, { useState, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import { useStoreConsumer } from '../../Providers/StateProvider';
import { GoogleLogin } from 'react-google-login';
import FacebookLogin from 'react-facebook-login';
import FacebookIcon from '@material-ui/icons/Facebook';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import ArrowRightSharpIcon from '@material-ui/icons/ArrowRightSharp';
import bgImg from '../../Images/bg1.svg';
import { loginUser, signupUser } from '../../Actions/User/index';
import { getUserByEmail, getUserByPhone } from "../../Services/User.service";
import * as $ from 'jquery';

export default function Login() {
    const { state, dispatch } = useStoreConsumer();
    const history = useHistory();
    const [loginCred, setloginCred] = useState({ username: "", password: "", showPassWord: false })
    const [LoginError, setLoginError] = useState(null);
    const [thirdPartyResponse, setThirdPartyResponse] = useState({ isLogginSuccess: false, data: null, source: '' })

    useEffect(() => {
        if (thirdPartyResponse.source === 'Facebook') signinUser('', 'Facebook');
        if (thirdPartyResponse.source === 'Google') signinUser('', 'Google');
    }, [thirdPartyResponse]);

    useEffect(() => {
        $('html,body').animate({
            scrollTop: 0
        }, 500);
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
        if (response.error != "idpiframe_initialization_failed") {
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
                        if (state.competitionLogginFlow) history.push('/competitions');
                        else history.push('/')
                    })
                    .catch((data) => {
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
                        setLoginResponseToServer();
                        data.source = thirdPartyResponse.source;
                        dispatch(loginUser(data));
                        if (state.competitionLogginFlow) history.push('/competitions');
                        else history.push('/')
                    })
                    .catch((data) => {
                        if (data) {
                            data.source = thirdPartyResponse.source;
                            //user not registered
                            history.push({
                                pathname: '/register',
                                state: data
                            })
                        }
                    })
                break;
        }
    }

    return (
        <div className="login-wrap clearfix">
            <form className="form-wrap clearfix" onSubmit={(e) => signinUser(e, 'cred')}>
                <div className="heading-outer">
                    <div className="heading1">Welcome Back!</div>
                    <div className="heading2">Login to your existant account of Choreoculture.</div>
                </div>
                <div className="form-outer clearfix">
                    <div className="input-wrap">
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
                    <div className="action-wrap">
                        {LoginError && <div className="login-error">
                            {LoginError}
                        </div>}
                        <div className="submit-btn clearfix">
                            <Button variant="contained" type="submit" color="primary">Sign In
                            <ArrowRightSharpIcon />
                            </Button>
                        </div>
                        <div className="forgot-password clearfix">
                            <div>Forgot Password ?</div>
                        </div>
                    </div>
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
                    <div className="already-login-wrap">
                        <div className="text-wrap">New to Choreoculture?</div>
                        <Button color="primary" onClick={() => history.push('/register')}>SIGN UP</Button>
                    </div>
                </div>
            </form>

            <div className="img-wrap">
                <img src={bgImg} />
            </div>
        </div>
    );
}