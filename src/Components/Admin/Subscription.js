import React, { useState, useEffect, useRef } from 'react';
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
import ActionToolTip from '../ActionTooltip';
import ConfirmationModal from '../ConfirmationModal';
import { Link } from 'react-router-dom';
import { saveSubscription, getSubscriptionsList, toggleActivateDeactivateSubscription, deleteSubscriptionByKey } from "../../Services/Subscription.service";
import { ADMIN_USER, ADMIN_PWD } from '../../Constants';
import championIcon from '../../Images/champion-box-icon.png';
import lessonsIcon from '../../Images/lessons-icon.png';
import subscribeIcon from '../../Images/subscribe-icon.png';
import usersIcon from '../../Images/users-icon.png';
import DateFnsUtils from '@date-io/date-fns';
import { formatISO } from 'date-fns';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import Loader from '../Loader';

const checkAdminLogIn = JSON.parse(localStorage.getItem('adminLoggedIn'));

export default function Subscription() {
    const initialSubscriptionData = {
        name: "",
        desc: "",
        active: true,
        type: "",
        amount: 199,
        planType: 'startup',
        isLessonAccess: true,
        isCompetitionAccess: false,
        startAt: formatISO(new Date(), 'yyyy-MM-dd HH:mm').substr(0, 16),
        endAt: formatISO(new Date(), 'yyyy-MM-dd HH:mm').substr(0, 16),
        plans: "monthly",
    }
    const [Subscription, setSubscription] = useState(initialSubscriptionData);
    const [isAdminLoggedIn, toggleAdminLogin] = useState(false);
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPwd, setAdminPwd] = useState('');
    const [loggedInMessages, setLoginMessage] = useState('');
    const [submitFormMessages, setSubmitFormMessage] = useState('');
    const [isSubscriptionLoading, toggleLoadingClass] = useState('');
    const [isSavedSuccessValue, toggleSaveSuccessValue] = useState('');
    const [isCreateFormTab, toggleCreateList] = useState(true);
    const [subscriptionsList, setSubscriptionList] = useState(null);
    const [isPageLoaderActive, togglePageLoader] = useState(false);
    const [isSubscriptionDeleteClicked, toggleSubscriptionModal] = useState(false);
    const [deleteSubscritionMessage, subscriptionActionMessage] = useState('');
    const [subscriptionDataToModify, setSubscriptionActionData] = useState(null);

    const createTabRef = useRef(null);
    const listTabRef = useRef(null);

    useEffect(() => {
      if (checkAdminLogIn) {
        toggleAdminLogin(checkAdminLogIn);
      }  
    }, []);

    function switchTabs(event, action) {
        if (action && action === 'create') {
            if (createTabRef.current && listTabRef.current) {
                createTabRef.current.classList.add('active');
                listTabRef.current.classList.remove('active');
            }
            toggleCreateList(true);
        } else {
            if (createTabRef.current && listTabRef.current) {
                listTabRef.current.classList.add('active');
                createTabRef.current.classList.remove('active');
                togglePageLoader(true);
                getSubscriptionList();
            }
            toggleCreateList(false);
        }
    }

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
            if (adminEmail === '' || adminPwd === '') {
                setLoginMessage('Please enter Email and Password!');
            } else {
                setLoginMessage('Invalid credentials, please enter valid email-Id and Password!');
            }
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
        if (prop === 'isLessonAccess') value = event.target.checked;
        if (prop === 'isCompetitionAccess') value = event.target.checked;
        if (prop === 'prices') {
            Subscription.prices[index] = event.target.value;
            value = Subscription.prices;
        }
        setSubscription({ ...Subscription, [prop]: value });
    };

    function setStartDate(date) {
        try {
            setSubscription({ ...Subscription, ['startAt']: date });
        } catch (e) {
            console.log('Start date error: ', e);
        }
    }
    
    function setEndDate(date) {
        try {
            setSubscription({ ...Subscription, ['endAt']: date });
        } catch (e) {
            console.log('End date error: ', e);
        }
    }

    function validateFormData() {
        let isFormValid = true;
        if (Subscription.name === '') {
            isFormValid = false;
            setSubmitFormMessage('Please enter subscription name/title!');
        } else if (Subscription.amount === '') {
            isFormValid = false;
            setSubmitFormMessage('Please enter subscription amount!');
        } else if (Subscription.amount < 199) {
            isFormValid = false;
            setSubmitFormMessage('Subscription amount cannot be less than 199!');
        } else if (!Subscription.isLessonAccess && !Subscription.isCompetitionAccess) {
            isFormValid = false;
            setSubmitFormMessage('Please at-least select one feature for user!');
        } else if (Subscription.startAt.split('T')[0] === Subscription.endAt.split('T')[0]) {
            isFormValid = false;
            setSubmitFormMessage('Subscription start and end date connot be same day!');
        } else {
            isFormValid = true;
        }
        
        if (!isFormValid) {
            toggleSaveSuccessValue('error');
        }

        return isFormValid;
    }

    async function saveDetails(e) {
        console.log(Subscription)
        // upload Subscription image to bucket
        setSubmitFormMessage('');
        try {
            if (validateFormData()) {
                toggleLoadingClass('loading');
                saveSubscription(Subscription).subscribe((response) => {
                    toggleLoadingClass('');
                    toggleSaveSuccessValue('success');
                    setSubmitFormMessage('Subscription saved successfully!');
                    setSubscription(initialSubscriptionData);
                })
            }
        } catch(e) {
            toggleLoadingClass('');
            toggleSaveSuccessValue('error');
            setSubmitFormMessage('Something went wrong, please try in sometime!');
            console.log('Error: ', e);
        }
    }

    async function getSubscriptionList() {
        try {
            getSubscriptionsList(Subscription).subscribe((response) => {
                togglePageLoader(false);
                setSubscriptionList(response);
            });
        } catch(e) {
            togglePageLoader(false);
            console.log('Erro: ', e);
        }
    }

    function setMaxDateSelectionYear() {
        const d = new Date();
        const year = d.getFullYear();
        const month = d.getMonth();
        const day = d.getDate();
        return (new Date(year + 1, month, day));
    }

    function onItemActionSelected(event, value) {
        if (event && event === 'deactivate') {
            togglePageLoader(true);
            try {
                toggleActivateDeactivateSubscription(value, false).subscribe((response) => {
                    togglePageLoader(false);
                });
            }catch (e) {
                togglePageLoader(false);
                console.log('Error: ', e);
            }
        }

        if (event && event === 'activate') {
            togglePageLoader(true);
            try {
                toggleActivateDeactivateSubscription(value, true).subscribe((response) => {
                    togglePageLoader(false);
                });
            }catch (e) {
                togglePageLoader(false);
                console.log('Error: ', e);
            }
        }

        if (event && event === 'remove') {
            toggleSubscriptionModal(true);
            subscriptionActionMessage('Are you sure, you want to delete this Subscription?');
            setSubscriptionActionData(value);
        }
    }

    function subscriptionDeleteConfirmation(action, data) {
        if (action) {
            togglePageLoader(true);
            toggleSubscriptionModal(false);
            try {
                deleteSubscriptionByKey(data).subscribe((response) => {
                    togglePageLoader(false);
                });
            } catch(e) {
                console.log('error: ', e);
            }
        } else {
            toggleSubscriptionModal(false);
        }
    }

    return (
        <div className="adminPanelSection">
            {
                isPageLoaderActive ?
                <Loader /> : ''
            }
            {
                isSubscriptionDeleteClicked ?
                <ConfirmationModal 
                    screen="subscription"
                    message={deleteSubscritionMessage}
                    subscriptionData={subscriptionDataToModify}
                    confirmationResponse={subscriptionDeleteConfirmation}
                /> : ''
            }
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
                <Link to="/adminpanel/users" title="manage users" className="panelLink">
                    <span className="iconsWrap subscribeIconWrap">
                        <img src={usersIcon} alt="users" />
                    </span>
                    <span className="title">
                        Users
                    </span>
                </Link>
            </nav>
            <div className="logoWrap">
                <img src={boogaluLogo} alt="Boogalu" />
            </div>
            {
                isAdminLoggedIn || checkAdminLogIn ?
                <div className="optionsTab">
                    <a onClick={(e) => switchTabs(e, 'create')} className="active" ref={createTabRef}>Create new</a>
                    <a onClick={(e) => switchTabs(e, 'list')} ref={listTabRef}>View list</a>
                </div>: ''
            }
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
                            {
                                isCreateFormTab ?
                                'Create a new Subscription'
                                : 
                                'List of Subscriptions'
                            }
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
                    isCreateFormTab ?
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
                                required
                                id="outlined-required-amount"
                                label="Amount"
                                type="number"
                                InputProps={{ inputProps: { min: 199 } }}
                                onChange={handleChange('amount')}
                                value={Subscription.amount}
                                variant="outlined"
                            />
                        </div>
                        <div className="input-wrap feature-group-wrap">
                            <InputLabel required id="select-outlined-label">Include features</InputLabel>
                            <FormControl className="checkBoxControlGroup">
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            name="features"
                                            color="primary"
                                            className="selected-item-checkbox"
                                            checked={Subscription.isLessonAccess}
                                            onChange={handleChange('isLessonAccess')}
                                            inputProps={{ 'aria-label': 'secondary checkbox' }}
                                        />
                                    }
                                    label="Lessons"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            name="features"
                                            color="primary"
                                            checked={Subscription.isCompetitionAccess}
                                            className="selected-item-checkbox"
                                            onChange={handleChange('isCompetitionAccess')}
                                            inputProps={{ 'aria-label': 'secondary checkbox' }}
                                        />
                                    }
                                    label="Competitions"
                                />
                            </FormControl>
                        </div>
                        <div className="input-wrap">
                            <TextField className="input-field"
                                id="outlined-required-desc"
                                label="Extra features to provide"
                                onChange={handleChange('desc')}
                                value={Subscription.desc}
                                variant="outlined"
                            />
                        </div>
                        <div className="input-wrap">
                            <FormControl variant="outlined" className="input-field">
                                <InputLabel id="select-outlined-label-plantype" required>Plan type</InputLabel>
                                <Select
                                    required
                                    labelId="select-outlined-label-plantype"
                                    id="select-outlined-plantype"
                                    value={Subscription.planType}
                                    onChange={handleChange('planType')}
                                    label="Plan Type"
                                >
                                    <MenuItem value="startup">Start-up</MenuItem>
                                    <MenuItem value="pro">Pro</MenuItem>
                                    <MenuItem value="premium">Premium</MenuItem>
                                </Select>
                            </FormControl>
                        </div>
                        <div className="input-wrap">
                            <FormControl variant="outlined" className="input-field">
                                <InputLabel id="select-outlined-label">Plan Tenure</InputLabel>
                                <Select
                                    labelId="select-outlined-label"
                                    id="select-outlined"
                                    value={Subscription.plans}
                                    onChange={handleChange('plans')}
                                    label="Plan Tenure"
                                >
                                    <MenuItem value="monthly">Monthly</MenuItem>
                                    <MenuItem value="annual">Annual</MenuItem>
                                </Select>
                            </FormControl>
                        </div>
                        <div className="input-wrap data-time-wrap">
                            <MuiPickersUtilsProvider
                                utils={DateFnsUtils}
                            >
                                <KeyboardDatePicker
                                    margin="normal"
                                    minDate={new Date()}
                                    maxDate={setMaxDateSelectionYear()}
                                    id="date-picker-start"
                                    label="Select subscription start date"
                                    format="MM/dd/yyyy"
                                    value={Subscription.startAt}
                                    onChange={(e) => setStartDate(e)}
                                    KeyboardButtonProps={{
                                        'aria-label': 'change date',
                                    }}
                                />
                            </MuiPickersUtilsProvider>
                        </div>
                        <div className="input-wrap data-time-wrap">
                            <MuiPickersUtilsProvider
                                utils={DateFnsUtils}
                            >
                                <KeyboardDatePicker
                                    margin="normal"
                                    id="date-picker-end"
                                    minDate={new Date()}
                                    maxDate={setMaxDateSelectionYear()}
                                    label="Select subscription expiry date"
                                    format="MM/dd/yyyy"
                                    value={Subscription.endAt}
                                    onChange={(e) => setEndDate(e)}
                                    KeyboardButtonProps={{
                                        'aria-label': 'change date',
                                    }}
                                />
                            </MuiPickersUtilsProvider>
                        </div>
                        <div className="input-wrap action-wrap">
                            <p className={`messageWrap ${isSavedSuccessValue}`}>{submitFormMessages}</p>
                            <Button variant="contained" color="primary">Cancel</Button>
                            <Button variant="contained" color="secondary" className={isSubscriptionLoading} onClick={(e) => saveDetails(e)}>Save</Button>
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
                    </div> 
                    :
                    <div className="adminItemlistView subscriptionAdminList">
                    {
                        subscriptionsList && subscriptionsList.length ?
                            subscriptionsList.map( item => {
                                return (<div key={`subscription-${item.key}`} className="boxItem compBox">
                                    <p className="title">{item.name}</p>
                                    <p className="amount">Amount: &#8377;&nbsp;{item.amount}</p>
                                    <ActionToolTip 
                                        id={item.key}
                                        name={item.name}
                                        isActive={item.active}
                                        onActionClicked={(e) => onItemActionSelected(e, {id: item.key, name: item.name})}
                                    />
                                    <p className="statusBlock">Status: <span>{item.active ? 'Active' : 'Inactive'}</span></p>
                                    <p className="date">Starting Date: <span>{item.startingDate}</span></p>
                                </div>)
                            })
                            : <p className="noDataInListMessage">You haven't created any Subscription!</p>
                        }
                    </div>
                    :
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
