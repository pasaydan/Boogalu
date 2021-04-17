import React, { useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Checkbox from '@material-ui/core/Checkbox';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Button from '@material-ui/core/Button';
import boogaluLogo from '../../Images/Boogalu-logo.svg';
import logOutIcon from '../../Images/logout-icon.png';
import { uploadImage } from "../../Services/Upload.service";
import { Link } from 'react-router-dom';
import { saveSubscription } from "../../Services/Subscription.service";
import { ADMIN_USER, ADMIN_PWD } from '../../Constants';
import championIcon from '../../Images/champion-box-icon.png';
import lessonsIcon from '../../Images/lessons-icon.png';
import subscribeIcon from '../../Images/subscribe-icon.png';

const checkAdminLogIn = JSON.parse(localStorage.getItem('adminLoggedIn'));

export default function Subscription() {
    const initialSubscriptionData = {
        name: "",
        desc: "",
        active: true,
        type: "",
        amount: "",
        img: "",
        startAt: "",
        endAt: "",
        plans: "",
    }
    const [Subscription, setSubscription] = useState(initialSubscriptionData);
    const [isAdminLoggedIn, toggleAdminLogin] = useState(false);
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPwd, setAdminPwd] = useState('');
    const [loggedInMessages, setLoginMessage] = useState('');

    useEffect(() => {
      if (checkAdminLogIn) {
        toggleAdminLogin(checkAdminLogIn);
      }  
    }, []);

    function handleAdminLogin(value, type) {
        if (type === 'email') {
            setAdminEmail(value?.target?.value);
        } else {
            setAdminPwd(value?.target?.value);
        }
    }

    function triggerLogin(event, action) {
        if (action && (adminEmail && adminEmail === ADMIN_USER && adminPwd && adminPwd === ADMIN_PWD)) {
            setLoginMessage('');
            toggleAdminLogin(true);
            localStorage.setItem('adminLoggedIn', true);
        } else {
            toggleAdminLogin(false);
            localStorage.setItem('adminLoggedIn', false);
            setLoginMessage('Invalid credentials, please enter valid email-Id and Password!');
        }
    }

    function tiggerAdminLogout(event, action) {
        setAdminEmail('');
        setAdminPwd('');
        toggleAdminLogin(action);
        localStorage.setItem('adminLoggedIn', action);
        window.location.reload();
    }

    const handleChange = (prop, index) => (event) => {
        let value = event.target.value;
        if (prop === 'active') value = event.target.checked;
        if (prop === 'prices') {
            Subscription.prices[index] = event.target.value;
            value = Subscription.prices;
        }
        setSubscription({ ...Subscription, [prop]: value });
    };

    async function saveDetails(e) {
        console.log(Subscription)
        // upload Subscription image to bucket
        if (Subscription.img[0]) {
            const reader = new FileReader();
            reader.readAsDataURL(Subscription.img[0]);
            reader.onload = () => {
                uploadImage(reader.result, 'subscription', 'small').subscribe((downloadableUrl) => {
                    Subscription.img = downloadableUrl;
                    // save Subscription data to db with imag url
                    saveSubscription(Subscription).subscribe((response) => {
                        console.log('Subscription success', response);
                        setSubscription(initialSubscriptionData);
                    })
                })
            }
        } else {
            saveSubscription(Subscription).subscribe((response) => {
                console.log('Subscription success', response);
                setSubscription(initialSubscriptionData);
            })
        }
    }
    return (
        <div className="adminPanelSection">
            <nav className="adminNavigation">
                <Link to="/adminpanel/competition" title="create championship" className="panelLink">
                    <span className="iconsWrap championIconWrap">
                        <img src={championIcon} alt="championship" />
                    </span>
                    <span className="title champion">
                        Championship
                    </span>
                </Link>
                <Link to="/adminpanel/lessons" title="upload new lessons" className="panelLink">
                    <span className="iconsWrap lessonsIconWrap">
                        <img src={lessonsIcon} alt="lessons" />
                    </span>
                    <span className="title">
                        Lessons
                    </span>
                </Link>
                <Link to="/adminpanel/subscription" title="create subscription" className="panelLink active">
                    <span className="iconsWrap subscribeIconWrap">
                        <img src={subscribeIcon} alt="subscription" />
                    </span>
                    <span className="title">
                        Subscription
                    </span>
                </Link>
            </nav>
            <div className="logoWrap">
                <img src={boogaluLogo} alt="Boogalu" />
            </div>
            <div className={`subscription-bo-wrap clearfix ${(isAdminLoggedIn || checkAdminLogIn) && 'loggedInAdmin'}`}>
                {
                    isAdminLoggedIn || checkAdminLogIn ?
                    <a className="logOutIconWrap" title="logout" onClick={(e) => tiggerAdminLogout(e, false)}>
                        <img src={logOutIcon} alt="logout" />
                    </a> : ''
                }
                {
                    isAdminLoggedIn || checkAdminLogIn ?
                        <h1>
                            <Link to="/adminpanel" title="back to admin" className="backToAdmin">
                                <span>
                                    &#8592;
                                </span>
                            </Link>
                            Create a new Subscription
                        </h1>
                    :
                        <h1>
                            <Link to="/adminpanel" title="back to admin" className="backToAdmin">
                                <span>
                                    &#8592;
                                </span>
                            </Link>
                            Login to create new Subscription
                        </h1>
                }
                {
                    isAdminLoggedIn || checkAdminLogIn ?
                    <div className="inner-form-wrap">
                        <div className="input-wrap">
                            <TextField className="input-field"
                                required
                                id="outlined-required-name"
                                label="Name"
                                onChange={handleChange('name')}
                                value={Subscription.name}
                                variant="outlined"
                            />
                        </div>
                        <div className="input-wrap">
                            <TextField className="input-field"
                                id="outlined-required-desc"
                                label="Description"
                                onChange={handleChange('desc')}
                                value={Subscription.desc}
                                variant="outlined"
                            />
                        </div>
                        <div className="input-wrap">
                            <TextField className="input-field"
                                id="outlined-required-amount"
                                label="Amount"
                                type="number"
                                onChange={handleChange('amount')}
                                value={Subscription.amount}
                                variant="outlined"
                            />
                        </div>
                        <div className="input-wrap">
                            <FormControl variant="outlined" className="input-field">
                                <InputLabel id="select-outlined-label">Plans</InputLabel>
                                <Select
                                    labelId="select-outlined-label"
                                    id="select-outlined"
                                    value={Subscription.plans}
                                    onChange={handleChange('plans')}
                                >
                                    <MenuItem value="monthly">Monthly</MenuItem>
                                    <MenuItem value="annual">Annual</MenuItem>
                                </Select>
                            </FormControl>
                        </div>
                        <div className="input-wrap data-time-wrap">
                            <TextField
                                id="datetime-local-start"
                                label="Start Date & Time"
                                type="datetime-local"
                                value={Subscription.startAt}
                                onChange={handleChange('startAt')}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                            <TextField
                                id="datetime-local-end"
                                label="End Date & Time"
                                type="datetime-local"
                                value={Subscription.endAt}
                                onChange={handleChange('endAt')}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </div>
                        <div className="input-wrap action-wrap">
                            <Button variant="contained" color="primary">Cancel</Button>
                            <Button variant="contained" color="secondary" onClick={(e) => saveDetails(e)}>Save</Button>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        required
                                        color="primary"
                                        className="selected-item-checkbox"
                                        checked={Subscription.active}
                                        onChange={handleChange('active')}
                                        inputProps={{ 'aria-label': 'secondary checkbox' }}
                                    />
                                }
                                label="Active Subscription"
                            />
                        </div>
                    </div> : 

                    <div className="login-admin-form">
                        <p className="errorMessage">{loggedInMessages}</p>
                        <div className="input-wrap">
                            <TextField className="input-field"
                                required
                                id="admin-id"
                                label="Email Id"
                                onChange={value => handleAdminLogin(value, 'email')}
                                variant="outlined"
                            />
                        </div>    
                        <div className="input-wrap">
                            <TextField className="input-field"
                                required
                                id="admin-pwd"
                                type="password"
                                label="Password"
                                onChange={value => handleAdminLogin(value, 'pwd')}
                                variant="outlined"
                            />
                        </div>
                        <div className="input-wrap action-wrap">
                            <Button variant="contained" color="secondary" onClick={(e) => triggerLogin(e, true)}>Login</Button>
                        </div>
                    </div>
                }
            </div>
            <div className="footerBox">
                &copy; 2021 Box Puppet Ent. Pvt. Ltd., All rights reserved. 
            </div>
        </div>
    )
}
