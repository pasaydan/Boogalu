import React, { useState, useEffect, useRef } from 'react';
import { LinearProgress } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import { TextareaAutosize } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import { FaCloudUploadAlt } from 'react-icons/fa';
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
import { saveLesson, getLessonByName } from "../../Services/Lessons.service";
import { enableLoading, disableLoading } from "../../Actions/Loader";
import { NOTIFICATION_ERROR } from "../../Constants";
import { displayNotification } from "../../Actions/Notification";
import { uploadVideo, uploadImage } from "../../Services/Upload.service";
import VideoUploader from "../VideoUploader";
const checkAdminLogIn = JSON.parse(localStorage.getItem('adminLoggedIn'));

export default function UploadLessons() {
    const   uploaderRef = useRef(),
            uploaderRefFrontView = useRef(),
            uploaderRefFrontMirrorView = useRef(),
            uploaderRefRearView = useRef(),
            uploaderRefRearMirrorView = useRef(),
            uploaderRefVRView = useRef();
    const lessonFormDetails = {
        name: "",
        teacher: "",
        desc: "",
        files: []
    };
    const { state, dispatch } = useStoreConsumer();
    const loggedInUser = state.loggedInUser;
    const [isAdminLoggedIn, toggleAdminLogin] = useState(false);
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPwd, setAdminPwd] = useState('');
    const [loggedInMessages, setLoginMessage] = useState('');
    const [userListData, setUsersList] = useState(null);
    const [uploadNewLesson, setInternalLink] = useState(true);
    const [formMessageBox, setFormMessage] = useState('');
    const [messageClass, setFormMessageClass] = useState('');
    const initialVideosToUploadData = {
        frontView: null,
        frontMirrorView: null,
        rearView: null,
        rearMirrorView: null,
        vrView: null
    }
    const [videosToUpload, setVideosToUpload] = useState(initialVideosToUploadData);
    const initialVideoUploadProgress = {
        frontView: 0,
        frontMirrorView: 0,
        rearView: 0,
        rearMirrorView: 0,
        vrView: 0
    }
    const [videoUploadProgess, setVideoUploadProgess] = useState(initialVideoUploadProgress);
    const initialVideoProgressBarState = {
        frontView: false,
        frontMirrorView: false,
        rearView: false,
        rearMirrorView: false,
        vrView: false        
    }
    const [showVideoProgressBar, setShowVideoProgressBar] = useState(initialVideoProgressBarState);
    const [fileUploadValue, setFileUploadValue] = useState(null);

    const [disableUploadButton, setUploadButtonState] = useState(true);
    const [SelectedVideoData, setSelectedVideoData] = useState(lessonFormDetails);
    const [validateUploadForm, setValidationUploadForm] = useState(false);
    const [lessonData, setLessonData] = useState();

    useEffect(() => {
        if (checkAdminLogIn) {
            toggleAdminLogin(checkAdminLogIn);
            setInternalLink(true);
            getUsersList();
        }
    }, []);

    useEffect(() => {
        const filteredSelectedVideos = Object.values(videosToUpload).filter((item) => item !== null);
        if (filteredSelectedVideos && filteredSelectedVideos.length === 5) {
            setUploadButtonState(false);
            setSelectedVideoData({...SelectedVideoData, files: videosToUpload});
        }
    }, [videosToUpload]);

    useEffect(() => {
        // console.log(" lessonData to save to DB", lessonData);
        console.log("  videoUploadProgess >>>>>>>>>> ", videoUploadProgess)
    }, [lessonData, videoUploadProgess]);

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
            getAllUser().subscribe(users => {
                console.log('USERS LISTS: ', users);
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

    const setInternalLinkFn = (internalLink) => {
        console.log('interal link is ', internalLink);
        setInternalLink(internalLink);
    }

    const handleChange = (prop, index) => (event) => {
        let value = event.target.value;
        setSelectedVideoData({ ...SelectedVideoData, [prop]: value });
    };

    async function onChangeFile(event, ref, view) {
        event.stopPropagation();
        event.preventDefault();
        var file = event.target.files[0];
        const selectedElement = event.currentTarget.parentNode;
        if (!file) {
            selectedElement.classList.remove('selected');
            setShowVideoProgressBar({...showVideoProgressBar, [view]: false});
        }
        // 1MB in Bytes is 1,048,576 so you can multiply it by the limit you need.
        if (file) {
            if (file.size > 52428800) {
                alert("File is too big!");
                dispatch(displayNotification({
                    msg: "File is too big!",
                    type: NOTIFICATION_ERROR,
                    time: 3000
                }))
                setVideosToUpload({...videosToUpload});
            } else {
                setVideosToUpload({...videosToUpload});
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                    setVideosToUpload({...videosToUpload, [view] : reader.result});
                    setShowVideoProgressBar({...showVideoProgressBar, [view] : true});
                    selectedElement.classList.add('selected')
                }
                reader.onerror = error => console.error(error);
            }
        }
    }

    const sendSelectedVdosToUpload = () => {
        const { name, teacher, desc } = SelectedVideoData;
        if (name === "" && teacher === "" && desc === "") {
            setFormMessageClass('error');
            setFormMessage('Please fill all fields!');
        } else {
            if (name === "" ) {
                setFormMessageClass('error');
                setFormMessage('Please fill Name!');
            } else if (teacher === "") {
                setFormMessageClass('error');
                setFormMessage('Please fill Teacher\'s Name!');
            } else if (desc === "") {
                setFormMessageClass('error');
                setFormMessage('Please add Description!');
            } else {
                setFormMessageClass('');
                setFormMessage('');
                getLessonByNameCall(name);
            }
        }
    }

    const getLessonByNameCall = (name) => {
        getLessonByName(name).subscribe((response) => {
            console.log(" response received from get LessonByName", response);
            if (Object.keys(response).length === 0) {
                uploadLessonVideos();
            } else {
                setFormMessageClass('error');
                setFormMessage(`Lesson is already exist with this name : ${name}, Please enter unique Lesson Name each time!`);
            }
        });
    }

    const uploadLessonVideos = () => {
        const { name, teacher, desc, files } = SelectedVideoData;
        let lessonDetails = {
            name, teacher, desc, videoList: []
        }
        let videoListObj = {};
        let videoProgess = {};
        if (Object.values(files) && Object.values(files).length > 0) {
            for (const [key, value] of Object.entries(files)) {
                uploadVideo(value, 'lessons', name, key).subscribe((response) => {
                    dispatch(enableLoading());
                    if (response.donePercentage) {
                        videoProgess[key] = response.donePercentage;
                        setVideoUploadProgess(videoProgess);
                    }
                    if (response.downloadURL) {
                        videoListObj = {...videoListObj, [key]: response.downloadURL};
                        lessonDetails.videoList = videoListObj;
                        if (Object.values(files).length  === Object.values(lessonDetails.videoList).length) {
                            saveLessonToDB(lessonDetails);
                        }
                    }
                })
            }
        }
    }

    const saveLessonToDB = (lessonObj) => {
        saveLesson(lessonObj).subscribe((response) => {
            console.log("vedio data saved to db", response);
            setFormMessageClass('success');
            setFormMessage(`Lesson ${lessonObj.name} created!`);
            setSelectedVideoData(lessonFormDetails);
            setVideosToUpload(initialVideosToUploadData);
            setVideoUploadProgess(initialVideoUploadProgress);
            setShowVideoProgressBar(initialVideoProgressBarState);
            setUploadButtonState(true);
            setFileUploadValue("");
            dispatch(disableLoading());
            setTimeout(() => {
                setFormMessageClass('');
                setFormMessage('');
            }, 3000);
        })
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
                <Link to="/adminpanel/lessons" title="upload new lessons" className="panelLink active">
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
            <div className={`competition-bo-wrap clearfix ${(isAdminLoggedIn || checkAdminLogIn) && 'loggedInAdmin usersListBox'}`}>
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


                            <Link onClick={
                                () => {
                                    setInternalLinkFn(true)
                                }} 
                                title="Upload New Lessons" className="mainLink">
                                <span>
                                    Upload New Lessons
                                </span>
                            </Link>
                            <Link onClick={
                                () => {
                                    setInternalLinkFn(false)
                                }} 
                                title="List of Uploaded Lessons" className="mainLink">
                                <span>
                                    List of Uploaded Lessons
                                </span>
                            </Link>
                        </h1>
                        :
                        <h1>
                            <Link to="/adminpanel" title="back to admin" className="backToAdmin">
                                <span>
                                    &#8592;
                                </span>
                            </Link>
                            Login to Manage Lessons
                        </h1>
                }
                {
                    isAdminLoggedIn || checkAdminLogIn ?
                        uploadNewLesson
                        ?   <div className="usersListWrap">
                                <p className={`messageWrap ${messageClass}`}>{formMessageBox}</p>
                                <div className="inner-form-wrap">
                                    <div className="input-wrap">
                                        <TextField className="input-field"
                                            required
                                            id="outlined-required-name"
                                            label="Name"
                                            variant="outlined"
                                            value={SelectedVideoData.name}
                                            onChange={handleChange('name')}
                                        />
                                    </div>
                                    <div className="input-wrap">
                                        <TextField className="input-field"
                                            required
                                            id="outlined-required-teacher"
                                            label="Artist/Teacher"
                                            variant="outlined"
                                            value={SelectedVideoData.teacher}
                                            onChange={handleChange('teacher')}
                                        />
                                    </div>
                                    <div className="input-wrap input-wrap-full">
                                        <TextField
                                            required
                                            className="textarea"
                                            id="outlined-required-desc"
                                            variant="outlined"
                                            label="Artist/Teacher"
                                            multiline
                                            rowsMax={4}
                                            value={SelectedVideoData.desc}
                                            onChange={handleChange('desc')}
                                        />
                                    </div>

                                    <div className="input-wrap input-wrap-full">
                                        <label className="controlLabel">Lesson Videos</label>
                                        <div className="uploadContainer">
                                            <div className={videosToUpload.frontView !== null ? 'upload-input-wrap selected' : 'upload-input-wrap'}>
                                                <h6 className="heading">Front Side</h6>
                                                <h6 className="sub-heading">Default View</h6>
                                                <i className="upload-icon"><FaCloudUploadAlt /></i>
                                                <input id="frontView"
                                                    type="file"
                                                    accept="video/mp4,video/x-m4v,video/*"
                                                    value={fileUploadValue}
                                                    ref={uploaderRefFrontView}
                                                    onChange={(e) => onChangeFile(e, uploaderRefFrontView, 'frontView')}
                                                />
                                                {showVideoProgressBar?.frontView && <LinearProgress className="uploadProgessBar" variant="determinate" value={videoUploadProgess.frontView} />}
                                            </div>
                                            <div className={videosToUpload.frontMirrorView !== null ? 'upload-input-wrap selected' : 'upload-input-wrap'}>
                                                <h6 className="heading">Front Mirror</h6>
                                                <i className="upload-icon"><FaCloudUploadAlt /></i>
                                                <input id="frontMirrorView"
                                                    type="file"
                                                    accept="video/mp4,video/x-m4v,video/*"
                                                    value={fileUploadValue}
                                                    ref={uploaderRefFrontMirrorView}
                                                    onChange={(e) => onChangeFile(e, uploaderRefFrontMirrorView, 'frontMirrorView')}
                                                />
                                                {showVideoProgressBar?.frontMirrorView && <LinearProgress className="uploadProgessBar" variant="determinate" value={videoUploadProgess.frontMirrorView} />}
                                            </div>
                                            <div className={videosToUpload.rearView !== null ? 'upload-input-wrap selected' : 'upload-input-wrap'}>
                                                <h6 className="heading">Back Side</h6>
                                                <i className="upload-icon"><FaCloudUploadAlt /></i>
                                                <input id="rearView"
                                                    type="file"
                                                    accept="video/mp4,video/x-m4v,video/*"
                                                    value={fileUploadValue}
                                                    ref={uploaderRefRearView}
                                                    onChange={(e) => onChangeFile(e, uploaderRefRearView, 'rearView')}
                                                />
                                                {showVideoProgressBar?.rearView && <LinearProgress className="uploadProgessBar" variant="determinate" value={videoUploadProgess.rearView} />}
                                            </div>
                                            <div className={videosToUpload.rearMirrorView !== null ? 'upload-input-wrap selected' : 'upload-input-wrap'}>
                                                <h6 className="heading">Back Mirror</h6>
                                                <i className="upload-icon"><FaCloudUploadAlt /></i>
                                                <input id="rearMirrorView"
                                                    type="file"
                                                    accept="video/mp4,video/x-m4v,video/*"
                                                    value={fileUploadValue}
                                                    ref={uploaderRefRearMirrorView}
                                                    onChange={(e) => onChangeFile(e, uploaderRefRearMirrorView, 'rearMirrorView')}
                                                />
                                                {showVideoProgressBar?.rearMirrorView && <LinearProgress className="uploadProgessBar" variant="determinate" value={videoUploadProgess.rearMirrorView} />}
                                            </div>
                                            <div className={videosToUpload.vrView !== null ? 'upload-input-wrap selected' : 'upload-input-wrap'}>
                                                <h6 className="heading">VR Mode</h6>
                                                <i className="upload-icon"><FaCloudUploadAlt /></i>
                                                <input id="vrView"
                                                    type="file"
                                                    accept="video/mp4,video/x-m4v,video/*"
                                                    value={fileUploadValue}
                                                    ref={uploaderRefVRView}
                                                    onChange={(e) => onChangeFile(e, uploaderRefVRView, 'vrView')}
                                                />
                                                {showVideoProgressBar?.vrView && <LinearProgress className="uploadProgessBar" variant="determinate" value={videoUploadProgess.vrView} />}
                                            </div>
                                            <div className="upload-input-wrap button-container">
                                                <Button
                                                    disabled = {disableUploadButton ? true : false}
                                                    variant="contained" color="primary"
                                                    onClick={() => { sendSelectedVdosToUpload() }}>Upload Video <br />&amp;<br /> Create Lesson
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        :   <div className="usersListWrap">
                                <table>
                                    <thead>
                                        <tr>
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
                                            userListData.map( item => {
                                                return (
                                                    <tr>
                                                        <td>{item.name}</td>
                                                        <td>{item.email || 'N/A'}</td>
                                                        <td>{item.phone || 'N/A'}</td>
                                                        <td>{item.gender || 'N/A'}</td>
                                                        <td>{item.state || 'N/A'}</td>
                                                        <td>{item.country || 'N/A'}</td>
                                                        <td></td>
                                                    </tr>
                                                )
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
