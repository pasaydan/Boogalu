import React, { useState, useEffect, useRef } from 'react'
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import CloseIcon from '@material-ui/icons/Close';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import { FaCloudUploadAlt } from 'react-icons/fa';
import { useHistory } from "react-router-dom";
import { useStoreConsumer } from '../../Providers/StateProvider';
import { THUMBNAIL_URL } from '../../Constants';
import "./CompetitionsDetails.scss";
import EnrollCompetition from "../EnrollCompetition";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { setActiveCompetition } from "../../Actions/Competition";
import { enableLoginFlow } from "../../Actions/LoginFlow";
import { getUploadedVideosByUserId } from "../../Services/UploadedVideo.service";
import { formatDate, formatTime } from "../../Services/Utils";
import VideoUploader from "../VideoUploader";
import { enableLoading, disableLoading } from "../../Actions/Loader";
import { NOTIFICATION_ERROR } from "../../Constants";
import { displayNotification } from "../../Actions/Notification";
//activestep 1 === Competition details
//activestep 2 === User submitted competition details if already enrolled
//activestep 3 === Video selection
//activestep 4 === final age group and video submission for competition

export default function CompetitionsDetails({ open, handleClose, initialStep }) {

    const { state, dispatch } = useStoreConsumer();
    const uploaderRef = useRef(null);
    const history = useHistory();
    const competitionDetails = state.activeCompetition;
    console.log(competitionDetails);
    const loggedInUser = state.loggedInUser;
    const [userUploadedVdos, setUserUploadedVideoList] = useState([]);
    const tncRef = useRef();
    const [TnC, setTnC] = useState(false);
    const [isTncAccepted, tncAcceptedValue] = useState(false);
    const [ActiveStep, setActiveStep] = useState(initialStep || 1);
    const [isVideoSelected, toggleVideoSelect] = useState(false);
    const [selectedVideoData, setVideoData] = useState(null);
    const [disableSubmitVdoButton, setDisableSubmitVdoButton] = useState(false);
    const [VdoUploadDateLimit, setVdoUploadDateLimit] = useState(null)
    const [SelectedVideo, setSelectedVideo] = useState({ title: "", desc: "", file: null, enrolledCompetition: null });

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        }
    }, []);

    useEffect(() => {
        if (competitionDetails) {
            let vdoUploadUpto = new Date(competitionDetails.startAt);
            new Date(vdoUploadUpto.setDate(vdoUploadUpto.getDate() + 30));
            let displayDate = formatDate(vdoUploadUpto, 3) + " " + formatTime(vdoUploadUpto);
            if (loggedInUser.key && competitionDetails?.isUserEnrolled) {
                tncAcceptedValue(true);
            }
            setVdoUploadDateLimit(displayDate);   
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [competitionDetails]);

    useEffect(() => {
        (loggedInUser.email && loggedInUser.phone && ActiveStep === 3 && userUploadedVdos.length === 0) && getUploadedVideosByUserId(loggedInUser.key).subscribe((vdoList) => {
            if (vdoList && vdoList.length) {
                vdoList.forEach((uploadedVdo) => {
                    if (competitionDetails.isUserEnrolled) {
                        if (uploadedVdo.key === competitionDetails.userSubmitedDetails.vdo.key) {
                            uploadedVdo.isSelected = true;
                            let updatedCompetition = competitionDetails;
                            updatedCompetition.selectedVideo = uploadedVdo;
                            dispatch(setActiveCompetition(updatedCompetition));
                            setDisableSubmitVdoButton(true);
                        }
                    } else if (state.currentLoginFlow === 'profile-competition' && state.activeVideoForCompetition === uploadedVdo.key) {
                        // if user come from profile page by clicking upload for competition
                        uploadedVdo.isSelected = true;
                        let updatedCompetition = competitionDetails;
                        updatedCompetition.selectedVideo = uploadedVdo;
                        dispatch(setActiveCompetition(updatedCompetition));
                        setVideoData(uploadedVdo);
                        toggleVideoSelect(false);
                    }
                })
                setUserUploadedVideoList(vdoList)
            } else {
                // if user not uploaded any video then set upload new tab active
                setActiveTabInVdoSelection(2);
            }
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ActiveStep]);

    const setActiveTabInVdoSelection = (tab) => {
        const tabsLinks = Array.from(document.querySelectorAll('.tab-links'));
        const tabsBoxes = Array.from(document.querySelectorAll('.js-inner-tab-box'));
        let currentTab = tab === 1 ? 'tab-1' : 'tab-2'
        tabsBoxes.forEach(item => {
            if (item.getAttribute('id') === currentTab) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        tabsLinks.forEach(item => {
            if (item?.dataset?.id === currentTab) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    function handleClickOutside(event) {
        if (tncRef && tncRef.current && !tncRef.current.contains(event.target)) {
            setTnC(false);
        }
    }

    const selectVdo = (e, vdo) => {
        e.preventDefault();
        e.stopPropagation();
        if (vdo && vdo?.key && vdo?.key.length) {
            toggleVideoSelect(false);
            if (vdo?.enrolledCompetition !== competitionDetails.key) {
                vdo.enrolledCompetition = competitionDetails.key;
            }
            setVideoData(vdo);
        }
        if (competitionDetails.isUserEnrolled && competitionDetails.userSubmitedDetails.vdo.key === vdo.key) {
            setDisableSubmitVdoButton(true);
            let updatedCompetition = competitionDetails;
            delete updatedCompetition.selectedVideo;
            dispatch(setActiveCompetition(updatedCompetition));
        }
        else setDisableSubmitVdoButton(false);
        let updatedVdos = userUploadedVdos;
        updatedVdos.forEach((item) => {
            if (item.key === vdo.key) {
                item.isSelected = true;
                let updatedCompetition = competitionDetails;
                updatedCompetition.selectedVideo = item;
                dispatch(setActiveCompetition(updatedCompetition));
            }
            else item.isSelected = false;
        })
        setUserUploadedVideoList([...updatedVdos]);
    }

    function toggleTabination(event) {
        event.stopPropagation();

        const getCurrentData = event.target.getAttribute('data-id');

        const tabsLinks = Array.from(document.querySelectorAll('.tab-links'));
        const tabsBoxes = Array.from(document.querySelectorAll('.js-inner-tab-box'));

        tabsLinks.forEach(item => {
            item.classList.remove('active');
        });
        event.target.classList.add('active');
        tabsBoxes.forEach(item => {
            if (item.getAttribute('id') === getCurrentData) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    const proceedForLogin = () => {
        handleClose();
        dispatch(enableLoginFlow('competition'));
        history.push({
            pathname: '/login',
            state: null
        })
    }

    async function onChangeFile(event) {
        event.preventDefault();
        var file = event.target.files[0];
        console.log(file);
        if (file) {
            if (file.size > 52428800) {
                alert("File is too big!");
                dispatch(displayNotification({
                    msg: "File is too big!",
                    type: NOTIFICATION_ERROR,
                    time: 3000
                }))
                setSelectedVideo({ ...SelectedVideo, file: null });
                uploaderRef.current.click();
            } else {
                setSelectedVideo({ ...SelectedVideo, file: null });
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                    setSelectedVideo({ ...SelectedVideo, file: reader.result });
                    dispatch(enableLoginFlow('competition-uploadvdo'));
                    // handleClose();
                    // open = false;
                }
                reader.onerror = error => console.error(error);
            }
        }
    }

    const handleVdoUploadResponse = (value) => {
        if (value) {
            dispatch(enableLoading());
            getUploadedVideosByUserId(loggedInUser.key).subscribe((vdoList) => {
                if (vdoList) {
                    setActiveTabInVdoSelection(1);
                    vdoList.forEach((uploadedVdo) => {
                        if (competitionDetails.isUserEnrolled) {
                            if (uploadedVdo.key === competitionDetails.userSubmitedDetails.vdo.key) {
                                uploadedVdo.isSelected = true;
                                let updatedCompetition = competitionDetails;
                                updatedCompetition.selectedVideo = uploadedVdo;
                                dispatch(setActiveCompetition(updatedCompetition));
                                setDisableSubmitVdoButton(true);
                            }
                        }
                    })
                    dispatch(disableLoading());
                    setUserUploadedVideoList(vdoList)
                }
            });
        }
    }

    function acceptTnC(event) {
        const isTncChecked = event.target.checked;
        tncAcceptedValue(isTncChecked);
    }

    function setActiveVideoActiveStep(step) {
        if (selectedVideoData?.key && selectedVideoData?.key.length) {
            toggleVideoSelect(false);
            setActiveStep(step);
        } else {
            toggleVideoSelect(true);
        }
    }

    return (
        <div>
            <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                className='competition-modal-box'
                open={open}
                onClose={handleClose}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                }}
            >
                <Fade in={open}>
                    <div className="outer-modal-wrap">
                        {<div className="inner-modal-wrap">
                            {(ActiveStep === 1 || ActiveStep === 2) && <IconButton className="close-modal-btn" onClick={() => { handleClose(); (state.activeCompetition && !state.currentLoginFlow) && dispatch(setActiveCompetition(null)) }}>
                                <CloseIcon />
                            </IconButton>}
                            {(ActiveStep === 3 || ActiveStep === 4) && <IconButton className="close-modal-btn back-step-btn" onClick={() => setActiveStep(ActiveStep - 1)}>
                                <ArrowBackIcon />
                            </IconButton>}
                            <h2 id="title">{competitionDetails.name}</h2>
                            {(ActiveStep === 1 || ActiveStep === 2) && <div>
                                <div className="image-contentWrap">
                                    <div className="image-wrap">
                                        <img src={competitionDetails.img} alt={competitionDetails.name} />
                                    </div>
                                    <div className="about-competition-wrap">
                                        <div className="sub-titles">About Competition</div>
                                        <p id="description">{competitionDetails.desc}</p>

                                        <div className="sub-titles">Age Category</div>
                                        <ul>
                                            <li>Age 4 to 13 years</li>
                                            <li>Age 14 to 17 years</li>
                                            <li>Age 18 and above</li>
                                        </ul>

                                        <div className="sub-titles" id="fees">
                                            Fees: <span>{competitionDetails.fee}</span>
                                        </div>

                                        <div className="start-at sub-titles">
                                            Start At: <span>{competitionDetails.startingDate}</span>
                                        </div>
                                        <div className="end-at sub-titles">
                                            End At: <span>{competitionDetails.endingDate}</span>
                                        </div>

                                        {competitionDetails && competitionDetails.isUserEnrolled ?
                                            <div className="sub-titles">
                                                You can change/modify video till
                                            <span>{VdoUploadDateLimit}</span></div> :
                                            <div className="sub-titles">
                                                Upload video till <span>{VdoUploadDateLimit}</span></div>}

                                        <div className="sub-titles">Winners and Prizes Rule</div>
                                        <ul>
                                            <li>Top {competitionDetails.prices.length} Winner From Each Category Get Award.</li>
                                            <li>There will be a three category as mention above.</li>
                                            <li>Winner will be based on best performance.</li>
                                        </ul>

                                        <ul className="prices">
                                            {
                                                competitionDetails.prices && competitionDetails.prices.length &&
                                                competitionDetails.prices.map( (item, index) => {
                                                    if (item.key) {
                                                        return (
                                                            <li className="sub-titles price-details" key={item.key}>
                                                                {item.name} : <span>{item.value}</span>
                                                            </li>                
                                                        )
                                                    } else {
                                                        return (
                                                            <li className="sub-titles price-details" key={`price-item-${index}`}>
                                                                {`${index + 1} ${ index === 0 ? 'st' : index === 1 ? 'nd' : 'rd'}`} : <span>{item}</span>
                                                            </li>
                                                        )
                                                    }
                                                })
                                            }
                                        </ul>

                                        <div className="sub-titles">Submission And Result</div>
                                        <ul>
                                            <li>You Have to submit Your video till 15th June</li>
                                            <li>Result will be declared on 16th June At 4 Pm On</li>
                                            <li>Winner will be based on best performance.</li>
                                        </ul>
                                        <h4 className="before-submit-message">Time To Express Your Talent on Our Platform during this Lockdown</h4>
                                    </div>
                                </div>
                                {
                                    competitionDetails.type &&  competitionDetails.type !== 'upcoming' ?
                                    <div className="action-wrap">
                                    <div className="terms-button" ref={tncRef} onClick={() => setTnC((TnC ? false : true))}>
                                        <input type="checkbox"
                                            checked={isTncAccepted}
                                            title="accept terms and condition"
                                            onChange={(e) => console.log('event: ', isTncAccepted)} 
                                            onClick={(e) => acceptTnC(e)} />
                                        Terms &amp; Conditions
                                    {TnC && <div className={`tool-tip-wrap ${loggedInUser.username ? 'loggedInToolTip' : ''}`}>
                                            <div>You may not be able to attend the live session if you are late.</div>
                                            <div>You may face interruptions during the course of the live stream due to internet connectivity issues.</div>
                                            <div>Show details and the artist lineup are subject to change as per the artist’s discretion.</div>
                                            <div> No refunds on purchased tickets are possible, even in case of any rescheduling.</div>
                                        </div>}
                                    </div>
                                    {/* check for user logged in or not */}
                                    {loggedInUser.email && loggedInUser.username ?
                                        <div>
                                            {!competitionDetails?.isUserEnrolled && <Button variant="contained"
                                                disabled={!isTncAccepted}
                                                color="primary"
                                                onClick={() => setActiveStep(3)}
                                            >Select Video</Button>}
                                        </div> :
                                        <div>
                                            {/* <div>To upload video you need to login first</div> */}
                                            <Button variant="contained" color="primary" onClick={() => proceedForLogin()}>Login</Button>
                                        </div>
                                    }
                                    {loggedInUser.key && competitionDetails?.isUserEnrolled && <div className="change-video-wrap">
                                        <div >
                                            Submitted details:
                                        {/* <video width="400" controls>
                                            <source src={competitionDetails.userSubmitedDetails.vdo.url} />
                                        </video> */}
                                            <Button variant="contained" color="primary" onClick={() => setActiveStep(3)}>Change Video</Button>
                                        </div>
                                    </div>}
                                </div>
                                : '' 
                                }
                            </div>}
                            {ActiveStep === 3 && <div className="video-submit-section">
                                <div className="lessons-vdo-wrap">
                                    <div className="tabination-wrap">
                                        <div className="tab-btn-section">
                                            <button className="tab-links active" data-id="tab-1" onClick={e => toggleTabination(e)}>My video list</button>
                                            <button className="tab-links" data-id="tab-2" onClick={e => toggleTabination(e)}>Upload new</button>
                                        </div>
                                        <div className="tab-content-wrap">
                                            <div id="tab-1" className="inner-box js-inner-tab-box list-box active">
                                                {userUploadedVdos.length !== 0 && userUploadedVdos.map((item, index) => {
                                                    return <div className={item.isSelected ? 'vdo-outer selected-vdo' : 'vdo-outer'} key={index} onClick={(e) => selectVdo(e, item)}>
                                                        <div className="vdo-wrap" >
                                                            <img src={item.thumbnail ? item.thumbnail : THUMBNAIL_URL} alt="video-url" />
                                                        </div>
                                                        <div className="video-title">{item.title}</div>
                                                    </div>
                                                })}
                                            </div>
                                            <div id="tab-2" className="inner-box js-inner-tab-box new-upload-box">
                                                <div className="input-upload-wrap">
                                                    <input
                                                        accept="video/mp4,video/x-m4v,video/*"
                                                        ref={uploaderRef}
                                                        onChange={(e) => onChangeFile(e)}
                                                        type="file" id="video-upload" title="upload video for competition" />
                                                    <i className="upload-icon"><FaCloudUploadAlt /></i>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {!disableSubmitVdoButton && <Button variant="contained" color="primary" onClick={() => setActiveVideoActiveStep(4)}>Upload</Button>}
                                {
                                    isVideoSelected ?
                                        <p className="error_message">Please select a video from top list or upload a new</p> : ''
                                }
                            </div>}

                            {ActiveStep === 4 && <div>
                                <EnrollCompetition handleClose={(e) => handleClose(e)} changeSelectedVdo={() => setActiveStep(3)} />
                            </div>}
                            {SelectedVideo?.file && <VideoUploader 
                                selectedVdo={SelectedVideo}
                                competitionKey={competitionDetails.key} 
                                handleVdoUploadResponse={(e) => handleVdoUploadResponse(e)} />}
                            {
                                competitionDetails.type && competitionDetails.type === 'upcoming' ?
                                <span className="upcomingEventMessage">Upcoming Event, we'll notify you once active!</span>
                                : ''
                            }
                        </div>}
                    </div>
                </Fade>
            </Modal>
        </div>
    )
}