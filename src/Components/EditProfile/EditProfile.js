import React, { useState, useEffect } from 'react';
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
import ArrowRightSharpIcon from '@material-ui/icons/ArrowRightSharp';
import { updateUser } from "../../Services/User.service";
import { uploadImage } from "../../Services/Upload.service";
import * as $ from 'jquery';

export default function EditProfile() {
    const { state, dispatch } = useStoreConsumer();
    const history = useHistory();
    let loggedInUser = state.loggedInUser;
    // get data from history props if redirected through google or facebook login
    if (history.location.state && (history.location.state.source == 'Facebook' || history.location.state.source == 'Google')) {
        loggedInUser.email = history.location.state.email;
        loggedInUser.name = history.location.state.name;
        // setNeedToRegisterError('You are not registered yet, Please register with Choreoculture.')
    }
    const [userDetails, setUserDetails] = useState(loggedInUser);
    const [SignUpError, setSignUpError] = useState(null);
    const [showHidePassword, setShowHidePassword] = useState({ showPassword: false, showConfirmPassword: false });
    const [IsProfileImageChanged, setIsProfileImageChanged] = useState(false);
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

    useEffect(() => {
        $('html,body').animate({
            scrollTop: 0
        }, 500);
    }, [])

    const setSignupUserCred = (e) => {
        if (userDetails.password != userDetails.confirmPassword) {
            setSignUpError('Password dose not match.');
            return;
        }
        if (IsProfileImageChanged) {
            uploadImage(userDetails.profileImage, 'user', 'small').subscribe((downloadableUrl) => {
                userDetails.profileImage = downloadableUrl;
                updateUser(userDetails.key, userDetails).subscribe(() => {
                    dispatch(signupUser(userDetails));
                    history.push(({
                        pathname: '/profile',
                        state: null
                    }));
                })
            })
        } else {
            updateUser(userDetails.key, userDetails).subscribe(() => {
                dispatch(signupUser(userDetails));
                history.push(({
                    pathname: '/profile',
                    state: null
                }));
            })
        }
        e.preventDefault();
    }

    async function onChangeFile(event) {
        event.stopPropagation();
        event.preventDefault();
        var file = event.target.files[0];
        console.log(file);
        if (file) {
            setUserDetails({ ...userDetails, profileImage: null });
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                setIsProfileImageChanged(true);
                setUserDetails({ ...userDetails, profileImage: reader.result });
            }
            reader.onerror = error => console.error(error);
        } else setIsProfileImageChanged(false);
    }

    return (
        <div className="logout-wrap clearfix">
            <form className="form-wrap clearfix" onSubmit={setSignupUserCred}>
                <div className="heading-outer">
                    <div className="heading1">Update Profile</div>
                </div>
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
                            InputProps={{ readOnly: true }}
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
                            InputProps={{ readOnly: true }}
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
                    <div className="submit-btn clearfix">
                        <Button variant="contained" type="submit" color="primary" >Update
                         <ArrowRightSharpIcon />
                        </Button>
                    </div>
                </div>
            </form>
            <div className="img-wrap">
                <img src={bgImg} alt="bg1" />
            </div>
        </div>
    );
}