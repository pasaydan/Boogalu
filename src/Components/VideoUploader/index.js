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
// modal imports
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';

export default function VideoUploader({ selectedVdo, handleVdoUploadResponse }) {
    const history = useHistory();
    const { state, dispatch } = useStoreConsumer();
    const loggedInUser = state.loggedInUser;
    const uploaderRef = useRef(null);
    const [SelectedVideo, setSelectedVideo] = useState(selectedVdo ? selectedVdo : { title: "", desc: "", file: null });
    const [UploadedVdoUrl, setUploadedVdoUrl] = useState(null);
    const [ThumbnailImage, setThumbnailImage] = useState(null);
    const [openVdoUploaderModal, setOpenVdoUploaderModal] = useState(true);

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
        if (file) {
            setSelectedVideo({ ...SelectedVideo, file: null });
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                setSelectedVideo({ ...SelectedVideo, file: reader.result });
            }
            reader.onerror = error => console.error(error);
        }
    }

    const handleChange = (prop) => (event) => {
        setSelectedVideo({ ...SelectedVideo, [prop]: event.target.value });
    };

    async function uploadSelectedVideo() {
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

        uploadVideo(SelectedVideo.file).subscribe((response) => {
            if (response.donePercentage) {
                console.log('Upload is ' + response.donePercentage + '% done');
            }
            if (response.downloadURL && !UploadedVdoUrl) {
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
        setOpenVdoUploaderModal(false);

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
                    <div className={classes.paper}>
                        <IconButton onClick={() => closeUploaderModal(false)}>
                            <CloseIcon />
                        </IconButton>
                        <div>
                            <input id="myInput"
                                type="file"
                                accept="video/mp4,video/x-m4v,video/*"
                                ref={uploaderRef}
                                style={{ display: 'none' }}
                                onChange={(e) => onChangeFile(e)}
                            />

                            {!SelectedVideo.file ?
                                <div>
                                    <div>Upload your favourite video !</div>
                                    <Button
                                        variant="contained" color="primary"
                                        onClick={() => { uploaderRef.current.click() }}>Upload Video</Button>
                                </div> :
                                <div >
                                    <video width="400" controls>
                                        <source src={SelectedVideo.file} />
                                    </video>
                                    <div className="input-wrap">
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
                                    <Button
                                        variant="contained" color="primary"
                                        onClick={() => { uploaderRef.current.click() }}
                                    >Change vdo</Button>
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
                                </div>}
                        </div>
                    </div>
                </Fade>
            </Modal>
        </div>
    )
}