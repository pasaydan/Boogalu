import React, { useRef, useState, useEffect } from 'react'
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { useStoreConsumer } from '../../Providers/StateProvider';
import { uploadVideo, uploadImage } from "../../Services/Upload.service";
import { saveUploadedVideo } from "../../Services/UploadedVideo.service";
import { useHistory } from "react-router-dom";
import { THUMBNAIL_URL } from "../../Constants";
import ImageUploader from 'react-images-upload';
import { disableLoginFlow } from "../../Actions/LoginFlow";
import { FaCloudUploadAlt } from 'react-icons/fa';
import { setDataRefetchModuleName } from "../../Actions/Utility";
import { NOTIFICATION_ERROR, ADMIN_EMAIL_STAGING } from "../../Constants";
import { displayNotification } from "../../Actions/Notification";
import { sendEmail } from "../../Services/Email.service";
// modal imports
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import { enableLoading, disableLoading } from "../../Actions/Loader";
//circular progress
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

export default function VideoUploader({ selectedVdo, handleVdoUploadResponse }) {
    const history = useHistory();
    const { state, dispatch } = useStoreConsumer();
    const loggedInUser = state.loggedInUser;
    const uploaderRef = useRef(null);
    const [SelectedVideo, setSelectedVideo] = useState(selectedVdo ? selectedVdo : { title: "", desc: "", file: null });
    const [UploadedVdoUrl, setUploadedVdoUrl] = useState(null);
    const [ThumbnailImage, setThumbnailImage] = useState(null);
    const [openVdoUploaderModal, setOpenVdoUploaderModal] = useState(true);
    const [progress, setProgress] = useState(0);
    const [ShowVdoUploadProgress, setShowVdoUploadProgress] = useState(false);

    // useEffect(() => {
    //     const timer = setInterval(() => {
    //         setProgress((prevProgress) => (prevProgress >= 100 ? 0 : prevProgress + 10));
    //     }, 800);
    //     return () => {
    //         clearInterval(timer);
    //     };
    // }, []);

    useEffect(() => {
        dispatch(disableLoginFlow());
    }, [])

    const useStyles = makeStyles((theme) => ({
        modal: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        paper: {
            backgroundColor: theme.palette.background.paper,
            border: '2px solid #000',
            boxShadow: theme.shadows[5],
            padding: theme.spacing(2, 4, 3),
        },
    }));
    const classes = useStyles();

    async function onChangeFile(event) {
        event.stopPropagation();
        event.preventDefault();
        var file = event.target.files[0];
        console.log(file);
        // 1MB in Bytes is 1,048,576 so you can multiply it by the limit you need.
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
                }
                reader.onerror = error => console.error(error);
            }
        }
    }

    const handleChange = (prop) => (event) => {
        setSelectedVideo({ ...SelectedVideo, [prop]: event.target.value });
    };

    async function uploadSelectedVideo() {
        if (!(SelectedVideo.title && SelectedVideo.desc)) {
            dispatch(displayNotification({
                msg: "Title and description are mandatory!",
                type: NOTIFICATION_ERROR,
                time: 3000
            }))
            return
        }
        var thumbnailImage = THUMBNAIL_URL;
        if (ThumbnailImage && ThumbnailImage[0]) {
            const reader = new FileReader();
            reader.readAsDataURL(ThumbnailImage[0]);
            reader.onload = () => {
                uploadImage(reader.result, 'thumbnail', 'small').subscribe((downloadableUrl) => {
                    thumbnailImage = downloadableUrl;
                })
            }
            reader.onerror = error => console.error(error);
        }

        const sendEmailToAdmin = (vdoUrl) => {
            let emailBody = `<div>
            <h6 style="font-size: 17px;margin-bottom: 26px;">New Video Uploaded</h6>
            <h4>User details -</h4>
            <h6>${loggedInUser.name}</h6>
            <h6>${loggedInUser.email}</h6>
            <h6>${loggedInUser.phone}</h6>
            <a href=${vdoUrl} >Clik here to check uploaded video</a>
            </div>`;
            let payload = {
                mailTo: ADMIN_EMAIL_STAGING,
                title: 'New Video Uploaded',
                content: emailBody
            }
            sendEmail(payload).subscribe((res) => {
                if (!('error' in res)) {
                    console.log('Admin Email Send Successfully.');
                } else console.log('Admin Email Send Failed.');
            })
        }

        const sendEmailToUser = (vdoUrl) => {
            let emailBody = `<div>
            <p>Hi ${loggedInUser.name}, you have recently uploaded a video, ${SelectedVideo.title}</p>. 
            <a href=${vdoUrl} >Clik here to check uploaded video</a>
            </div>`;
            let payload = {
                mailTo: loggedInUser.email,
                title: 'Video Uploaded',
                content: emailBody
            }
            sendEmail(payload).subscribe((res) => {
                if (!('error' in res)) {
                    console.log('User Email Send Successfully.');
                } else console.log('User Email Send Failed.');
            })
        }

        uploadVideo(SelectedVideo.file).subscribe((response) => {
            dispatch(enableLoading());
            setShowVdoUploadProgress(true);
            if (response.donePercentage) {
                setProgress(response.donePercentage);
                console.log('Upload is ' + response.donePercentage + '% done');
            }
            if (response.downloadURL && !UploadedVdoUrl) {
                sendEmailToAdmin(response.downloadURL);
                sendEmailToUser(response.downloadURL);
                // dispatch(enableLoading());
                setShowVdoUploadProgress(false);
                setUploadedVdoUrl(response.downloadURL);
                const uploadObj = {
                    title: SelectedVideo.title,
                    desc: SelectedVideo.desc,
                    url: response.downloadURL,
                    userId: loggedInUser.key,
                    thumbnail: thumbnailImage
                }
                saveUploadedVideo(uploadObj).subscribe((response) => {
                    console.log("vedio data saved to db", response);
                    dispatch(disableLoading());
                    const pathName = history?.location?.pathname.split('/')[1];
                    pathName.includes('profile') && dispatch(setDataRefetchModuleName('user-uploaded-video'));
                    closeUploaderModal();
                    if (state.currentLoginFlow == 'competition-uploadvdo') handleVdoUploadResponse(3);
                    else history.push('/profile');
                })
            }
        })
        console.log(SelectedVideo);
        console.log(loggedInUser);
    }

    const onThumbnailImgSelect = (picture) => {
        setThumbnailImage(picture);
    }

    const closeUploaderModal = () => {
        const pathName = history?.location?.pathname.split('/')[1];
        if (pathName.includes('register') || pathName.includes('login')) {
            history.push('/profile');
        }
        // else if (state.currentLoginFlow == 'competition-uploadvdo') history.push('/competition');
        // handleClose();
        handleVdoUploadResponse();
        setOpenVdoUploaderModal(false);

    }

    function CircularProgressWithLabel(props) {
        return (
            <Box position="relative" display="inline-flex">
                <CircularProgress variant="determinate" {...props} />
                <Box
                    top={0}
                    left={0}
                    bottom={0}
                    right={0}
                    position="absolute"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                >
                    <Typography variant="caption" component="div" color="textSecondary">{`${Math.round(
                        props.value,
                    )}%`}</Typography>
                </Box>
            </Box>
        );
    }

    return (
        <div>
            <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                className='competition-modal-box'
                open={openVdoUploaderModal}
                onClose={() => closeUploaderModal(false)}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                }}
            >
                <Fade in={openVdoUploaderModal}>
                    <div className="video-uploader-inner-modal">
                        <IconButton className="close-modal-btn" onClick={() => closeUploaderModal(false)}>
                            <CloseIcon />
                        </IconButton>
                        <h3>Upload your dance performance video!</h3>
                        <div className={`uploader-wrap ${SelectedVideo.file ? 'selected-file' : ''}`}>
                            {
                                !SelectedVideo.file ?
                                    <div className="upload-input-wrap">
                                        <i className="upload-icon"><FaCloudUploadAlt /></i>
                                        <input id="myInput"
                                            type="file"
                                            accept="video/mp4,video/x-m4v,video/*"
                                            ref={uploaderRef}
                                            onChange={(e) => onChangeFile(e)}
                                        />
                                    </div> : ''
                            }

                            {!SelectedVideo.file ?
                                <div className="upload-btn-file">
                                    <Button
                                        variant="contained" color="primary"
                                        onClick={() => { uploaderRef.current.click() }}>Upload Video</Button>
                                </div> :
                                <div className="video-information-wrap">
                                    <video width="400" controls>
                                        <source src={SelectedVideo.file} />
                                    </video>
                                    <div className="change-video-btn">
                                        <Button
                                            variant="contained" color="primary"
                                            onClick={() => { uploaderRef.current.click() }}
                                        >Change vdo</Button>
                                    </div>
                                    <div className="input-form-wrap">
                                        <div className="input-wrap image-uploader-wrap">
                                            <ImageUploader
                                                withIcon={true}
                                                buttonText='Select image'
                                                onChange={onThumbnailImgSelect}
                                                imgExtension={['.jpg', '.gif', '.png', '.gif', '.svg']}
                                                maxFileSize={5242880}
                                                accept="image/*"
                                                withPreview={true}
                                                singleImage={true}
                                                label="Select thumbnail image"
                                            />
                                        </div>
                                        <div className="text-form-wrapper">
                                            <div className="input-field-wrap">
                                                <TextField className="input-field"
                                                    required
                                                    id="outlined-required-title"
                                                    label="Video title"
                                                    onChange={handleChange('title')}
                                                    value={SelectedVideo.title}
                                                    variant="outlined"
                                                    autoComplete="off"
                                                />
                                            </div>
                                            <div className="input-field-wrap">
                                                <TextField className="input-field"
                                                    required
                                                    id="outlined-required-desc"
                                                    label="Video description"
                                                    onChange={handleChange('desc')}
                                                    value={SelectedVideo.desc}
                                                    variant="outlined"
                                                    autoComplete="off"
                                                />
                                            </div>
                                            <Button variant="contained" color="secondary" onClick={(e) => uploadSelectedVideo(e)}>Upload</Button>
                                        </div>
                                    </div>
                                </div>}
                        </div>
                    </div>
                </Fade>
            </Modal>
            {ShowVdoUploadProgress && <div className="progress-wrap">
                <div className="progress-body">
                    <CircularProgressWithLabel value={progress} />
                </div>
            </div>}
        </div>
    )
}