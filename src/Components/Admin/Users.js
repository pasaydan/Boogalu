import React, { useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import boogaluLogo from '../../Images/Boogalu-logo.svg';
import logOutIcon from '../../Images/logout-icon.png';
import { Link } from 'react-router-dom';
import { ADMIN_USER, ADMIN_PWD } from '../../Constants';
import championIcon from '../../Images/champion-box-icon.png';
import lessonsIcon from '../../Images/lessons-icon.png';
import subscribeIcon from '../../Images/subscribe-icon.png';
import usersIcon from '../../Images/users-icon.png';
import { useStoreConsumer } from '../../Providers/StateProvider';
import { getAllUser } from "../../Services/User.service";
import { enableLoading, disableLoading } from "../../Actions/Loader";
import { MdRemoveRedEye, MdBlock, MdDeleteForever } from 'react-icons/md';
import { getUploadedVideosByUserId, deleteUploadedVideoByVideoKey } from "../../Services/UploadedVideo.service";
import ConfirmationModal from '../ConfirmationModal';
import { deleteImage, deleteVideo } from "../../Services/Upload.service";
import { sendEmail } from "../../Services/Email.service";
import { getUserById } from "../../Services/User.service";
const checkAdminLogIn = JSON.parse(localStorage.getItem('adminLoggedIn'));

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

    useEffect(() => {
        if (checkAdminLogIn) {
            toggleAdminLogin(checkAdminLogIn);
            getUsersList();
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

    return (
        <div className="adminPanelSection">
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
                <a href="/" title="boogalu home">
                    <img src={boogaluLogo} alt="Boogalu" />
                </a>
            </div>
            <div className={`competition-bo-wrap clearfix ${(isAdminLoggedIn || checkAdminLogIn) && 'loggedInAdmin usersListBox'}`}>
                {
                    isAdminLoggedIn || checkAdminLogIn ?
                        <p className="logOutIconWrap" title="logout" onClick={(e) => tiggerAdminLogout(e, false)}>
                            <img src={logOutIcon} alt="logout" />
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
                            List of Boogalu Users
                        </h1>
                        :
                        <h1>
                            <Link to="/adminpanel" title="back to admin" className="backToAdmin">
                                <span>
                                    &#8592;
                                </span>
                            </Link>
                            Login to Manage Boogalu Users
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
                                        <th>Gender</th>
                                        <th>State</th>
                                        <th>Country</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        userListData && userListData.length &&
                                        userListData.forEach((item, index) => {
                                            if (item.role !== 'admin') {
                                                return (
                                                    <tr key={`user-item-${index}`}>
                                                        <td>{index + 1}</td>
                                                        <td>{item.name}</td>
                                                        <td>{item.email || 'N/A'}</td>
                                                        <td>{item.phone || 'N/A'}</td>
                                                        <td>{item.gender || 'N/A'}</td>
                                                        <td>{item.state || 'N/A'}</td>
                                                        <td>{item.country || 'N/A'}</td>
                                                        <td>
                                                            <div className="actionBlock">
                                                                <p className="viewUserIcon" title="View users videos" onClick={(e) => fetchUsersVideoDetails(e, item.key)}>
                                                                    <MdRemoveRedEye />
                                                                </p>
                                                                <p className="blockUserIcon" title="De-activate user" onClick={(e) => deactivateUser(e, item.key)}>
                                                                    <MdBlock />
                                                                </p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            }
                                        })
                                    }
                                </tbody>
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
        </div>
    )
}
