import React, { useState, useEffect } from 'react'
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import FavoriteBorder from '@material-ui/icons/FavoriteBorder';
import Favorite from '@material-ui/icons/Favorite';

function Comments({ handleClose, videoObj, handleLikes }) {

    const [openDetailsModal, setOpenDetailsModal] = useState(true);

    return (
        <div className="subscription-modal-wrap">
            <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                className='subscription-modal-box'
                open={openDetailsModal}
                onClose={() => handleClose(false)}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                }}
            >
                <Fade in={openDetailsModal}>
                    <div className="subscription-inner-modal">
                        <IconButton className="close-modal-btn" onClick={() => handleClose(false)}>
                            <CloseIcon />
                        </IconButton>
                        <h3>Comments</h3>

                        {!videoObj.isLiked && <FavoriteBorder onClick={() => handleLikes(videoObj, 'liked')} />}
                        {videoObj.isLiked && <Favorite onClick={() => handleLikes(videoObj, 'unliked')} />}
                        {videoObj.likes && videoObj.likes.length > 0 && <div className="likes-count">{videoObj.likes.length} Likes</div>}
                        <div>{videoObj.title}</div>

                    </div>
                </Fade>
            </Modal>
        </div>
    )
}

export default Comments
