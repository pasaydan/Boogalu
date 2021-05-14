import React, { useState, useEffect } from 'react'
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import FavoriteBorder from '@material-ui/icons/FavoriteBorder';
import SendOutlined from '@material-ui/icons/SendOutlined';
import Favorite from '@material-ui/icons/Favorite';
import TextField from '@material-ui/core/TextField';
import Vedio from "../Vedio/Video";
import ProfileImage from "../ProfileImage";
import { useHistory } from "react-router-dom";
import { Link } from '@material-ui/core';


function Comments({ handleClose, videoObj, handleLikes, handleComments, loggedInUser, followToggle, BtnText, clickedUser }) {
    const history = useHistory();
    const followMessage = "You need to follow the user to view their Profile";
    const [followButtonText, setFollowButtonText] = useState(clickedUser && clickedUser.actionBtnText ? clickedUser.actionBtnText : 'Follow');
    const [messageForUser, setMessageForUser] = useState(followMessage);
    // eslint-disable-next-line no-unused-vars
    const [openDetailsModal, setOpenDetailsModal] = useState(true);
    const [commentText, setCommentText] = useState('');
    // eslint-disable-next-line no-unused-vars
    const [userDetails, setUserDetails] = useState();
    const [privacyToggle, setPrivacyToggle] = useState(false);
    const { privacy } = videoObj || 'public';

    const handleCommentClick = () => {
        if (commentText !== '') {
            handleComments(commentText)
            setCommentText('')
        }
    }

    const handleFollowBtnClick = (event, toFollow, followBy) => {
        event.preventDefault();
        const action = event.currentTarget.dataset.action.toLowerCase();
        followToggle(toFollow, followBy, action, clickedUser);
    }

    const redirectToProfile = (path) => {
        console.log("path", path);
        history.push(path);
    }

    useEffect(() => {
        if (loggedInUser && loggedInUser.key === videoObj.userId) {
            setPrivacyToggle(true);
        }
        if ((privacy === ('Public' || 'public') || videoObj.following) && loggedInUser.key !== videoObj.userId) {
            setPrivacyToggle(true);
        }
        if (videoObj.followRequested) {
            setFollowButtonText('Requested');
            setMessageForUser(`We have notified ${videoObj.username}, let them accept your Follow Request`);
        }
        if (clickedUser && clickedUser.iRequestedFollow && clickedUser.actionBtnText) {
            setFollowButtonText(clickedUser.actionBtnText);
            setMessageForUser(`We have notified ${videoObj.username}, let them accept your Follow Request`);
        }
        if (clickedUser && clickedUser.imFollowing && clickedUser.actionBtnText) {
            setFollowButtonText(clickedUser.actionBtnText);
            setPrivacyToggle(true);
        }
    }, [])


    useEffect(() => {
        if (clickedUser && (clickedUser.iRequestedFollow || clickedUser.imFollowing) && clickedUser.actionBtnText) {
            setFollowButtonText(clickedUser.actionBtnText);
        }
    }, [clickedUser])

    return (
        <div className="subscription-modal-wrap">
            <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                className='subscription-modal-box feeds-comment-modal'
                open={openDetailsModal}
                onClose={() => handleClose(false)}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                }}
                style={{display:'flex',alignItems:'center',justifyContent:'center'}}
            >
                <Fade in={openDetailsModal}>
                    <div className="subscription-inner-modal comment-modal">
                        <IconButton className="close-modal-btn" onClick={() => handleClose(false)}>
                            <CloseIcon />
                        </IconButton>
                        {privacyToggle ? 
                            <div>
                                <div key={videoObj.key} className="feed-card">
                                    <div className="username">
                                        <ProfileImage src={videoObj.profileImage} />
                                        <span>
                                            {
                                                loggedInUser.key !== videoObj.userId
                                                    ?
                                                        <Link onClick={(e) => redirectToProfile(`/profile/${window.btoa(videoObj.userEmail)}`)}>{videoObj.username}</Link>
                                                    :   <Link onClick={(e) => redirectToProfile(`/profile/`)}>{videoObj.username}</Link>
                                            }
                                        </span>
                                        {
                                            loggedInUser && loggedInUser.key !== videoObj.userId && !videoObj.following
                                                ?
                                                    <Link 
                                                        onClick={(event) => handleFollowBtnClick(event, videoObj.userId, loggedInUser.key)} 
                                                        className="btn primary-light followBtn" 
                                                        data-action={followButtonText}>{followButtonText}</Link>
                                                :   
                                                    loggedInUser.key === videoObj.userId
                                                        ? 
                                                            ''
                                                        : 
                                                            <span className="btn primary-light followBtn">{followButtonText}</span>
                                            }
                                    </div>
                                    <div>
                                        <Vedio vdoObj={videoObj} />
                                    </div>
                                    <div className="video-title-like-wrap">
                                        <div className="title">{videoObj.title}</div>
                                        <div className="like-comment">
                                            {videoObj.likes && videoObj.likes.length > 0 && <div className="likes-count">{videoObj.likes.length} Likes</div>}
                                            {!videoObj.isLiked && <FavoriteBorder onClick={() => handleLikes(videoObj, 'liked')} />}
                                            {videoObj.isLiked && <Favorite onClick={() => handleLikes(videoObj, 'unliked')} />}
                                        </div>

                                    </div>
                                </div>

                                {videoObj.comments && videoObj.comments.length > 0 && <div className="comments-count">{videoObj.comments.length} Comments</div>}

                                <div className="comment-outer-wrap">
                                    {videoObj.comments && videoObj.comments.map((comment, index) => {
                                        return <div className="comment-wrap" key={index}>
                                            <ProfileImage src={comment.profileImage} />
                                            <span className="username">{comment.username}</span>
                                            <span>{comment.value}</span>
                                        </div>
                                    })}
                                </div>

                                <div className="commnet-input-wrap">
                                    <TextField id="standard-basic" label="Add Comments" value={commentText} onChange={(e) => setCommentText(e.target.value)} />
                                    <SendOutlined onClick={() => handleCommentClick(videoObj, 'liked')} />
                                </div>
                            </div>
                            :
                            <div>
                                <div key={videoObj.key} className="feed-card">
                                    <div className="username">
                                        <ProfileImage src={videoObj && videoObj.profileImage || clickedUser.profileImage} />
                                        <span>{videoObj && videoObj.username || clickedUser.username}</span>
                                        {
                                            loggedInUser && loggedInUser.key !== (videoObj.userId || clickedUser.key) && 
                                            <Link 
                                                onClick={(event) => handleFollowBtnClick(event, (videoObj.userId || clickedUser.key), loggedInUser.key)} 
                                                className="btn primary-light followBtn" 
                                                data-action={followButtonText}>
                                                    {followButtonText}
                                            </Link>
                                        }
                                    </div>
                                    <p>{messageForUser}</p>
                                </div>
                            </div>
                        }
                    </div>
                </Fade>
            </Modal>
        </div>
    )
}

export default Comments
