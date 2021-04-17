import React, { useState, useEffect, useRef } from 'react';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Checkbox from '@material-ui/core/Checkbox';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import ImageUploader from 'react-images-upload';
import Button from '@material-ui/core/Button';
import boogaluLogo from '../../Images/Boogalu-logo.svg';
import logOutIcon from '../../Images/logout-icon.png';
import { saveCompetition } from "../../Services/Competition.service";
import { uploadImage } from "../../Services/Upload.service";
import { Link } from 'react-router-dom';
import { ADMIN_USER, ADMIN_PWD } from '../../Constants';
import championIcon from '../../Images/champion-box-icon.png';
import lessonsIcon from '../../Images/lessons-icon.png';
import subscribeIcon from '../../Images/subscribe-icon.png';
import usersIcon from '../../Images/users-icon.png';
import { useStoreConsumer } from '../../Providers/StateProvider';
import { getCompetitionsList } from "../../Services/Competition.service";
import { enableLoading, disableLoading } from "../../Actions/Loader";

const checkAdminLogIn = JSON.parse(localStorage.getItem('adminLoggedIn'));

export default function Competition() {
    const initialCompetitionData = {
        name: "",
        type: "",
        desc: "",
        active: true,
        fee: "",
        img: "",
        startAt: "",
        endAt: "",
        prices: [],
    }

    const { state, dispatch } = useStoreConsumer();
    const [isAdminLoggedIn, toggleAdminLogin] = useState(false);
    const [CompetitionData, setCompetitionData] = useState(initialCompetitionData);
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPwd, setAdminPwd] = useState('');
    const [loggedInMessages, setLoginMessage] = useState('');
    const [isCreateFormTab, toggleCreateList] = useState(true);
    const [CompletitionList, setCompletitionList] = useState(null);
    const [isActionClick, toggleCompActions] = useState(false);

    const createTabRef = useRef(null);
    const listTabRef = useRef(null);

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
                if (!(CompletitionList && CompletitionList.length)) {
                    getCompetitionsListdata();
                }
            }
            toggleCreateList(false);
        }
    }

    function toggleMenuAction(event) {
        event.stopPropagation();
        if (event && event.currentTarget.classList.contains('actionBtn')) {
            toggleCompActions(!isActionClick);
        } else {
            toggleCompActions(false);
        }
    }

    const getCompetitionsListdata = () =>  {
        try {
            dispatch(enableLoading());
            getCompetitionsList().subscribe(allCompList => {
                dispatch(disableLoading());
                if (allCompList.length) {
                    console.log('Competitions: ', allCompList);
                    setCompletitionList(allCompList);
                    
                }
            });
        } catch(e) {
            console.log('Error: ', e);
        }
    }

    const handleChange = (prop, index) => (event) => {
        let value = event.target.value;
        if (prop === 'active') value = event.target.checked;
        if (prop === 'prices') {
            CompetitionData.prices[index] = event.target.value;
            value = CompetitionData.prices;
        }
        setCompetitionData({ ...CompetitionData, [prop]: value });
    };

    const onimageUpload = (picture) => {
        setCompetitionData({ ...CompetitionData, img: picture });
    }

    async function saveDetails(e) {
        console.log(CompetitionData)
        // upload competition image to bucket
        if (CompetitionData.img[0]) {
            const reader = new FileReader();
            reader.readAsDataURL(CompetitionData.img[0]);
            reader.onload = () => {
                uploadImage(reader.result, 'competition', 'small').subscribe((downloadableUrl) => {
                    CompetitionData.img = downloadableUrl;
                    // save competition data to db with imag url
                    saveCompetition(CompetitionData).subscribe((response) => {
                        console.log('competition success', response);
                        setCompetitionData(initialCompetitionData);
                    })
                })
            }
        }
    }

    return (
        <div className="adminPanelSection" onClick={(e) => toggleMenuAction(e)}>
            <nav className="adminNavigation">
                <Link to="/adminpanel/competition" title="create championship" className="panelLink active">
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
                <Link to="/adminpanel/subscription" title="create subscription" className="panelLink">
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
                <a href="/" title="boogalu home">
                    <img src={boogaluLogo} alt="Boogalu" />
                </a>
            </div>
            {
                isAdminLoggedIn || checkAdminLogIn ?
                <div className="optionsTab">
                    <a onClick={(e) => switchTabs(e, 'create')} className="active" ref={createTabRef}>Create new</a>
                    <a onClick={(e) => switchTabs(e, 'list')} ref={listTabRef}>View list</a>
                </div>: ''
            }
            <div className={`competition-bo-wrap clearfix ${(isAdminLoggedIn || checkAdminLogIn) && 'loggedInAdmin'}`}>
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
                                'Launch a new competition'
                                : 
                                'List of competitions'
                            }
                        </h1>
                    : 
                        <h1>
                            <Link to="/adminpanel" title="back to admin" className="backToAdmin">
                                <span>
                                    &#8592;
                                </span>
                            </Link>
                            Login to create new Competition
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
                                    value={CompetitionData.name}
                                    variant="outlined"
                                />
                            </div>
                            <div className="input-wrap">
                                <TextField className="input-field"
                                    id="outlined-required-desc"
                                    label="Description"
                                    onChange={handleChange('desc')}
                                    value={CompetitionData.desc}
                                    variant="outlined"
                                />
                            </div>
                            <div className="input-wrap">
                                <TextField className="input-field"
                                    id="outlined-required-fee"
                                    label="Fee"
                                    type="number"
                                    onChange={handleChange('fee')}
                                    value={CompetitionData.fee}
                                    variant="outlined"
                                />
                            </div>
                            <div className="input-wrap">
                                <FormControl variant="outlined" className="input-field">
                                    <InputLabel id="select-outlined-label">Type</InputLabel>
                                    <Select
                                        labelId="select-outlined-label"
                                        id="select-outlined"
                                        value={CompetitionData.type}
                                        onChange={handleChange('type')}
                                        label="Type"
                                    >
                                        <MenuItem value="running">Currently Running</MenuItem>
                                        <MenuItem value="upcomming">Up-Comming</MenuItem>
                                    </Select>
                                </FormControl>
                            </div>
                            <div className="input-wrap data-time-wrap">
                                <TextField
                                    id="datetime-local-start"
                                    label="Start Date & Time"
                                    type="datetime-local"
                                    value={CompetitionData.startAt}
                                    onChange={handleChange('startAt')}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                                <TextField
                                    id="datetime-local-end"
                                    label="End Date & Time"
                                    type="datetime-local"
                                    value={CompetitionData.endAt}
                                    onChange={handleChange('endAt')}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </div>
                            <div className="input-wrap">
                                <TextField className="input-field"
                                    required
                                    id="outlined-required-name"
                                    label="First Price"
                                    onChange={handleChange('prices', 0)}
                                    value={CompetitionData.prices[0]}
                                    variant="outlined"
                                />
                            </div>
                            <div className="input-wrap">
                                <TextField className="input-field"
                                    required
                                    id="outlined-required-name"
                                    label="Second Price"
                                    onChange={handleChange('prices', 1)}
                                    value={CompetitionData.prices[1]}
                                    variant="outlined"
                                />
                            </div>
                            <div className="input-wrap">
                                <TextField className="input-field"
                                    required
                                    id="outlined-required-name"
                                    label="Third Price"
                                    onChange={handleChange('prices', 2)}
                                    value={CompetitionData.prices[2]}
                                    variant="outlined"
                                />
                            </div>
                            <div className="input-wrap">
                                <ImageUploader
                                    withIcon={true}
                                    buttonText='Upload image'
                                    onChange={onimageUpload}
                                    imgExtension={['.jpg', '.gif', '.png', '.gif', '.svg']}
                                    maxFileSize={5242880}
                                    accept="image/*"
                                    withPreview={true}
                                    singleImage={true}
                                    label="Select competition image"
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
                                            checked={CompetitionData.active}
                                            onChange={handleChange('active')}
                                            inputProps={{ 'aria-label': 'secondary checkbox' }}
                                        />
                                    }
                                    label="Active Competition"
                                />
                            </div>
                        </div>
                        : <div className="adminItemlistView">
                            {
                                CompletitionList && CompletitionList.length ?
                                CompletitionList.map( item => {
                                    return (<div className="boxItem compBox">
                                        <p className="title">{item.name}</p>
                                        <div className="compImageWrap">
                                            <img src={item.img} alt="comp image" />
                                        </div>
                                        <p className="actionLink">
                                            <button className="actionBtn" onClick={(e) => toggleMenuAction(e)}>
                                                <span></span>
                                            </button>
                                            {
                                                isActionClick ?
                                                <div className="menu">
                                                    <a>Inactive</a>
                                                    <a>Delete</a>
                                                </div> : ''
                                            }
                                        </p>
                                        <p className="statusBlock">Status: <span>{item.active ? 'Active' : 'Inactive'}</span></p>
                                        <p className="date">Starting Date: <span>{item.startingDate}</span></p>
                                    </div>)
                                })
                                : ''
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
