import React, { useRef, useState, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import { useStoreConsumer } from '../../Providers/StateProvider';
import { signupUser } from '../../Actions/User';
import bgImg from '../../Images/bg1.svg';
import Button from '@material-ui/core/Button';
import boogaluLogo from '../../Images/Boogalu-logo.svg';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import IconButton from '@material-ui/core/IconButton';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputAdornment from '@material-ui/core/InputAdornment';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import Checkbox from '@material-ui/core/Checkbox';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { FaPlus, FaEdit } from 'react-icons/fa';
import stepListData from '../../Data/RegistrationStepData'
import ArrowRightSharpIcon from '@material-ui/icons/ArrowRightSharp';
import { registerUser, getUserByEmail, getUserByPhone } from "../../Services/User.service";
import { enableLoading, disableLoading } from "../../Actions/Loader";
import { displayNotification } from "../../Actions/Notification";
import { NOTIFICATION_SUCCCESS, NOTIFICATION_ERROR, MALE_PROFILE_DEFAULT_IMAGE, FEMALE_PROFILE_DEFAULT_IMAGE } from "../../Constants";
import { uploadImage } from "../../Services/Upload.service";
import * as $ from 'jquery';
import { FormControlLabel, FormGroup, FormLabel, Radio, RadioGroup } from '@material-ui/core';
export default function Signup() {
    const { state, dispatch } = useStoreConsumer();
    const history = useHistory();
    let loggedInUser = state.loggedInUser;
    // if user already login then redirect to home
    if (loggedInUser.name && loggedInUser.phone && loggedInUser.email && loggedInUser.username) history.push({
        pathname: '/',
        state: null
    })
    // get data from history props if redirected through google or facebook login
    if (history.location.state && (history.location.state.source === 'Facebook' || history.location.state.source === 'Google')) {
        loggedInUser.email = history.location.state.email;
        loggedInUser.name = history.location.state.name;
        // setNeedToRegisterError('You are not registered yet, Please register with Choreoculture.')
    }
    const [userDetails, setUserDetails] = useState(loggedInUser);
    const [SignUpError, setSignUpError] = useState(null);
    const [showHidePassword, setShowHidePassword] = useState({ showPassword: false, showConfirmPassword: false });

    const [activeStep, setActiveStep] = useState(6);
    const [showNextButton, setShowNextButton] = useState(false);
    const [stepData, setStepListData] = useState(stepListData);
    const [selectedOptionsList, setSelectedOptionsList] = useState([]);
    const [isUserPhotoUploaded, userPhotoUploadToggle] = useState(false);
    const uploaderRef = useRef(null);

    const handleChange = (prop) => (event) => {
        setUserDetails({ ...userDetails, [prop]: event.target.value });
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
        if (userDetails && !userDetails.profileImage) {
            setUserDetails({ ...userDetails, profileImage: MALE_PROFILE_DEFAULT_IMAGE })
        }
    }, [])

    useEffect(() => {
        if (stepData[activeStep]) {
            let isAnySelected = stepData[activeStep].filter((data) => data.isSelected);
            if (isAnySelected.length != 0) setShowNextButton(true);
            else setShowNextButton(false);
            // set selected options
            let selectedOptions = [];
            Object.entries(stepData).map(([parentKey, parentValue]) => {
                parentValue.map((parentValueItem) => {
                    if (parentValueItem.isSelected) {
                        let selectionObj = { value: [parentValueItem.title], key: parentKey, heading: parentValueItem.heading };
                        if (selectedOptions.length != 0) {
                            let isAvl = selectedOptions.filter((data) => data.key === parentKey);
                            if (isAvl.length != 0) {
                                selectedOptions.map((item) => {
                                    if (item.key === parentKey) item.value.push(parentValueItem.title);
                                })
                            } else selectedOptions.push(selectionObj);
                        } else selectedOptions.push(selectionObj);
                    }
                })
            })
            setSelectedOptionsList(selectedOptions);
        }
    }, [activeStep])

    const saveUserRegistrationDetails = () => {
        return new Promise((res, rej) => {
            dispatch(enableLoading());
            if (userDetails.profileImage != MALE_PROFILE_DEFAULT_IMAGE) {
                uploadImage(userDetails.profileImage, 'user', 'small').subscribe((downloadableUrl) => {
                    userDetails.profileImage = downloadableUrl;
                    registerUser(userDetails).subscribe((data) => {
                        console.log('user registered success', data);
                        res(data.key);
                    })
                })
            } else {
                registerUser(userDetails).subscribe((data) => {
                    console.log('user registered success', data);
                    res(data.key);
                })
            }
        })
    }

    const checkForUsedPhone = () => {
        return new Promise((res, rej) => {
            getUserByPhone(userDetails.phone).subscribe((data) => {
                dispatch(disableLoading());
                if (data && data.length) {
                    setSignUpError('Phone already registered.');
                    rej(false);
                } else {
                    res(true);
                }
            })
        })
    }

    const checkForUsedEmail = () => {
        return new Promise((res, rej) => {
            getUserByEmail(userDetails.email).subscribe((data) => {
                dispatch(disableLoading());
                if (data && data.length) {
                    setSignUpError('Email already registered.');
                    rej(false);
                } else {
                    res(true);
                }
            })
        })
    }

    const redirection = () => {
        dispatch(signupUser(userDetails));
        dispatch(displayNotification({
            msg: "Registration successfully",
            type: NOTIFICATION_SUCCCESS,
            time: 3000
        }));
        if (state.currentLoginFlow == 'competition') history.push('/competitions');
        else if (state.currentLoginFlow == 'subscription') history.push('/subscription');
        if (state.currentLoginFlow == 'upload-video') history.push('/upload-video');
        else history.push(({
            pathname: '/',
            state: null
        }));
    }

    const setSignupUserCred = (e) => {
        dispatch(enableLoading());
        if (userDetails.password != userDetails.confirmPassword) {
            setSignUpError('Password dose not match.');
            return;
        }

        Promise.all([checkForUsedEmail(), checkForUsedPhone()]).then(() => {
            saveUserRegistrationDetails()
                .then((userKey) => {
                    userDetails.key = userKey;
                    dispatch(disableLoading());
                    // dispatch(signupUser(userDetails));
                    // dispatch(displayNotification({
                    //     msg: "Registration successfully",
                    //     type: NOTIFICATION_SUCCCESS,
                    //     time: 3000
                    // }));
                    setActiveStep('stepOne');
                })
                .catch((error) => {
                    // error in user registration
                    if (error) {

                    }
                })
        }).catch(error => {
            console.error(error)
        });
        e.preventDefault();
    }

    const setNextStep = () => {
        switch (activeStep) {
            case 'stepOne': setActiveStep('stepTwo'); break;
            case 'stepTwo': setActiveStep('stepThree'); break;
            case 'stepThree': setActiveStep('stepFour'); break;
            case 'stepFour': redirection(); break;
            // case 'stepFive': setActiveStep(6); break;
        }
    }

    const setPrevStep = () => {
        switch (activeStep) {
            case 'stepTwo': setActiveStep('stepOne'); break;
            case 'stepThree': setActiveStep('stepTwo'); break;
            case 'stepFour': setActiveStep('stepThree'); break;
            // case 'stepFive': setActiveStep('stepFour'); break;
            // case 6: setActiveStep('stepFour'); break;
        }
    }

    const setStepListItemData = (e, activeItem, status) => {
        e.preventDefault();
        e.stopPropagation();
        const stepDataList = Object.assign({}, stepData);
        stepDataList[activeStep].map((item) => {
            if (item.title === activeItem.title) {
                item.isSelected = item.isSelected ? false : true;
            } else {
                if (status != 'multi-select') {
                    item.isSelected = false;
                }
            }
        })
        // set selected options
        let selectedOptions = [];
        Object.entries(stepDataList).map(([parentKey, parentValue]) => {
            parentValue.map((parentValueItem) => {
                if (parentValueItem.isSelected) {
                    let selectionObj = { value: [parentValueItem.title], key: parentKey, heading: parentValueItem.heading };
                    if (selectedOptions.length != 0) {
                        let isAvl = selectedOptions.filter((data) => data.key === parentKey);
                        if (isAvl.length != 0) {
                            selectedOptions.map((item) => {
                                if (item.key === parentKey) item.value.push(parentValueItem.title);
                            })
                        } else selectedOptions.push(selectionObj);
                    } else selectedOptions.push(selectionObj);
                }
            })
        })
        setSelectedOptionsList(selectedOptions);
        let isAnySelected = stepDataList[activeStep].filter((data) => data.isSelected);
        if (isAnySelected.length != 0) setShowNextButton(true);
        else setShowNextButton(false);
        setStepListData(stepDataList);
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
                userPhotoUploadToggle(true);
                setUserDetails({ ...userDetails, profileImage: reader.result });
            }
            reader.onerror = error => console.error(error);
        }
    }

    function goToPrevious(event) {
        history.goBack();
    }

    return (
        <div className="logout-wrap new-login-signup-ui signup-wrap gradient-bg-animation clearfix">
            <div className="inner-signup-wrap">
                <div className="header-outer">
                    <a onClick={(e) => goToPrevious(e)} className="arrow-back-home" title="Back">
                        <ArrowBackIcon />
                    </a>
                    <a href="/" className="logo" title="Back to Home">
                        <img src={boogaluLogo} alt="Boogalu" />
                    </a>
                </div>
                {activeStep != 6 && <div className="step-wrap">
                    <div className="heading1">Let's Get Started!</div>
                    {activeStep === 'stepOne' && <>
                        <div className="list-content">
                            <div className="list-heading-wrap">
                                <div className="heading2">What’s your experience with dancing?</div>
                                <div className="heading3">Select One Option</div>
                            </div>
                            <div className="list">
                                {stepData.stepOne.map((item, i) => {
                                    return (
                                        <div key={i} className={item.isSelected ? 'list-item selected-item' : 'list-item'} onClick={(e) => setStepListItemData(e, item)}>
                                            <div className="title">{item.title}</div>
                                            <div className="desc">{item.desc}</div>
                                            <Checkbox
                                                required
                                                color="primary"
                                                className="selected-item-checkbox"
                                                checked={item.isSelected}
                                                onChange={(e) => setStepListItemData(e, item)}
                                                inputProps={{ 'aria-label': 'secondary checkbox' }}
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </>}
                    {activeStep === 'stepTwo' && <>
                        <div className="list-content">
                            <div className="list-heading-wrap">
                                <div className="heading2">What is your first goal that you want to work on?</div>
                                <div className="heading3">Select One Option</div>
                            </div>
                            <div className="list">
                                {stepData.stepTwo.map((item, i) => {
                                    return (
                                        <div key={i} className={item.isSelected ? 'list-item selected-item' : 'list-item'} onClick={(e) => setStepListItemData(e, item)}>
                                            <div className="title">{item.title}</div>
                                            <div className="desc">{item.desc}</div>
                                            <Checkbox
                                                required
                                                color="primary"
                                                className="selected-item-checkbox"
                                                checked={item.isSelected}
                                                onChange={(e) => setStepListItemData(e, item)}
                                                inputProps={{ 'aria-label': 'secondary checkbox' }}
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </>}
                    {activeStep === 'stepThree' && <>
                        <div className="list-content">
                            <div className="list-heading-wrap">
                                <div className="heading2">What are you interested in?</div>
                                <div className="heading3">Select all that apply</div>
                            </div>
                            <div className="list">
                                {stepData.stepThree.map((item, i) => {
                                    return (
                                        <div key={i} className={item.isSelected ? 'list-item selected-item' : 'list-item'} onClick={(e) => setStepListItemData(e, item, 'multi-select')}>
                                            <div className="title">{item.title}</div>
                                            <div className="desc" style={{ paddingRight: '25px' }}>{item.desc}</div>
                                            <Checkbox
                                                required
                                                color="primary"
                                                className="selected-item-checkbox"
                                                checked={item.isSelected}
                                                onChange={(e) => setStepListItemData(e, item, 'multi-select')}
                                                inputProps={{ 'aria-label': 'secondary checkbox' }}
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </>}
                    {activeStep === 'stepFour' && <>
                        <div className="list-content">
                            <div className="list-heading-wrap">
                                <div className="heading2">How long would you like your dance sessions to be?</div>
                                <div className="heading3">Select One Option</div>
                            </div>
                            <div className="list">
                                {stepData.stepFour.map((item, i) => {
                                    return (
                                        <div key={i} className={item.isSelected ? 'list-item selected-item' : 'list-item'} onClick={(e) => setStepListItemData(e, item)}>
                                            <div className="title">{item.title}</div>
                                            <div className="desc">{item.desc}</div>
                                            <Checkbox
                                                required
                                                color="primary"
                                                className="selected-item-checkbox"
                                                checked={item.isSelected}
                                                onChange={(e) => setStepListItemData(e, item)}
                                                inputProps={{ 'aria-label': 'secondary checkbox' }}
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </>}
                    {activeStep === 'stepFive' && <>
                        <div className="list-content">
                            <div className="list-heading-wrap">
                                <div style={{ paddingBottom: 0 }} className="heading2">Your Personal Schedule & Recommendations</div>
                            </div>
                            <div className="list">
                                {selectedOptionsList.map((item, i) => {
                                    return (
                                        <div key={i} className="list-item selected-item" onClick={() => setActiveStep(item.key)}>
                                            <div className="title">{item.heading}</div>
                                            <div className="desc">
                                                {item.value.length === 1 &&
                                                    item.value.map((listValue, j) => {
                                                        return <span key={j}>{listValue} </span>
                                                    })
                                                }
                                                {item.value.length != 1 &&
                                                    item.value.map((listValue, j) => {
                                                        return <span key={j}>{listValue}, </span>
                                                    })
                                                }

                                            </div>
                                            {/* <Checkbox
                                                required
                                                color="primary"
                                                className="selected-item-checkbox"
                                                checked={true}
                                                disabled={true}
                                                inputProps={{ 'aria-label': 'secondary checkbox' }}
                                            /> */}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </>}
                    {activeStep != 6 && <div className="step-already-login-wrap clearfix">
                        <div className="text-wrap">Already have an account?</div>
                        <Button color="primary" onClick={() => history.push({
                            pathname: '/login',
                            state: null
                        })}>SIGN IN</Button>
                        {/* {
                            showNextButton ?
                                <div className={`next-prev-actions ${activeStep != 'stepOne' ? 'next-step-active' : ''} `}>
                                    {activeStep != 'stepOne' && <Button color="primary" variant="contained" className="next-btn previous" onClick={() => setPrevStep()}>Prev</Button>}
                                    {showNextButton && <Button color="primary" variant="contained" className="next-btn" onClick={() => setNextStep()}>Next</Button>}
                                </div> : ''
                        } */}
                        <div className={`next-prev-actions ${activeStep != 'stepOne' ? 'next-step-active' : ''} `}>
                            {activeStep != 'stepOne' && <Button color="primary" variant="contained" className="next-btn previous" onClick={() => setPrevStep()}>Prev</Button>}
                            {/* <Button color="primary" variant="contained" className="next-btn" onClick={() => setNextStep()}>Next</Button> */}
                            {showNextButton && <Button color="primary" variant="contained" className="next-btn" onClick={() => setNextStep()}>Next</Button>}
                            {!showNextButton && <Button color="primary" variant="contained" className="next-btn skip-btn" onClick={() => setNextStep()}>Skip</Button>}
                            {activeStep != 'stepFour' && <Button color="primary" variant="contained" className="next-btn skip-all-btn" onClick={() => redirection()}>Skip All</Button>}
                        </div>
                    </div>}
                </div>}
                {activeStep == 6 && <form className="form-wrap final-registration-block clearfix" onSubmit={setSignupUserCred}>
                    <div className="heading-outer">
                        <div className="heading1">Let's Get Started!</div>
                        <div className="heading2">Create an account to Choreoculture to get all features.</div>
                    </div>
                    {/* {NeedToRegisterError && <div className="login-error">
                        {NeedToRegisterError}
                    </div>} */}
                    <div className="profile-img-wrap">
                        <div className="uploaded-img" >
                            <img src={userDetails.profileImage} onClick={() => { uploaderRef.current.click() }} />
                        </div>
                        {
                            isUserPhotoUploaded ?
                                <i className="plus-icon"><FaEdit /></i>
                                :
                                <i className="plus-icon"><FaPlus /></i>
                        }
                        <input id="myInput"
                            type="file"
                            accept="image/*"
                            ref={uploaderRef}
                            onChange={(e) => onChangeFile(e)}
                        />
                        {/* <div className="upload-btn-file">
                            <Button
                                variant="contained" color="primary"
                                onClick={() => { uploaderRef.current.click() }}>Upload Video</Button>
                        </div>  */}
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
                            <FormControl className="" variant="outlined">
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
                            <FormControl className="" variant="outlined">
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
                        <div className="input-wrap bio-wrap">
                            <TextField className="input-field bio-input"
                                id="outlined-required-bio"
                                label="Bio"
                                value={userDetails.bio}
                                onChange={handleChange('bio')}
                                variant="outlined"
                            />
                        </div>
                        <div className="input-wrap">
                            <FormControl component="fieldset">
                                <FormLabel component="legend" className="static-label">Privacy *</FormLabel>
                                <RadioGroup row aria-label="privacy" name="privacy" defaultValue="Public" onChange={handleChange('privacy')}>
                                    <FormControlLabel
                                        value={'Public'}
                                        control={<Radio color="primary" />}
                                        label="Public"
                                        defaultChecked={true}
                                    />
                                    <FormControlLabel
                                        value={'Private'}
                                        control={<Radio color="primary" />}
                                        label="Private"
                                    />
                                </RadioGroup>
                            </FormControl>
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
                            <Button variant="contained" type="submit" color="primary" >Sign Up
                             <ArrowRightSharpIcon />
                            </Button>
                            {/* {activeStep != 'stepOne' && <Button color="primary" variant="contained" className="next-btn previous" onClick={() => setPrevStep()}>Prev</Button>} */}
                        </div>
                        <div className="already-login-wrap">
                            <div className="text-wrap">Already have an account?</div>
                            <Button color="primary" onClick={() => history.push({
                                pathname: '/login',
                                state: null
                            })}>SIGN IN</Button>
                        </div>
                    </div>
                </form>}

                <div className="img-wrap">
                    <img src={bgImg} alt="bg1" />
                </div>
            </div>
        </div>
    );
}