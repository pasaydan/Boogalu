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
import * as $ from 'jquery';
import { Button, Link } from '@material-ui/core';


function Comments({ handleClose, videoObj, handleLikes, handleComments, loggedInUser }) {

    const [openDetailsModal, setOpenDetailsModal] = useState(true);
    const [commentText, setCommentText] = useState('');


    const handleCommentClick = () => {
        if (commentText != '') {
            handleComments(commentText)
            setCommentText('')
        }
    }
    const handleFollowToggle = () => {

    }

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
            >
                <Fade in={openDetailsModal}>
                    <div className="subscription-inner-modal comment-modal">
                        <IconButton className="close-modal-btn" onClick={() => handleClose(false)}>
                            <CloseIcon />
                        </IconButton>

                        <div key={videoObj.key} className="feed-card">
                            <div className="username">
                                <ProfileImage src={videoObj.profileImage} />
                                <span>{videoObj.username}</span>
                                {loggedInUser && loggedInUser.key !== videoObj.userId && <Link onClick={handleFollowToggle} className="followBtn">Follow</Link>}
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
                </Fade>
            </Modal>
        </div>
    )
}

export default Comments
