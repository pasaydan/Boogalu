import React, { useState, useEffect, useRef } from "react";
import { LinearProgress } from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Select from "@material-ui/core/Select";
import { FaCloudUploadAlt, FaInfoCircle } from "react-icons/fa";
import boogaluLogo from "../../Images/Boogaluu-logo.png";
import { FaPowerOff } from "react-icons/fa";
import { Link } from "react-router-dom";
import { ADMIN_USER, ADMIN_PWD } from "../../Constants";
import championIcon from "../../Images/champion-box-icon.png";
import lessonsIcon from "../../Images/lessons-icon.png";
import subscribeIcon from "../../Images/subscribe-icon.png";
import usersIcon from "../../Images/users-icon.png";
import { useStoreConsumer } from "../../Providers/StateProvider";
import {
  saveLesson,
  getLessonByName,
  getAllLessons,
} from "../../Services/Lessons.service";
import { NOTIFICATION_ERROR, NOTIFICATION_SUCCCESS } from "../../Constants";
import { displayNotification } from "../../Actions/Notification";
import { uploadVideo } from "../../Services/Upload.service";
import Loader from "../Loader";
const checkAdminLogIn = JSON.parse(localStorage.getItem("adminLoggedIn"));
let previewVideoArray = [];
let previewThumbnail = "";

export default function UploadLessons() {
  const uploaderRefThumbnailImage = useRef(),
    uploaderPreview = useRef(),
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
    accessbility: "paid",
    files: [],
  };

  const { dispatch } = useStoreConsumer();
  const [isAdminLoggedIn, toggleAdminLogin] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPwd, setAdminPwd] = useState("");
  const [loggedInMessages, setLoginMessage] = useState("");
  const [uploadNewLesson, setInternalLink] = useState(true);
  const [formMessageBox, setFormMessage] = useState("");
  const [messageClass, setFormMessageClass] = useState("");
  const [lessonsData, setLessonsList] = useState(null);
  const [isUploadingInProgress, toggleUploadingMessage] = useState(false);
  const [btnLoadingClass, toggleBtnLoadingClass] = useState("");
  const [previewModeOn, togglePreviewMode] = useState(false);
  const [isLoaderActive, toggleLoading] = useState(false);
  const createTabRef = useRef(null);
  const listTabRef = useRef(null);
  const previewVideoPreviewRef = useRef(null);
  const previewVideoFrontRef = useRef(null);
  const previewVideoFrontMirrorRef = useRef(null);
  const previewVideoBackRef = useRef(null);
  const previewVideoBackMirrorRef = useRef(null);
  const previewVideoVRModeRef = useRef(null);

  const requiredUploadFieldsForLesson = [
    "thumbnailImage",
    "preview",
    "frontView",
    "frontMirrorView",
    "rearView",
    "rearMirrorView",
  ];
  const initialVideosToUploadData = {
    thumbnailImage: null,
    preview: null,
    frontView: null,
    frontMirrorView: null,
    rearView: null,
    rearMirrorView: null,
    vrView: null,
  };
  const [videosToUpload, setVideosToUpload] = useState(
    initialVideosToUploadData
  );
  const initialVideoUploadProgress = {
    thumbnailImage: 0,
    preview: 0,
    frontView: 0,
    frontMirrorView: 0,
    rearView: 0,
    rearMirrorView: 0,
    vrView: 0,
  };
  const [videoUploadProgess, setVideoUploadProgess] = useState(
    initialVideoUploadProgress
  );
  const initialVideoProgressBarState = {
    thumbnailImage: false,
    preview: false,
    frontView: false,
    frontMirrorView: false,
    rearView: false,
    rearMirrorView: false,
    vrView: false,
  };
  const [showVideoProgressBar, setShowVideoProgressBar] = useState(
    initialVideoProgressBarState
  );
  const [fileUploadValue, setFileUploadValue] = useState("");

  const [disableUploadButton, setUploadButtonState] = useState(true);
  const [SelectedVideoData, setSelectedVideoData] = useState(lessonFormDetails);

  useEffect(() => {
    if (checkAdminLogIn) {
      toggleAdminLogin(checkAdminLogIn);
      setInternalLink(true);
    }
  }, []);

  useEffect(() => {
    const validateRequiredFieldsData = [];
    if (videosToUpload) {
      requiredUploadFieldsForLesson.forEach((field) => {
        const itemValue = videosToUpload[field];
        if (itemValue) {
          validateRequiredFieldsData.push(videosToUpload[field]);
        }
      });
    }
    if (
      requiredUploadFieldsForLesson &&
      validateRequiredFieldsData &&
      validateRequiredFieldsData.length === requiredUploadFieldsForLesson.length
    ) {
      setUploadButtonState(false);
      setSelectedVideoData({ ...SelectedVideoData, files: videosToUpload });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videosToUpload]);

  function handleAdminLogin(value, type) {
    if (type === "email") {
      setAdminEmail(value?.target?.value);
    } else {
      setAdminPwd(value?.target?.value);
    }
  }

  function triggerLogin(event, action) {
    if (
      action &&
      adminEmail &&
      adminEmail === ADMIN_USER &&
      adminPwd &&
      adminPwd === ADMIN_PWD
    ) {
      setLoginMessage("");
      toggleAdminLogin(true);
      localStorage.setItem("adminLoggedIn", true);
    } else {
      toggleAdminLogin(false);
      localStorage.setItem("adminLoggedIn", false);
      if (adminEmail === "" || adminPwd === "") {
        setLoginMessage("Please enter Email and Password!");
      } else {
        setLoginMessage(
          "Invalid credentials, please enter valid email-Id and Password!"
        );
      }
    }
  }

  function tiggerAdminLogout(event, action) {
    setAdminEmail("");
    setAdminPwd("");
    toggleAdminLogin(action);
    localStorage.setItem("adminLoggedIn", action);
    window.location.reload();
  }

  const setInternalLinkFn = (internalLink) => {
    if (internalLink) {
      if (createTabRef.current && listTabRef.current) {
        createTabRef.current.classList.add("active");
        listTabRef.current.classList.remove("active");
      }
    } else {
      getAllLessonsData();
      if (createTabRef.current && listTabRef.current) {
        createTabRef.current.classList.remove("active");
        listTabRef.current.classList.add("active");
      }
    }
    setInternalLink(internalLink);
  };

  const handleChange = (prop, index) => (event) => {
    let value = event.target.value;
    setSelectedVideoData({ ...SelectedVideoData, [prop]: value });
  };

  async function onChangeFile(event, ref, view) {
    event.stopPropagation();
    event.preventDefault();
    const file = event.target.files[0];
    const selectedElement = event.currentTarget.parentNode;
    const blobURL = URL.createObjectURL(file);
    if (view === "thumbnailImage") {
      previewThumbnail = blobURL;
    }
    if (
      view === "preview" ||
      view === "frontView" ||
      view === "frontMirrorView" ||
      view === "rearView" ||
      view === "rearMirrorView" ||
      view === "vrView"
    ) {
      const previewVideoObject = {};
      previewVideoObject["panel"] = view;
      previewVideoObject["url"] = blobURL;
      if (previewVideoArray.length) {
        const objIndex = previewVideoArray.findIndex(
          (previewVideoObject) => previewVideoObject.panel === view
        );
        if (objIndex > -1) {
          previewVideoArray[objIndex]["url"] = blobURL;
        } else {
          previewVideoArray.push(previewVideoObject);
        }
      } else {
        previewVideoArray.push(previewVideoObject);
      }
    }
    if (!file) {
      selectedElement.classList.remove("selected");
      setShowVideoProgressBar({ ...showVideoProgressBar, [view]: false });
    }
    // 1MB in Bytes is 1,048,576 so you can multiply it by the limit you need.
    if (file) {
      if (view === "thumbnailImage" && file.size > 2200000) {
        dispatch(
          displayNotification({
            msg: "Thumbnail file size is too big, should not exceed 2 MB!",
            type: NOTIFICATION_ERROR,
            time: 5000,
          })
        );
      } else if (
        (view === "preview" ||
          view === "frontView" ||
          view === "frontMirrorView" ||
          view === "rearView" ||
          view === "rearMirrorView" ||
          view === "vrView") &&
        file.size > 420000000
      ) {
        // TODO: currently upload limit is 400 MB will need to increase to 500 MB for admin
        dispatch(
          displayNotification({
            msg: "Video file size is too big, should not exceed 400 MB!",
            type: NOTIFICATION_ERROR,
            time: 5000,
          })
        );
        setVideosToUpload({ ...videosToUpload });
      } else {
        setVideosToUpload({ ...videosToUpload });
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          setVideosToUpload({ ...videosToUpload, [view]: reader.result });
          setShowVideoProgressBar({ ...showVideoProgressBar, [view]: true });
          selectedElement.classList.add("selected");
        };
        reader.onerror = (error) => console.error(error);
      }
    }
  }

  function openPreviewMode() {
    togglePreviewMode(true);
    setTimeout(() => {
      if (previewVideoArray && previewVideoArray.length) {
        previewVideoArray.forEach((item) => {
          if (item.panel === "preview") {
            if (previewVideoPreviewRef.current) {
              previewVideoPreviewRef.current.src = item.url;
              previewVideoPreviewRef.current.controls = true;
              previewVideoPreviewRef.current.pause();
              if (previewThumbnail) {
                previewVideoPreviewRef.current.poster = previewThumbnail;
              }
            }
          }

          if (item.panel === "frontView") {
            if (previewVideoFrontRef.current) {
              previewVideoFrontRef.current.src = item.url;
              previewVideoFrontRef.current.controls = true;
              previewVideoFrontRef.current.pause();
            }
          }

          if (item.panel === "frontMirrorView") {
            if (previewVideoFrontMirrorRef.current) {
              previewVideoFrontMirrorRef.current.src = item.url;
              previewVideoFrontMirrorRef.current.controls = true;
              previewVideoFrontMirrorRef.current.pause();
            }
          }

          if (item.panel === "rearView") {
            if (previewVideoBackRef.current) {
              previewVideoBackRef.current.src = item.url;
              previewVideoBackRef.current.controls = true;
              previewVideoBackRef.current.pause();
            }
          }

          if (item.panel === "rearMirrorView") {
            if (previewVideoBackMirrorRef.current) {
              previewVideoBackMirrorRef.current.src = item.url;
              previewVideoBackMirrorRef.current.controls = true;
              previewVideoBackMirrorRef.current.pause();
            }
          }

          if (item.panel === "vrView") {
            if (previewVideoVRModeRef.current) {
              previewVideoVRModeRef.current.src = item.url;
              previewVideoVRModeRef.current.controls = true;
              previewVideoVRModeRef.current.pause();
            }
          }
        });
      }
    }, 100);
  }

  function closePreviewModal(event) {
    event.stopPropagation();
    togglePreviewMode(false);
  }

  const sendSelectedVdosToUpload = () => {
    const { name, teacher, desc } = SelectedVideoData;
    if (name === "" && teacher === "" && desc === "") {
      togglePreviewMode(false);
      setFormMessageClass("error");
      setFormMessage("Please fill all fields!");
    } else {
      if (name === "") {
        togglePreviewMode(false);
        setFormMessageClass("error");
        setFormMessage("Please fill Name!");
      } else if (teacher === "") {
        togglePreviewMode(false);
        setFormMessageClass("error");
        setFormMessage("Please fill Teacher's Name!");
      } else if (desc === "") {
        togglePreviewMode(false);
        setFormMessageClass("error");
        setFormMessage("Please add Description!");
      } else {
        setFormMessageClass("");
        setFormMessage("");
        toggleBtnLoadingClass("loading");
        getLessonByNameCall(name.trim());
      }
    }
  };

  const getLessonByNameCall = (name) => {
    getLessonByName(name).subscribe((response) => {
      if (Object.keys(response).length === 0) {
        uploadLessonVideos();
      } else {
        setFormMessageClass("error");
        setFormMessage(
          `Lesson is already exist with this name : ${name}, Please enter unique Lesson Name each time!`
        );
      }
    });
  };

  const getAllLessonsData = () => {
    try {
      toggleLoading(true);
      getAllLessons().subscribe((lessons) => {
        toggleLoading(false);
        if (lessons.length) {
          setLessonsList(lessons);
        }
      });
    } catch (e) {
      toggleLoading(false);
      console.log("Error: ", e);
    }
  };

  const uploadLessonVideos = () => {
    const {
      name,
      teacher,
      desc,
      files,
      expertiseLevel,
      artForm,
      accessbility,
    } = SelectedVideoData;
    let lessonDetails = {
      name,
      teacher,
      desc,
      expertiseLevel,
      artForm,
      accessbility,
      videoList: [],
    };
    let videoListObj = {};
    let videoProgess = {};
    let filesToUpload = {};
    lessonDetails.name = lessonDetails.name.trim();
    toggleBtnLoadingClass("");
    if (Object.values(files) && Object.values(files).length > 0) {
      togglePreviewMode(false);
      toggleUploadingMessage(true);
      for (const [key, value] of Object.entries(files)) {
        if (key && value) {
          filesToUpload = { ...filesToUpload, [key]: value };
          // eslint-disable-next-line no-loop-func
          uploadVideo(value, "lessons", name, key).subscribe((response) => {
            toggleLoading(true);
            if (response.donePercentage) {
              videoProgess[key] = response.donePercentage;
              setVideoUploadProgess(videoProgess);
            }
            if (response.downloadURL) {
              videoListObj = { ...videoListObj, [key]: response.downloadURL };
              lessonDetails.videoList = videoListObj;
              if (key === "thumbnailImage") {
                lessonDetails = {
                  ...lessonDetails,
                  [key]: lessonDetails.videoList[key],
                };
              }
              if (
                Object.values(filesToUpload).length ===
                Object.values(lessonDetails.videoList).length
              ) {
                delete lessonDetails.videoList["thumbnailImage"];
                saveLessonToDB(lessonDetails);
              }
            }
          });
        }
      }
    }
  };

  const saveLessonToDB = (lessonObj) => {
    saveLesson(lessonObj).subscribe((response) => {
      setSelectedVideoData(lessonFormDetails);
      setVideosToUpload(initialVideosToUploadData);
      setVideoUploadProgess(initialVideoUploadProgress);
      setShowVideoProgressBar(initialVideoProgressBarState);
      setUploadButtonState(true);
      setFileUploadValue("");
      toggleUploadingMessage(false);
      setFormMessageClass("");
      setFormMessage("");
      dispatch(
        displayNotification({
          msg: "Lesson uploaded successfully!",
          type: NOTIFICATION_SUCCCESS,
          time: 3000,
        })
      );
      toggleLoading(false);
    });
  };

  return (
    <div className="adminPanelSection">
      <Loader value={isLoaderActive} />
      <nav className="adminNavigation">
        <Link
          to="/adminpanel/competition"
          title="create competitions"
          className="panelLink"
        >
          <span className="iconsWrap championIconWrap">
            <img src={championIcon} alt="championship" />
          </span>
          <span className="title champion">Competitions</span>
        </Link>
        <Link
          to="/adminpanel/lessons"
          title="upload new lessons"
          className="panelLink active"
        >
          <span className="iconsWrap lessonsIconWrap">
            <img src={lessonsIcon} alt="lessons" />
          </span>
          <span className="title">Lessons</span>
        </Link>
        <Link
          to="/adminpanel/subscription"
          title="create subscription"
          className="panelLink"
        >
          <span className="iconsWrap subscribeIconWrap">
            <img src={subscribeIcon} alt="subscription" />
          </span>
          <span className="title">Subscription</span>
        </Link>
        <Link to="/adminpanel/users" title="manage users" className="panelLink">
          <span className="iconsWrap subscribeIconWrap">
            <img src={usersIcon} alt="users" />
          </span>
          <span className="title">Users</span>
        </Link>
      </nav>
      <div className="logoWrap">
        <a href="/" title="boogaluu home">
          <img src={boogaluLogo} alt="Boogaluu" />
        </a>
      </div>
      {isAdminLoggedIn || checkAdminLogIn ? (
        <div className="optionsTab">
          <p
            className="tabItem active"
            onClick={(e) => setInternalLinkFn(true)}
            ref={createTabRef}
          >
            Upload new
          </p>
          <p
            className="tabItem"
            onClick={(e) => setInternalLinkFn(false)}
            ref={listTabRef}
          >
            View lessons
          </p>
        </div>
      ) : (
        ""
      )}
      <div
        className={`competition-bo-wrap clearfix ${
          (isAdminLoggedIn || checkAdminLogIn) && "loggedInAdmin usersListBox"
        }`}
      >
        {isAdminLoggedIn || checkAdminLogIn ? (
          <p
            className="logOutIconWrap"
            title="logout"
            onClick={(e) => tiggerAdminLogout(e, false)}
          >
            <FaPowerOff />
          </p>
        ) : (
          ""
        )}
        {isAdminLoggedIn || checkAdminLogIn ? (
          <h1>
            <Link
              to="/adminpanel"
              title="back to admin"
              className="backToAdmin"
            >
              <span>&#8592;</span>
            </Link>

            {uploadNewLesson
              ? "Upload a new lesson"
              : "View lists of lessons created"}
          </h1>
        ) : (
          <h1>
            <Link
              to="/adminpanel"
              title="back to admin"
              className="backToAdmin"
            >
              <span>&#8592;</span>
            </Link>
            Login to Manage Lessons
          </h1>
        )}
        {isAdminLoggedIn || checkAdminLogIn ? (
          uploadNewLesson ? (
            <div className="usersListWrap">
              <div className="inner-form-wrap">
                <div className="input-wrap">
                  <TextField
                    className="input-field"
                    required
                    id="outlined-required-name"
                    label="Name"
                    variant="outlined"
                    value={SelectedVideoData.name}
                    onChange={handleChange("name")}
                  />
                </div>
                <div className="input-wrap">
                  <TextField
                    className="input-field"
                    required
                    id="outlined-required-teacher"
                    label="Artist/Teacher"
                    variant="outlined"
                    value={SelectedVideoData.teacher}
                    onChange={handleChange("teacher")}
                  />
                </div>
                <div className="input-wrap">
                  <FormControl variant="outlined" className="input-field">
                    <InputLabel id="select-outlined-label-level">
                      Expertise Level
                    </InputLabel>
                    <Select
                      required
                      labelId="select-outlined-label-level"
                      id="select-outlined"
                      value={SelectedVideoData.expertiseLevel}
                      onChange={handleChange("expertiseLevel")}
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
                    <InputLabel id="select-outlined-label-artform">
                      Styles
                    </InputLabel>
                    <Select
                      required
                      labelId="select-outlined-label-level"
                      id="select-outlined"
                      value={SelectedVideoData.artForm}
                      onChange={handleChange("artForm")}
                      label="Styles"
                    >
                      <MenuItem value="hip-hop">Hip Hop</MenuItem>
                      <MenuItem value="open-style">Open style</MenuItem>
                      <MenuItem value="locking">Locking</MenuItem>
                      <MenuItem value="popping">Popping</MenuItem>
                      <MenuItem value="house">House</MenuItem>
                      <MenuItem value="krump">Krump</MenuItem>
                      <MenuItem value="breaking">Breaking</MenuItem>
                      <MenuItem value="whacking">Whacking</MenuItem>
                    </Select>
                  </FormControl>
                </div>
                <div className="controlGroupWrap">
                  <div className="input-wrap input-wrap-full">
                    <div className="uploadContainer">
                      <div
                        className={
                          videosToUpload.thumbnailImage !== null
                            ? "upload-input-wrap selected"
                            : "upload-input-wrap"
                        }
                      >
                        <h6 className="heading">
                          Thumbnail <sup className="mandatAsterisk">*</sup>
                        </h6>
                        <h6 className="sub-heading">Maximum size 2 MB</h6>
                        <i className="upload-icon">
                          <FaCloudUploadAlt />
                        </i>
                        <input
                          id="thumbnailImage"
                          type="file"
                          accept="image/*"
                          value={fileUploadValue}
                          ref={uploaderRefThumbnailImage}
                          onChange={(e) =>
                            onChangeFile(
                              e,
                              uploaderRefThumbnailImage,
                              "thumbnailImage"
                            )
                          }
                        />
                        {showVideoProgressBar?.thumbnailImage && (
                          <LinearProgress
                            className="uploadProgessBar"
                            variant="determinate"
                            value={videoUploadProgess.thumbnailImage}
                          />
                        )}
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
                      onChange={handleChange("desc")}
                    />
                  </div>
                </div>

                <div className="input-wrap input-wrap-full video-control-wrap">
                  <label className="controlLabel">
                    Lesson Videos
                    <sup className="mandatAsterisk">*</sup>
                    <span className="infoMessage">
                      ( Maximum size of each video should be 400 MB )
                    </span>
                  </label>
                  <div className="uploadContainer">
                    <div
                      className={
                        videosToUpload.preview !== null
                          ? "upload-input-wrap selected"
                          : "upload-input-wrap"
                      }
                    >
                      <h6 className="heading">
                        Preview video(must){" "}
                        <sup className="mandatAsterisk">*</sup>
                      </h6>
                      <h6 className="sub-heading">30-40 secs only</h6>
                      <i className="upload-icon">
                        <FaCloudUploadAlt />
                      </i>
                      <input
                        id="frontView"
                        type="file"
                        accept="video/mp4,video/x-m4v,video/*"
                        value={fileUploadValue}
                        ref={uploaderPreview}
                        onChange={(e) =>
                          onChangeFile(e, uploaderPreview, "preview")
                        }
                      />
                      {showVideoProgressBar?.frontView && (
                        <LinearProgress
                          className="uploadProgessBar"
                          variant="determinate"
                          value={videoUploadProgess.frontView}
                        />
                      )}
                    </div>
                    <div
                      className={
                        videosToUpload.frontView !== null
                          ? "upload-input-wrap selected"
                          : "upload-input-wrap"
                      }
                    >
                      <h6 className="heading">
                        Front Side <sup className="mandatAsterisk">*</sup>
                      </h6>
                      <h6 className="sub-heading">Default View</h6>
                      <i className="upload-icon">
                        <FaCloudUploadAlt />
                      </i>
                      <input
                        id="frontView"
                        type="file"
                        accept="video/mp4,video/x-m4v,video/*"
                        value={fileUploadValue}
                        ref={uploaderRefFrontView}
                        onChange={(e) =>
                          onChangeFile(e, uploaderRefFrontView, "frontView")
                        }
                      />
                      {showVideoProgressBar?.frontView && (
                        <LinearProgress
                          className="uploadProgessBar"
                          variant="determinate"
                          value={videoUploadProgess.frontView}
                        />
                      )}
                    </div>
                    <div
                      className={
                        videosToUpload.frontMirrorView !== null
                          ? "upload-input-wrap selected"
                          : "upload-input-wrap"
                      }
                    >
                      <h6 className="heading">
                        Front Mirror <sup className="mandatAsterisk">*</sup>
                      </h6>
                      <i className="upload-icon">
                        <FaCloudUploadAlt />
                      </i>
                      <input
                        id="frontMirrorView"
                        type="file"
                        accept="video/mp4,video/x-m4v,video/*"
                        value={fileUploadValue}
                        ref={uploaderRefFrontMirrorView}
                        onChange={(e) =>
                          onChangeFile(
                            e,
                            uploaderRefFrontMirrorView,
                            "frontMirrorView"
                          )
                        }
                      />
                      {showVideoProgressBar?.frontMirrorView && (
                        <LinearProgress
                          className="uploadProgessBar"
                          variant="determinate"
                          value={videoUploadProgess.frontMirrorView}
                        />
                      )}
                    </div>
                    <div
                      className={
                        videosToUpload.rearView !== null
                          ? "upload-input-wrap selected"
                          : "upload-input-wrap"
                      }
                    >
                      <h6 className="heading">
                        Back Side <sup className="mandatAsterisk">*</sup>
                      </h6>
                      <i className="upload-icon">
                        <FaCloudUploadAlt />
                      </i>
                      <input
                        id="rearView"
                        type="file"
                        accept="video/mp4,video/x-m4v,video/*"
                        value={fileUploadValue}
                        ref={uploaderRefRearView}
                        onChange={(e) =>
                          onChangeFile(e, uploaderRefRearView, "rearView")
                        }
                      />
                      {showVideoProgressBar?.rearView && (
                        <LinearProgress
                          className="uploadProgessBar"
                          variant="determinate"
                          value={videoUploadProgess.rearView}
                        />
                      )}
                    </div>
                    <div
                      className={
                        videosToUpload.rearMirrorView !== null
                          ? "upload-input-wrap selected"
                          : "upload-input-wrap"
                      }
                    >
                      <h6 className="heading">
                        Back Mirror <sup className="mandatAsterisk">*</sup>
                      </h6>
                      <i className="upload-icon">
                        <FaCloudUploadAlt />
                      </i>
                      <input
                        id="rearMirrorView"
                        type="file"
                        accept="video/mp4,video/x-m4v,video/*"
                        value={fileUploadValue}
                        ref={uploaderRefRearMirrorView}
                        onChange={(e) =>
                          onChangeFile(
                            e,
                            uploaderRefRearMirrorView,
                            "rearMirrorView"
                          )
                        }
                      />
                      {showVideoProgressBar?.rearMirrorView && (
                        <LinearProgress
                          className="uploadProgessBar"
                          variant="determinate"
                          value={videoUploadProgess.rearMirrorView}
                        />
                      )}
                    </div>
                    <div
                      className={
                        videosToUpload.vrView !== null
                          ? "upload-input-wrap selected"
                          : "upload-input-wrap"
                      }
                    >
                      <h6 className="heading">VR Mode</h6>
                      <i className="upload-icon">
                        <FaCloudUploadAlt />
                      </i>
                      <input
                        id="vrView"
                        type="file"
                        accept="video/mp4,video/x-m4v,video/*"
                        value={fileUploadValue}
                        ref={uploaderRefVRView}
                        onChange={(e) =>
                          onChangeFile(e, uploaderRefVRView, "vrView")
                        }
                      />
                      {showVideoProgressBar?.vrView && (
                        <LinearProgress
                          className="uploadProgessBar"
                          variant="determinate"
                          value={videoUploadProgess.vrView}
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="input-wrap input-wrap-full lessons-radio-group">
                  <RadioGroup
                    className="radioGroupControls"
                    aria-label="accessbility"
                    name="accessbility"
                    value={SelectedVideoData.accessbility}
                    defaultValue="paid"
                    onChange={handleChange("accessbility")}
                  >
                    <FormControlLabel
                      value="premium"
                      control={<Radio />}
                      label="Premium"
                    />
                    <FormControlLabel
                      value="pro"
                      control={<Radio />}
                      label="Pro"
                    />
                    <FormControlLabel
                      value="paid"
                      control={<Radio />}
                      label="Startup"
                    />
                    <FormControlLabel
                      value="free"
                      control={<Radio />}
                      label="Free"
                    />
                  </RadioGroup>
                </div>

                <p className={`messageWrap ${messageClass}`}>
                  {formMessageBox}
                </p>
                <div className="upload-input-wrap button-container">
                  <Button
                    className={btnLoadingClass}
                    disabled={disableUploadButton ? true : false}
                    variant="contained"
                    color="primary"
                    // onClick={() => { sendSelectedVdosToUpload() }}>
                    onClick={() => {
                      openPreviewMode();
                    }}
                  >
                    Preview &amp; Create Lesson
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="lessonsList adminItemlistView">
              {lessonsData && lessonsData.length ? (
                lessonsData.map((item) => {
                  return (
                    <div className="boxItem compBox" key={item.id}>
                      <p className="title">
                        Name: <span>{item.name}</span>
                      </p>
                      <p className="statusBlock">
                        Teacher: <span>{item.teacher}</span>
                      </p>
                      <p className="date">
                        Date Created: <span>{item.uploadedTime}</span>
                      </p>
                    </div>
                  );
                })
              ) : (
                <p className="noDataInListMessage">
                  You haven't uploaded any Lessons!
                </p>
              )}
            </div>
          )
        ) : (
          <div className="login-admin-form">
            <p className="errorMessage">{loggedInMessages}</p>
            <div className="input-wrap">
              <TextField
                className="input-field"
                required
                id="admin-id"
                label="Email Id"
                onChange={(value) => handleAdminLogin(value, "email")}
                variant="outlined"
              />
            </div>
            <div className="input-wrap">
              <TextField
                className="input-field"
                required
                id="admin-pwd"
                type="password"
                label="Password"
                onChange={(value) => handleAdminLogin(value, "pwd")}
                variant="outlined"
              />
            </div>
            <div className="input-wrap action-wrap">
              <Button
                variant="contained"
                color="secondary"
                onClick={(e) => triggerLogin(e, true)}
              >
                Login
              </Button>
            </div>
          </div>
        )}
      </div>
      {isUploadingInProgress ? (
        <div className="uploadingNotificationForAdmin">
          <i className="infoIcon">
            <FaInfoCircle />
          </i>
          Uploading is in progress, please do not redirect, refresh or close the
          browser!
        </div>
      ) : (
        ""
      )}

      {previewModeOn ? (
        <div className="previewLessonBox">
          <div className="innerPreviewBox">
            <h3>Preview your Lesson videos</h3>
            <p
              className="closeModalBtn"
              onClick={(e) => closePreviewModal(e)}
            ></p>
            <div className="videosWrap">
              <div className="videoItem">
                <p className="videoLabel">Preview Video</p>
                <video
                  className="videoTag"
                  ref={previewVideoPreviewRef}
                ></video>
              </div>
              <div className="videoItem">
                <p className="videoLabel">Front View</p>
                <video className="videoTag" ref={previewVideoFrontRef}></video>
              </div>
              <div className="videoItem">
                <p className="videoLabel">Front Mirror View</p>
                <video
                  className="videoTag"
                  ref={previewVideoFrontMirrorRef}
                ></video>
              </div>
              <div className="videoItem">
                <p className="videoLabel">Back View</p>
                <video className="videoTag" ref={previewVideoBackRef}></video>
              </div>
              <div className="videoItem">
                <p className="videoLabel">Back Mirror View</p>
                <video
                  className="videoTag"
                  ref={previewVideoBackMirrorRef}
                ></video>
              </div>
              <div className="videoItem">
                <p className="videoLabel">VR-Mode View</p>
                <video className="videoTag" ref={previewVideoVRModeRef}></video>
              </div>
            </div>
            <div className="actionWrap">
              <Button
                className={`actionBtns ${btnLoadingClass}`}
                disabled={disableUploadButton ? true : false}
                variant="contained"
                color="primary"
                onClick={() => sendSelectedVdosToUpload()}
              >
                Create Lesson
              </Button>
              <Button
                className="actionBtns"
                disabled={disableUploadButton ? true : false}
                variant="outlined"
                color="secondary"
                onClick={(e) => closePreviewModal(e)}
              >
                Cancel &amp; modify
              </Button>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
      <div className="footerBox">
        &copy; 2021 Box Puppet Ent. Pvt. Ltd., All rights reserved.
      </div>
    </div>
  );
}
