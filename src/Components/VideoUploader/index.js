import React, { useRef, useState } from 'react'
import Button from '@material-ui/core/Button';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import { useStoreConsumer } from '../../Providers/StateProvider';
import { uploadVideo, uploadImage } from "../../Services/Upload.service";
import { saveUploadedVideo } from "../../Services/UploadedVideo.service";
import { useHistory } from "react-router-dom";
import { THUMBNAIL_URL } from "../../Constants";
import ImageUploader from 'react-images-upload';
import { toBase64 } from "../../Services/Utils";
export default function VideoUploader() {
    const history = useHistory();
    const { state, dispatch } = useStoreConsumer();
    const loggedInUser = state.loggedInUser;
    const uploaderRef = useRef(null);
    const [SelectedVideo, setSelectedVideo] = useState({ title: "", desc: "", file: null });
    const [OpenModal, setOpenModal] = useState(false);
    const [UploadedVdoUrl, setUploadedVdoUrl] = useState(null);
    const [ThumbnailImage, setThumbnailImage] = useState(null);

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
                setOpenModal(true);
            }
            reader.onerror = error => console.error(error);
        }
    }

    const handleChange = (prop) => (event) => {
        setSelectedVideo({ ...SelectedVideo, [prop]: event.target.value });
    };

    const handleClose = () => {
        setOpenModal(false);
    }

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
                    history.push('/profile');
                })
            }
        })
        console.log(SelectedVideo);
        console.log(loggedInUser);
    }

    const onThumbnailImgSelect = (picture) => {
        setThumbnailImage(picture);
    }

    return (
        <div>
            <input id="myInput"
                type="file"
                accept="video/mp4,video/x-m4v,video/*"
                ref={uploaderRef}
                style={{ display: 'none' }}
                onChange={(e) => onChangeFile(e)}
            />

            {!SelectedVideo.file && <Button
                variant="contained" color="primary"
                onClick={() => { uploaderRef.current.click() }}
            >Upload vdo</Button>}

            {SelectedVideo.file &&
                <Modal
                    aria-labelledby="title"
                    aria-describedby="description"
                    className='competition-modal-box'
                    open={OpenModal}
                    onClose={handleClose}
                    closeAfterTransition
                    BackdropComponent={Backdrop}
                    BackdropProps={{
                        timeout: 500,
                    }}
                >
                    <Fade in={OpenModal}>
                        <div className={classes.paper}>
                            <IconButton onClick={() => { setOpenModal(false); setSelectedVideo({ title: "", desc: "", file: null }) }}>
                                <CloseIcon />
                            </IconButton>
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
                            <Button variant="contained" color="primary" onClick={() => { setOpenModal(false); setSelectedVideo({ title: "", desc: "", file: null }) }}>Cancel</Button>
                            <Button variant="contained" color="secondary" onClick={(e) => uploadSelectedVideo(e)}>Upload</Button>
                        </div>
                    </Fade>
                </Modal>}
        </div>
    )
}