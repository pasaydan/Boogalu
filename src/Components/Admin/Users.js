import React, { useState, useEffect, useRef } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import boogaluLogo from '../../Images/Boogaluu-logo.png';
import { FaFilter, FaPowerOff, FaSearch, FaTimes } from "react-icons/fa";
import { Link } from 'react-router-dom';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { ADMIN_USER, ADMIN_PWD, NOTIFICATION_ERROR } from '../../Constants';
import championIcon from '../../Images/champion-box-icon.png';
import lessonsIcon from '../../Images/lessons-icon.png';
import subscribeIcon from '../../Images/subscribe-icon.png';
import usersIcon from '../../Images/users-icon.png';
import { useStoreConsumer } from '../../Providers/StateProvider';
import { getActiveSubscriptionsList } from "../../Services/Subscription.service";
import { getAllUser, getUserById, getUsersByFilter, getUserByPhone, getUserByEmail, updateUser } from "../../Services/User.service";
import { enableLoading, disableLoading } from "../../Actions/Loader";
import { displayNotification } from "../../Actions/Notification";
import { MdDeleteForever, MdSearch, MdRefresh } from 'react-icons/md';
import { FiGift, FiEye, FiUserX } from "react-icons/fi";
import { getUploadedVideosByUserId, deleteUploadedVideoByVideoKey } from "../../Services/UploadedVideo.service";
import ConfirmationModal from '../ConfirmationModal';
import GenericInfoModal from '../genericInfoModal';
import { deleteImage, deleteVideo } from "../../Services/Upload.service";
import { sendEmail } from "../../Services/Email.service";
import { validateEmailId, validatePhoneNumber } from '../../helpers';
import Loader from '../Loader';

const checkAdminLogIn = JSON.parse(localStorage.getItem('adminLoggedIn'));
const eventsList = require('../../Data/events.json');

export default function UsersInfo() {
    const { dispatch } = useStoreConsumer();
    const [isAdminLoggedIn, toggleAdminLogin] = useState(false);
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPwd, setAdminPwd] = useState('');
    const [loggedInMessages, setLoginMessage] = useState('');
    const [userListData, setUsersList] = useState(null);
    const [isUserDataLoading, toggleUserDataLoading] = useState(false);
    const [userVideoDataList, setUsersVideoList] = useState(null);
    const [loadingText, setLoadingText] = useState('');
    const [isFetchUserModalActive, toggleUserFetchModalVisiblity] = useState(false);
    const [isDeleteVideoClicked, toggleDeletVideModal] = useState(false);
    const [deleteVideoMessage, setDeleteVideoMessage] = useState('');
    const [userIdKey, setUserKey] = useState('');
    const [videoIdKey, setVideoKey] = useState('');
    const [videoURL, setVideoURL] = useState('');
    const [videoName, setVideoName] = useState('');
    const [thumbnailURL, setThumbnailURL] = useState('');
    const [confirmationAction, setConfirmationAction] = useState('');
    const [userDetails, setUserDetails] = useState('');
    const [isUserFilterOpen, toggleUserFilterModal] = useState(false);
    const [userFilterValue, setUserFilter] = useState(null);
    const [filterType, setFilterType] = useState(null);
    const [isUserSearchOpen, toggleUserSearchOpen] = useState(false);
    const [userSearchErrorMessage, setUserSearchError] = useState('');
    const [searchedUserData, toggleSearchedUserData] = useState('');
    const [isOfferModalOpen, toggleOfferModalBox] = useState(false);
    const [infoModalTitle, setInfoModalTitle] = useState('');
    const [infoModalMessage, setInfoModalMessage] = useState('');
    const [infoModalStatus, setInfoModalStatus] = useState('');
    const [userForOffer, setUserForOffer] = useState(null);
    const [subscriptionsList, setSubscriptionList] = useState([]);
    const [shoulGenericModalHasAction, toggleGenericModalAction] = useState(false);
    const [isPageLoaderActive, togglePageLoader] = useState(false);

    const userSearchInputRef = useRef(null);

    useEffect(() => {
        if (checkAdminLogIn) {
            toggleAdminLogin(checkAdminLogIn);
            getUsersList();
            try {
                dispatch(enableLoading());
                getActiveSubscriptionsList().subscribe( subscriptionsList => {
                    dispatch(disableLoading());
                    setSubscriptionList(subscriptionsList)
                });
            } catch (e) {
                dispatch(disableLoading());
                console.log('Fetching subscription error: ', e);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            getUsersList();
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

    const getUsersList = () => {
        if (searchedUserData) {
            toggleSearchedUserData('');
        }
        try {
            dispatch(enableLoading());
            getAllUser('admin').subscribe(users => {
                dispatch(disableLoading());
                if (users.length) {
                    setUsersList(users);
                }
            });
        } catch (e) {
            dispatch(disableLoading());
            console.log('Error: ', e);
        }
    }

    function fetchUsersVideoDetails(event, userKey) {
        if (event) event.stopPropagation();
        setLoadingText('Fetching videos...');
        toggleUserFetchModalVisiblity(true);
        toggleUserDataLoading(true);
        getUploadedVideosByUserId(userKey).subscribe((list) => {
            console.log('User Video List: ', list);
            setUsersVideoList(list);
            toggleUserDataLoading(false);
        });
    }

    function closeUserModal(event) {
        event.stopPropagation();
        toggleUserFetchModalVisiblity(false);
    }

    function deleteUserVideo(event, videoId, userId, videoURL, thumbnailURL, videoTitle) {
        event.stopPropagation();
        toggleDeletVideModal(true);
        setConfirmationAction('videoDelete');
        setDeleteVideoMessage('Are you sure you want to delete this video?');
        setUserKey(userId);
        setVideoKey(videoId);
        setVideoURL(videoURL);
        setThumbnailURL(thumbnailURL);
        setVideoName(videoTitle);
        // get user details
        getUserById(userId).subscribe(response => {
            if (response && response.key === userId) {
                setUserDetails(response);
            }
        });
    } 
    
    // function editUser(event, userKey) {
    //     event.stopPropagation();
    // }
    
    function deactivateUser(event, userKey) {
        event.stopPropagation();
        toggleDeletVideModal(true);
        setConfirmationAction('userDeactivate');
        setDeleteVideoMessage('Are you sure you want to de-activate this user?');
        setUserKey(userKey);
    }

    function videoDeleteConfirmationResponse(action, confirmed, userKey, videoKey, adminComment, videoURL, thumbnailURL) {
        if (action === 'videoDelete' && confirmed) {
            dispatch(enableLoading());
            // Delete Video Thumbnail
            deleteImage(thumbnailURL).subscribe(response => {
                console.log("response", response);
                if (response && (response.deleted || response.success)) {
                    // Delete Video
                    deleteVideo(videoURL).subscribe(response => {
                        console.log("response", response);
                        if (response && response.deleted) {
                            // Delete Video record from `uploadedVideos` collection
                            deleteUploadedVideoByVideoKey(videoKey).subscribe(response => {
                                console.log("response", response);
                                if (response && response.deleted) {
                                    sendEmailToUser(adminComment, userKey);
                                }
                            });
                        }
                    })
                }
            });
            console.log('Video delete call will go here');
        } else if (action === 'userDeactivate' && confirmed) {
            console.log('User deactivate call will go here');
        }

        toggleDeletVideModal(false);
    }

    const sendEmailToUser = (adminComment, userKey) => {
        const { email, name } = userDetails;
        let emailBody = `<div>
        <p>Hi ${name}, ${adminComment}</p>. 
        </div>`;
        let payload = {
            mailTo: email,
            title: 'Video Deleted by Admin',
            content: emailBody
        }
        sendEmail(payload).subscribe((res) => {
            if (!('error' in res)) {
                console.log('User Email Send Successfully.');
                dispatch(disableLoading());
            } else {
                dispatch(disableLoading());
                console.log('User Email Send Failed.');
            }
            fetchUsersVideoDetails(null, userKey);
        })
    }

    function toggleOtherFilters(event, action) {
        event.stopPropagation();
        toggleUserFilterModal(action);
    }

    function resetAppliedFilters(event, action) {
        event.stopPropagation();
        toggleUserFilterModal(action);
        setFilterType(null);
        setUserFilter(null);
        getUsersList();
    }

    function handleUsersFilter(event, filterType) {
        event.stopPropagation();
        const filterValue = event.target.value || null;
        setFilterType(filterType);
        setUserFilter(filterValue);
    }

    function applyUserFilter(event, action) {
        event.stopPropagation();
        toggleUserFilterModal(action);
        if (userFilterValue && filterType) {
            dispatch(enableLoading());
            try {
                getUsersByFilter(userFilterValue, filterType).subscribe( users => {
                    dispatch(disableLoading());
                    setUsersList(users);
                });
            } catch(e) {
                dispatch(disableLoading());
                console.log('User filter error: ', e);
            }
        }
    }

    function toggleSearchInput(event, action) {
        event.stopPropagation();
        toggleUserSearchOpen(!action);
        if (!action && userSearchInputRef.current) {
            userSearchInputRef.current.focus();
        } else {
            setUserSearchError('');
            userSearchInputRef.current.value = '';
            if (searchedUserData) {
                getUsersList();
            }
        }
    }
    
    function inputSearchClick(event) {
        event.stopPropagation();
    }
    
    function searchUser(event) {
        event.stopPropagation();
        const userInputData = userSearchInputRef.current ? userSearchInputRef.current.value : '';
        if (userInputData) {
            if (validateEmailId(userInputData)) {
                setUserSearchError('');
                dispatch(enableLoading());
                try {
                    getUserByEmail(userInputData).subscribe( users => {
                        dispatch(disableLoading());
                        toggleSearchedUserData(userInputData);
                        setUsersList(users);
                    });
                } catch(e) {
                    dispatch(disableLoading());
                    console.log('User email searh error: ', e);
                }
            } else if(validatePhoneNumber(userInputData)) {
                setUserSearchError('');
                dispatch(enableLoading());
                try {
                    getUserByPhone(userInputData).subscribe( users => {
                        dispatch(disableLoading());
                        toggleSearchedUserData(userInputData);
                        setUsersList(users);
                    });
                } catch(e) {
                    dispatch(disableLoading());
                    console.log('User phone searh error: ', e);
                }
            } else {
                setUserSearchError('Enter valid email id or phone number!');
            }
        }
    }
    
    function resetUserSearch(event) {
        event.stopPropagation();
        setUserSearchError('');
        if (userSearchInputRef.current) {
            userSearchInputRef.current.value = '';
            userSearchInputRef.current.focus();
        }
        if (searchedUserData) {
            getUsersList();
        }
    }

    function openOfferModalBox(event, user) {
        event.stopPropagation();
        let isUserOfferAvailed = false;
        if (user?.isSubscriptionOffer) {
            isUserOfferAvailed = true;
        } else if (user && user?.events && user?.events.length) {
            user?.events.forEach( item => {
                if (item?.offer) {
                    isUserOfferAvailed = true;            
                }
            });
        }

        if (isUserOfferAvailed) {
            setInfoModalTitle('Offer already availed!');
            setInfoModalMessage(`${user?.email} already availed this offer as a part of event registration!`);
            setInfoModalStatus('info');
            toggleGenericModalAction(false);
            toggleOfferModalBox(true);
        } else {
            setUserForOffer(user);
            setInfoModalTitle('2 months free Boogaluu subscription');
            setInfoModalMessage(`Are you sure you want to give this offer to ${user?.email}`);
            setInfoModalStatus('info');
            toggleGenericModalAction(true);
            toggleOfferModalBox(true);
        }
    }

    function shouldCloseOfferModal() {
        setUserForOffer(null);
        setInfoModalTitle('');
        setInfoModalMessage('');
        setInfoModalStatus('');
        toggleOfferModalBox(false);
    }

    function confirmedOfferYes(action) {
        if (action) {
            let offerSub = subscriptionsList.filter(subData => subData.planType === 'startup');
            const updatedUserData = {
                ...userForOffer,
                subscribed: true,
                isSubscriptionOffer: true,
                subEndingReminderSend: false,
                subEndedReminderSend: false,
                planType: offerSub[0]?.planType || 'startup'
            };
            if (updatedUserData && updatedUserData?.subscribed && updatedUserData?.planType === (offerSub[0]?.planType || 'startup') && updatedUserData?.subscriptions && updatedUserData?.subscriptions?.length) {
                updatedUserData?.subscriptions && updatedUserData?.subscriptions.length && updatedUserData?.subscriptions.forEach( subData => {
                    if (subData?.planType === offerSub[0]?.planType && !subData.isExpired) {
                        subData.validity += 2; 
                    }
                });
            } else {
                let userSub = {
                    id: offerSub[0]?.key,
                    name: offerSub[0]?.name,
                    planType: offerSub[0]?.planType || 'startup',
                    validity: 2,
                    subscribedOn: new Date(),
                    isExpired: false,
                    isRenewed: false
                }
                if ('subscriptions' in updatedUserData) {
                    updatedUserData.subscriptions.forEach((data, index) => {
                        data.isExpired = true; //mark expired to all previous subscriptions
                        if (index === updatedUserData.subscriptions.length - 1) updatedUserData.subscriptions.push(userSub);
                    });
                } else updatedUserData.subscriptions = [userSub];
            }
            try {
                togglePageLoader(true);
                updateUser(updatedUserData.key, updatedUserData).subscribe((response) => {
                    togglePageLoader(false);
                    if (response?.updated) {
                        setInfoModalTitle('Congratulations!');
                        setInfoModalMessage(`2 months free subscription offer applied to ${updatedUserData.email}`);
                        setInfoModalStatus('success');
                        toggleGenericModalAction(false);
                        toggleOfferModalBox(true);
                    } else {
                        setInfoModalTitle('ERROR...!');
                        setInfoModalMessage(`Something went wrong, please try again!`);
                        setInfoModalStatus('error');
                        toggleGenericModalAction(false);
                        toggleOfferModalBox(true);
                    }
                });
            } catch (e) {
                togglePageLoader(false);
                dispatch(displayNotification({
                    msg: `Something went wrong, please try in sometime!`,
                    type: NOTIFICATION_ERROR,
                    time: 5000
                }));
                console.log('Error: ', e);
            }
        }
    }

    return (
        <div className="adminPanelSection">
            {
                isPageLoaderActive ?
                <Loader /> : ''
            }
            {
                isDeleteVideoClicked ?
                <ConfirmationModal 
                    screen="users"
                    action={confirmationAction}
                    message={deleteVideoMessage}
                    userId={userIdKey}
                    videoId={videoIdKey}
                    videoURL={videoURL}
                    thumbnailURL={thumbnailURL}
                    videoName={videoName}
                    confirmationResponse={videoDeleteConfirmationResponse}
                /> : ''
            }
            {
                isFetchUserModalActive ?
                <div className="fetchUserDetailModal">
                    <div className="fetchUserDetailsInner">
                        <p className="closeUserModal" title="close modal" onClick={(e) => closeUserModal(e)}></p>
                        {
                            isUserDataLoading ?
                            <div className="spinnerLoader">
                                <div className="loader"></div>
                                <span>{loadingText}</span>
                            </div>
                            : userVideoDataList && userVideoDataList.length ?
                            <div className="usersVideoListWrap">
                                {
                                    userVideoDataList.map((item, index) => {
                                        return (
                                            <div className="videoDetails" key={`userVideo-id-${index}`}>
                                                <video 
                                                    controls 
                                                    muted
                                                >
                                                    <source src={item.url} type="video/mp4" />
                                                </video>
                                                <p className="title">
                                                    {item.title}
                                                </p>
                                                <p className="subText">
                                                    {item.uploadedTime}
                                                </p>
                                                <p className="deleteVideoIcon" title="delete this video" onClick={(e) => deleteUserVideo(e, item.key, item.userId, item.url, item.thumbnail, item.title)}>
                                                    <MdDeleteForever />
                                                </p>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                            : <p className="noVideoMessage">There is no videos uploaded by this user!</p>
                        }
                    </div>
                </div> : ''
            }
            {isOfferModalOpen ? <GenericInfoModal
                title={infoModalTitle}
                message={infoModalMessage}
                status={infoModalStatus}
                shouldHaveAction={shoulGenericModalHasAction}
                closeInfoModal={shouldCloseOfferModal}
                confirmUserAction={confirmedOfferYes}
            /> : ''}
            <nav className="adminNavigation">
                <Link to="/adminpanel/competition" title="create competitions" className="panelLink">
                    <span className="iconsWrap championIconWrap">
                        <img src={championIcon} alt="championship" />
                    </span>
                    <span className="title champion">
                        Competitions
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
                <Link to="/adminpanel/users" title="manage users" className="panelLink active">
                    <span className="iconsWrap subscribeIconWrap">
                        <img src={usersIcon} alt="users" />
                    </span>
                    <span className="title">
                        Users
                    </span>
                </Link>
            </nav>
            <div className="logoWrap">
                <a href="/" title="boogaluu home">
                    <img src={boogaluLogo} alt="Boogaluu" />
                </a>
            </div>
            <div className={`competition-bo-wrap clearfix ${(isAdminLoggedIn || checkAdminLogIn) && 'loggedInAdmin usersListBox'}`}>
                {
                    isAdminLoggedIn || checkAdminLogIn ?
                    <div className="logOutIconWrap filterIconWrap searchIconWrap" title="search user by email/phone" onClick={(e) => toggleSearchInput(e, isUserSearchOpen)}>
                        <p className={`searchInputWrap ${isUserSearchOpen ? 'open' : ''}`}>
                            <input 
                                ref={userSearchInputRef}
                                type="text" 
                                id="userSearchInput" 
                                placeholder="Search by Email/Phone" 
                                aria-placeholder="Email or phone"
                                onClick={(e) => inputSearchClick(e)}
                            />
                            <button 
                                title="search user" 
                                className="search"
                                onClick={(e) => searchUser(e)}
                            >
                                <MdSearch />
                            </button>
                            <button 
                                title="reset search" 
                                className="reset"
                                onClick={(e) => resetUserSearch(e)}
                            >
                                <MdRefresh />
                            </button>
                        </p>
                        {
                            userSearchErrorMessage && isUserSearchOpen ?
                            <span className="userSearchError">{userSearchErrorMessage}</span>
                            : ''
                        }
                        {
                            isUserSearchOpen ?
                            <FaTimes /> :
                            <FaSearch />
                        }
                    </div> : ''
                }
                {
                    isAdminLoggedIn || checkAdminLogIn ?
                    <p className="logOutIconWrap filterIconWrap" title="Open Filter" onClick={(e) => toggleOtherFilters(e, true)}>
                        <FaFilter />
                    </p> : ''
                }
                {
                    isAdminLoggedIn || checkAdminLogIn ?
                        <p className="logOutIconWrap" title="logout" onClick={(e) => tiggerAdminLogout(e, false)}>
                            <FaPowerOff />
                        </p> : ''
                }
                {
                    isAdminLoggedIn || checkAdminLogIn ?
                        <h1>
                            <Link to="/adminpanel" title="back to admin" className="backToAdmin">
                                <span>
                                    &#8592;
                                </span>
                            </Link>
                            List of Boogaluu Users
                        </h1>
                        :
                        <h1>
                            <Link to="/adminpanel" title="back to admin" className="backToAdmin">
                                <span>
                                    &#8592;
                                </span>
                            </Link>
                            Login to Manage Boogaluu Users
                        </h1>
                }
                {
                    isAdminLoggedIn || checkAdminLogIn ?
                        <div className="usersListWrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Sr. no.</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Subscription</th>
                                        <th>State</th>
                                        <th>Country</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                {
                                    userListData && userListData.length ?
                                    <tbody className="dataTbody">
                                        {
                                            // eslint-disable-next-line array-callback-return
                                            userListData.map((item, index) => {
                                                if (item?.role !== 'admin') {
                                                    return (
                                                        <tr key={`user-item-${index}`}>
                                                            <td>{index + 1}</td>
                                                            <td>{item.name}</td>
                                                            <td>{item.email || 'N/A'}</td>
                                                            <td>{item.phone || 'N/A'}</td>
                                                            <td>{item.planType || 'N/A'}</td>
                                                            <td>{item.state || 'N/A'}</td>
                                                            <td>{item.country || 'N/A'}</td>
                                                            <td>
                                                                <div className="actionBlock">
                                                                    <p className="viewUserIcon" title="View users videos" onClick={(e) => fetchUsersVideoDetails(e, item.key)}>
                                                                        <FiEye />
                                                                    </p>
                                                                    <p className="blockUserIcon" title="De-activate user" onClick={(e) => deactivateUser(e, item.key)}>
                                                                        <FiUserX />
                                                                    </p>
                                                                    <p className="provideGift" title="Give offer to user" onClick={(e) => openOfferModalBox(e, item)}>
                                                                        <FiGift />
                                                                    </p>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )
                                                }
                                            })
                                        }
                                    </tbody>
                                        : 
                                    filterType && filterType.length ?
                                    <tbody className="filterTbody">
                                        <tr>
                                            <td>
                                                <p>No user available with the selected filter, try applying different filters!</p>
                                            </td>
                                        </tr>
                                    </tbody>
                                        : 
                                    <tbody className="emptyTbody">
                                        <tr>
                                            <td>
                                                <p>It seems Boogaluu doesn't have any users at this moment!</p>
                                            </td>
                                        </tr>
                                    </tbody>
                                }
                            </table>
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
            {
                    isUserFilterOpen ?
                    <div className="otherFiltersWrap userFilterWrap">
                        <div className="innerBox">
                            <p className="close-modal-icon dark" onClick={(e) => toggleOtherFilters(e, false)} title="close filter"></p>
                            <h3>Filter by</h3>
                            <div className="filterInnerWrap">
                                {
                                    eventsList?.events && eventsList?.events.length ?
                                    <div className="filterItem">
                                        <p className="filterTitle">Events registration</p>
                                        <div className="optionsWrap">
                                            <RadioGroup 
                                                className="radioGroupControls"
                                                aria-label="aria label for events type" 
                                                name="filterType" 
                                                value={userFilterValue}
                                                onChange={(e) => handleUsersFilter(e, 'event')}>
                                                    {
                                                        eventsList?.events.map( event => {
                                                            return (
                                                                <FormControlLabel
                                                                key={event?.id} 
                                                                value={event?.id} control={<Radio />} label={event?.name} />
                                                            )
                                                        })
                                                    }
                                            </RadioGroup>
                                        </div>
                                    </div> :''
                                }
                                <div className="filterItem">
                                    <p className="filterTitle">User Subscription</p>
                                    <div className="optionsWrap">
                                        <RadioGroup 
                                            className="radioGroupControls"
                                            aria-label="aria label for subscription type" 
                                            name="filterType" 
                                            value={userFilterValue}
                                            onChange={(e) => handleUsersFilter(e, 'planType')}>
                                                <FormControlLabel
                                                value='startup' control={<Radio />} label='Start-up' />
                                                <FormControlLabel
                                                value='pro' control={<Radio />} label='Pro' />
                                                <FormControlLabel
                                                value='premium' control={<Radio />} label='Premium' />
                                        </RadioGroup>
                                    </div>
                                </div> 
                            </div>
                            <div className="filterActionWrap">
                                <button className="btn primary-light" onClick={(e) => resetAppliedFilters(e, false)}>Reset &amp; cancel</button>
                                <button className="btn primary-dark" onClick={(e) => applyUserFilter(e, false)}>Apply</button>
                            </div>
                        </div>
                    </div>
                    : ''
                }
        </div>
    )
}
