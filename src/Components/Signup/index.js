import React, { useState } from 'react';
import { useHistory } from "react-router-dom";
import { useStoreConsumer } from '../../Providers/StateProvider';
import { signupUser } from '../../Actions/User';
import bgImg from '../../Images/bg1.svg';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import Checkbox from '@material-ui/core/Checkbox';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import './signup.css';
import ArrowRightSharpIcon from '@material-ui/icons/ArrowRightSharp';

export default function Signup() {
    const { state, dispatch } = useStoreConsumer();
    const history = useHistory();
    // const [NeedToRegisterError, setNeedToRegisterError] = useState('');
    let loggedInUser = state.loggedInUser;
    // if user already login then redirect to home
    if (loggedInUser.name && loggedInUser.phone && loggedInUser.email && loggedInUser.username) history.push({
        pathname: '/',
        state: null
    })
    // get data from history props if redirected through google or facebook login
    if (history.location.state && (history.location.state.source == 'Facebook' || history.location.state.source == 'Google')) {
        loggedInUser.email = history.location.state.email;
        loggedInUser.name = history.location.state.name;
        // setNeedToRegisterError('You are not registered yet, Please register with Boogalu.')
    }
    const [userDetails, setUserDetails] = useState(loggedInUser);
    const [SignUpError, setSignUpError] = useState(null);
    const [showHidePassword, setShowHidePassword] = useState({ showPassword: false, showConfirmPassword: false });

    const handleChange = (prop) => (event) => {
        setUserDetails({ ...userDetails, [prop]: event.target.value });
        console.log(userDetails)
    };

    const handleClickShowPassword = (prop) => {
        setShowHidePassword({ ...showHidePassword, [prop]: !showHidePassword[prop] });
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const registerUser = () => {
        return new Promise((res, rej) => {
            let registeredUser = localStorage.getItem('users') ? JSON.parse(localStorage.getItem('users')) : [];
            registeredUser.push(userDetails);
            localStorage.setItem('users', JSON.stringify(registeredUser))
            res();
        })
    }

    const checkForRepeatedEmailPhone = (param) => {
        let registeredUser = localStorage.getItem('users') ? JSON.parse(localStorage.getItem('users')) : [];
        if (registeredUser && registeredUser.length != 0) {
            let isRegisteredUser = registeredUser.filter((user) => (user[param] == userDetails[param]));
            if (isRegisteredUser.length) {
                setSignUpError(param + ' already registered.');
                return false;
            } else {
                return true;
            }
        } else {
            return true;
        }
    }

    const setSignupUserCred = (e) => {
        if (userDetails.password != userDetails.confirmPassword) {
            setSignUpError('Password dose not match.');
            return;
        }

        if (checkForRepeatedEmailPhone('email') && checkForRepeatedEmailPhone('phone')) {
            registerUser()
                .then(() => {
                    dispatch(signupUser(userDetails));
                    history.push(({
                        pathname: '/',
                        state: null
                    }));
                })
                .catch((error) => {
                    // error in user registration
                    if (error) {

                    }
                })
        }
        e.preventDefault();
        e.stopPropagation();
    }

    return (
        <div className="logout-wrap clearfix">
            <form className="form-wrap clearfix" onSubmit={setSignupUserCred}>
                <div className="heading-outer">
                    <div className="heading1">Let's Get Started!</div>
                    <div className="heading2">Create an account to Boogalu to get all features.</div>
                </div>
                {/* {NeedToRegisterError && <div className="login-error">
                    {NeedToRegisterError}
                </div>} */}
                <div className="form-outer clearfix">
                    <div className="input-wrap">
                        <TextField className="input-field"
                            required
                            id="outlined-required-Name"
                            label="Name"
                            onChange={handleChange('name')}
                            value={userDetails.name}
                            variant="outlined"
                        />
                    </div>
                    <div className="input-wrap">
                        <TextField className="input-field"
                            required
                            id="outlined-required-Username"
                            label="Username"
                            onChange={handleChange('username')}
                            value={userDetails.username}
                            variant="outlined"
                        />
                    </div>
                    <div className="input-wrap">
                        <TextField className="input-field"
                            required
                            type="tel"
                            id="outlined-required-phone"
                            label="Phone"
                            onChange={handleChange('phone')}
                            value={userDetails.phone}
                            variant="outlined"
                        />
                    </div>
                    <div className="input-wrap">
                        <TextField className="input-field"
                            required
                            id="outlined-required-email"
                            label="Email"
                            type="email"
                            onChange={handleChange('email')}
                            value={userDetails.email}
                            variant="outlined"
                        />
                    </div>
                    <div className="input-wrap">
                        <TextField className="input-field"
                            required
                            id="outlined-required-country"
                            label="Country"
                            onChange={handleChange('country')}
                            value={userDetails.country}
                            variant="outlined"
                        />
                    </div>
                    <div className="input-wrap">
                        <TextField className="input-field"
                            required
                            id="outlined-required-state"
                            label="State"
                            onChange={handleChange('state')}
                            value={userDetails.state}
                            variant="outlined"
                        />
                    </div>
                    <div className="input-wrap">
                        <FormControl className="" variant="outlined" style={{ width: '100%' }}>
                            <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                            <OutlinedInput
                                required
                                id="outlined-adornment-password"
                                type={showHidePassword.showPassword ? 'text' : 'password'}
                                value={userDetails.password}
                                onChange={handleChange('password')}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={() => handleClickShowPassword('showPassword')}
                                            onMouseDown={handleMouseDownPassword}
                                            edge="end"
                                        >
                                            {showHidePassword.showPassword ? <Visibility /> : <VisibilityOff />}
                                        </IconButton>
                                    </InputAdornment>
                                }
                                labelWidth={70}
                            />
                        </FormControl>
                    </div>
                    <div className="input-wrap">
                        <FormControl className="" variant="outlined" style={{ width: '100%' }}>
                            <InputLabel htmlFor="outlined-adornment-confirm-password">Confirm Password</InputLabel>
                            <OutlinedInput
                                required
                                id="outlined-adornment-confirm-password"
                                type={showHidePassword.showConfirmPassword ? 'text' : 'password'}
                                value={userDetails.confirmPassword}
                                onChange={handleChange('confirmPassword')}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle confirm password visibility"
                                            onClick={() => handleClickShowPassword('showConfirmPassword')}
                                            onMouseDown={handleMouseDownPassword}
                                            edge="end"
                                        >
                                            {showHidePassword.showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                                        </IconButton>
                                    </InputAdornment>
                                }
                                labelWidth={70}
                            />
                        </FormControl>
                    </div>
                    <div className="input-wrap">
                        <div className="dob-wrap">
                            <TextField className="input-field"
                                id="date"
                                label="Birthday"
                                type="date"
                                style={{ width: '100%' }}
                                onChange={handleChange('dob')}
                                value={userDetails.dob}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </div>
                    </div>
                    <div className="input-wrap">
                        <FormControl variant="outlined" className="input-field">
                            <InputLabel id="select-outlined-label">Gender</InputLabel>
                            <Select
                                labelId="select-outlined-label"
                                id="select-outlined"
                                value={userDetails.gender}
                                onChange={handleChange('gender')}
                                label="Gender"
                            >
                                <MenuItem value="Male">Male</MenuItem>
                                <MenuItem value="Female">Female</MenuItem>
                                <MenuItem value="Other">Other</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                    <div className="input-wrap" style={{ width: '93%' }}>
                        <TextField className="input-field bio-input"
                            id="outlined-required-bio"
                            label="Bio"
                            value={userDetails.bio}
                            onChange={handleChange('bio')}
                            variant="outlined"
                        />
                    </div>
                    <div className="tnc-wrap">
                        <div className="tnc-content clearfix">
                            <div className="checkbox-wrap">
                                <Checkbox
                                    required
                                    color="primary"
                                    checked={userDetails.tnc}
                                    onChange={(e) => setUserDetails({ ...userDetails, tnc: e.target.checked })}
                                    inputProps={{ 'aria-label': 'secondary checkbox' }}
                                />
                            </div>
                            <div className="note-wrap">Yes, I agree to the terms and conditions </div>
                        </div>
                    </div>
                    {SignUpError && <div className="login-error">
                        {SignUpError}
                    </div>}
                    <div className="submit-btn">
                        <Button variant="contained" type="submit" color="primary" >Sign Up
                         <ArrowRightSharpIcon />
                        </Button>
                    </div>
                    <div className="already-login-wrap">
                        <div className="text-wrap">Already have an account?</div>
                        <Button color="primary" onClick={() => history.push({
                            pathname: '/login',
                            state: null
                        })}>SIGN IN</Button>
                    </div>
                </div>
            </form>
            <div className="img-wrap">
                <img src={bgImg} alt="bg1" />
            </div>
        </div>
    );
}