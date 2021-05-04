import React, { useState, useEffect, useRef } from 'react';
import { LinearProgress } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Select from '@material-ui/core/Select';
import { FaCloudUploadAlt, FaInfoCircle } from 'react-icons/fa';
import boogaluLogo from '../../Images/Boogalu-logo.svg';
import logOutIcon from '../../Images/logout-icon.png';
import { Link } from 'react-router-dom';
import { ADMIN_USER, ADMIN_PWD } from '../../Constants';
import championIcon from '../../Images/champion-box-icon.png';
import lessonsIcon from '../../Images/lessons-icon.png';
import subscribeIcon from '../../Images/subscribe-icon.png';
import usersIcon from '../../Images/users-icon.png';
import { useStoreConsumer } from '../../Providers/StateProvider';
import { saveLesson, getLessonByName, getAllLessons } from "../../Services/Lessons.service";
import { enableLoading, disableLoading } from "../../Actions/Loader";
import { NOTIFICATION_ERROR, NOTIFICATION_SUCCCESS } from "../../Constants";
import { displayNotification } from "../../Actions/Notification";
import { uploadVideo } from "../../Services/Upload.service";

const checkAdminLogIn = JSON.parse(localStorage.getItem('adminLoggedIn'));

export default function UploadLessons() {
    const   uploaderRefThumbnailImage = useRef(),
            uploaderRefFrontView = useRef(),
            uploaderRefFrontMirrorView = useRef(),
            uploaderRefRearView = useRef(),
            uploaderRefRearMirrorView = useRef(),
            uploaderRefVRView = useRef();
    const lessonFormDetails = {
        name: "",
        teacher: "",
        desc: "",
        expertiseLevel: "",
        artForm: "",
        accessbility: 'paid',
        files: []
    };
    const { state, dispatch } = useStoreConsumer();
    const loggedInUser = state.loggedInUser;
    const [isAdminLoggedIn, toggleAdminLogin] = useState(false);
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPwd, setAdminPwd] = useState('');
    const [loggedInMessages, setLoginMessage] = useState('');
    const [uploadNewLesson, setInternalLink] = useState(true);
    const [formMessageBox, setFormMessage] = useState('');
    const [messageClass, setFormMessageClass] = useState('');
    const [lessonsData, setLessonsList] = useState(null);
    const [isUploadingInProgress, toggleUploadingMessage] = useState(false);
    const [btnLoadingClass, toggleBtnLoadingClass] = useState('');
    
    const createTabRef = useRef(null);
    const listTabRef = useRef(null);
    const requiredUploadFieldsForLesson = [
        "thumbnailImage",
        "frontView",
        "frontMirrorView",
        "rearView",
        "rearMirrorView",
    ];
    const initialVideosToUploadData = {
        thumbnailImage: null,
        frontView: null,
        frontMirrorView: null,
        rearView: null,
        rearMirrorView: null,
        vrView: null
    }
    const [videosToUpload, setVideosToUpload] = useState(initialVideosToUploadData);
    const initialVideoUploadProgress = {
        thumbnailImage: 0,
        frontView: 0,
        frontMirrorView: 0,
        rearView: 0,
        rearMirrorView: 0,
        vrView: 0
    }
    const [videoUploadProgess, setVideoUploadProgess] = useState(initialVideoUploadProgress);
    const initialVideoProgressBarState = {
        thumbnailImage: false,
        frontView: false,
        frontMirrorView: false,
        rearView: false,
        rearMirrorView: false,
        vrView: false        
    }
    const [showVideoProgressBar, setShowVideoProgressBar] = useState(initialVideoProgressBarState);
    const [fileUploadValue, setFileUploadValue] = useState("");

    const [disableUploadButton, setUploadButtonState] = useState(true);
    const [SelectedVideoData, setSelectedVideoData] = useState(lessonFormDetails);
    const [validateUploadForm, setValidationUploadForm] = useState(false);
    const [lessonData, setLessonData] = useState();

    useEffect(() => {
        if (checkAdminLogIn) {
            toggleAdminLogin(checkAdminLogIn);
            setInternalLink(true);
        }
    }, []);

    useEffect(() => {
        const validateRequiredFieldsData = [];
        if (videosToUpload) {
            requiredUploadFieldsForLesson.map(field => {
                const itemValue = videosToUpload[field];
                if (itemValue) {
                    validateRequiredFieldsData.push(videosToUpload[field]);
                }
            })
        }
        if (requiredUploadFieldsForLesson && validateRequiredFieldsData && validateRequiredFieldsData.length === requiredUploadFieldsForLesson.length) {
            setUploadButtonState(false);
            setSelectedVideoData({...SelectedVideoData, files: videosToUpload});
        }
    }, [videosToUpload]);


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

    const setInternalLinkFn = (internalLink) => {
        if (internalLink) {
            if (createTabRef.current && listTabRef.current) {
                createTabRef.current.classList.add('active');
                listTabRef.current.classList.remove('active');
            }
        } else {
            getAllLessonsData();
            if (createTabRef.current && listTabRef.current) {
                createTabRef.current.classList.remove('active');
                listTabRef.current.classList.add('active');
            }
        }
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
                dispatch(displayNotification({
                    msg: "File is too big!",
                    type: NOTIFICATION_ERROR,
                    time: 3000
                }));
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
                toggleBtnLoadingClass('loading');
                getLessonByNameCall(name.trim());
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

    const getAllLessonsData = () => {
        try {
            dispatch(enableLoading());
            getAllLessons().subscribe(lessons => {
                console.log('LESSONS LISTS: ', lessons);
                dispatch(disableLoading());
                if (lessons.length) {
                    setLessonsList(lessons);
                }
            });
        } catch (e) {
            dispatch(disableLoading());
            console.log('Error: ', e);
        }
    }

    const uploadLessonVideos = () => {
        const { name, teacher, desc, files, expertiseLevel, artForm, accessbility } = SelectedVideoData;
        let lessonDetails = {
            name, teacher, desc, expertiseLevel, artForm, accessbility, videoList: []
        }
        let videoListObj = {};
        let videoProgess = {};
        let filesToUpload = {};
        lessonDetails.name = lessonDetails.name.trim();
        toggleBtnLoadingClass('');
        if (Object.values(files) && Object.values(files).length > 0) {
            toggleUploadingMessage(true);
            for (const [key, value] of Object.entries(files)) {
                if (key && value) {
                    filesToUpload = {...filesToUpload, [key]: value};
                    uploadVideo(value, 'lessons', name, key).subscribe((response) => {
                        dispatch(enableLoading());
                        if (response.donePercentage) {
                            videoProgess[key] = response.donePercentage;
                            setVideoUploadProgess(videoProgess);
                        }
                        if (response.downloadURL) {
                            videoListObj = {...videoListObj, [key]: response.downloadURL};
                            lessonDetails.videoList = videoListObj;
                            if (key === 'thumbnailImage') {
                                lessonDetails = {...lessonDetails, [key]: lessonDetails.videoList[key]};
                            }
                            if (Object.values(filesToUpload).length  === Object.values(lessonDetails.videoList).length) {
                                delete lessonDetails.videoList['thumbnailImage'];
                                saveLessonToDB(lessonDetails);
                            }
                        }
                    })
                }
            }
        }
    }

    const saveLessonToDB = (lessonObj) => {
        saveLesson(lessonObj).subscribe((response) => {
            console.log("vedio data saved to db", response);
            setSelectedVideoData(lessonFormDetails);
            setVideosToUpload(initialVideosToUploadData);
            setVideoUploadProgess(initialVideoUploadProgress);
            setShowVideoProgressBar(initialVideoProgressBarState);
            setUploadButtonState(true);
            setFileUploadValue("");
            toggleUploadingMessage(false);
            setFormMessageClass('');
            setFormMessage('');
            dispatch(displayNotification({
                msg: "Lesson uploaded successfully!",
                type: NOTIFICATION_SUCCCESS,
                time: 3000
            }));
            dispatch(disableLoading());
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
            {
                isAdminLoggedIn || checkAdminLogIn ?
                <div className="optionsTab">
                    <a onClick={(e) => setInternalLinkFn(true)} className="active" ref={createTabRef}>Upload new</a>
                    <a onClick={(e) => setInternalLinkFn(false)} ref={listTabRef}>View lessons</a>
                </div>: ''
            }
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


                            {
                                uploadNewLesson ?
                                'Upload a new lesson'
                                :
                                'View lists of lessons created'
                            }
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
                                    <div className="input-wrap">
                                        <FormControl variant="outlined" className="input-field">
                                            <InputLabel id="select-outlined-label-level">Expertise Level</InputLabel>
                                            <Select
                                                required
                                                labelId="select-outlined-label-level"
                                                id="select-outlined"
                                                value={SelectedVideoData.expertiseLevel}
                                                onChange={handleChange('expertiseLevel')}
                                                label="Expertise Level"
                                            >
                                                <MenuItem value="beginners">Beginners</MenuItem>
                                                <MenuItem value="intermediate">Intermediate</MenuItem>
                                                <MenuItem value="advance">Advance</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </div>
                                    <div className="input-wrap">
                                        <FormControl variant="outlined" className="input-field">
                                            <InputLabel id="select-outlined-label-artform">Styles</InputLabel>
                                            <Select
                                                required
                                                labelId="select-outlined-label-level"
                                                id="select-outlined"
                                                value={SelectedVideoData.artForm}
                                                onChange={handleChange('artForm')}
                                                label="Styles"
                                            >
                                                <MenuItem value="hip-hop">Hip Hop</MenuItem>
                                                <MenuItem value="jazz">Jazz</MenuItem>
                                                <MenuItem value="contemporary">Contemporary</MenuItem>
                                                <MenuItem value="ballet">Ballet</MenuItem>
                                                <MenuItem value="bharatnatyam">Bharatnatyam</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </div>
                                    <div className="controlGroupWrap">
                                        <div className="input-wrap input-wrap-full">
                                            <div className="uploadContainer">
                                                <div className={videosToUpload.thumbnailImage !== null ? 'upload-input-wrap selected' : 'upload-input-wrap'}>
                                                    <h6 className="heading">Thumbnail <sup className="mandatAsterisk">*</sup></h6>
                                                    <h6 className="sub-heading">Maximum size 1 MB</h6>
                                                    <i className="upload-icon"><FaCloudUploadAlt /></i>
                                                    <input id="thumbnailImage"
                                                        type="file"
                                                        accept="image/*"
                                                        value={fileUploadValue}
                                                        ref={uploaderRefThumbnailImage}
                                                        onChange={(e) => onChangeFile(e, uploaderRefThumbnailImage, 'thumbnailImage')}
                                                    />
                                                    {showVideoProgressBar?.thumbnailImage && <LinearProgress className="uploadProgessBar" variant="determinate" value={videoUploadProgess.thumbnailImage} />}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="input-wrap input-wrap-full lessonsDescriptionBox">
                                            <TextField
                                                required
                                                className="textarea"
                                                id="outlined-required-desc"
                                                variant="outlined"
                                                label="About lesson"
                                                multiline
                                                rowsMax={4}
                                                value={SelectedVideoData.desc}
                                                onChange={handleChange('desc')}
                                            />
                                        </div>
                                    </div>

                                    <div className="input-wrap input-wrap-full video-control-wrap">
                                        <label className="controlLabel">Lesson Videos 
                                            <sup className="mandatAsterisk">*</sup>
                                            <span className="infoMessage">( Maximum size of each video should be 50 MB )</span>
                                        </label>
                                        <div className="uploadContainer">
                                            <div className={videosToUpload.frontView !== null ? 'upload-input-wrap selected' : 'upload-input-wrap'}>
                                                <h6 className="heading">Front Side <sup className="mandatAsterisk">*</sup></h6>
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
                                                <h6 className="heading">Front Mirror <sup className="mandatAsterisk">*</sup></h6>
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
                                                <h6 className="heading">Back Side <sup className="mandatAsterisk">*</sup></h6>
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
                                                <h6 className="heading">Back Mirror <sup className="mandatAsterisk">*</sup></h6>
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
                                        </div>
                                    </div>

                                    <div className="input-wrap input-wrap-full">
                                        <RadioGroup 
                                            className="radioGroupControls"
                                            aria-label="accessbility" 
                                            name="accessbility" 
                                            value={SelectedVideoData.accessbility}
                                            defaultValue="paid" 
                                            onChange={handleChange('accessbility')}>
                                            <FormControlLabel value="premium" control={<Radio />} label="Premium" />
                                            <FormControlLabel value="pro" control={<Radio />} label="Pro" />
                                            <FormControlLabel value="paid" control={<Radio />} label="Paid" />
                                            <FormControlLabel value="free" control={<Radio />} label="Free" />
                                        </RadioGroup>
                                    </div>

                                    <p className={`messageWrap ${messageClass}`}>{formMessageBox}</p>
                                    <div className="upload-input-wrap button-container">
                                        <Button
                                            className={btnLoadingClass}
                                            disabled = {disableUploadButton ? true : false}
                                            variant="contained" color="primary"
                                            onClick={() => { sendSelectedVdosToUpload() }}>
                                            Upload Video &amp; Create Lesson
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        :   <div className="lessonsList adminItemlistView">
                                {
                                    lessonsData && lessonsData.length ?
                                    lessonsData.map( item => {
                                        return (<div className="boxItem compBox" key={item.id}>
                                            <p className="title">Name: <span>{ item.name }</span></p>
                                            <p className="statusBlock">
                                                Teacher: <span>{ item.teacher }</span></p>
                                            <p className="date">Date Created: <span>{item.uploadedTime}</span></p>
                                        </div>)
                                    })
                                    : <p className="noDataInListMessage">You haven't uploaded any Lessons!</p>
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
            {
                isUploadingInProgress ?
                <div className="uploadingNotificationForAdmin">
                    <i className="infoIcon"><FaInfoCircle /></i>
                    Uploading is in progress, please do not redirect, refresh or close the browser!
                </div> : ''
            }
            <div className="footerBox">
                &copy; 2021 Box Puppet Ent. Pvt. Ltd., All rights reserved.
            </div>
        </div>
    )
}
