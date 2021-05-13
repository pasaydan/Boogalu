import React, {useEffect, useState} from 'react';

export default function ConfirmationModal(props) {
    const {
        screen,
        action, 
        message,
        actionData, 
        userId, 
        videoId, 
        videoURL, 
        thumbnailURL, 
        videoName
    } = props;
    const [commentForUser, setUserComment] = useState('');

    useEffect(() => {
        let userCommentValue = '';
        if (action === 'videoDelete') {
            userCommentValue = `We are deleting your video: <strong>${videoName}</strong> as this video containing some indecent clips, which is violating our uploading videos terms and policies!`;
        } else if (action === 'userDeactivate') {
            userCommentValue = 'We are temporarily De-activating your account as you have violated our Privacy policies and terms of use of our application! For more clarification please reach us on b2b@boxpuppet.com'
        }

        setUserComment(userCommentValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function confirmYes(event) {
        event.stopPropagation();
        if (screen === 'subscription') {
            props.confirmationResponse(true,  actionData);
        }

        if (screen === 'users') {
            props.confirmationResponse(action, true, userId, videoId, commentForUser, videoURL, thumbnailURL, videoName);
        }
    }

    function cancelRequest(event) {
        event.stopPropagation();
        props.confirmationResponse(false);
    }

    function setAdminComment(event) {
        event.stopPropagation();
        const adminComment = `We are deleting your video: <strong>${videoName}</strong> ${event.currentTarget.value}`;
        setUserComment(adminComment);
    }

    return (
        <div className="confirmationModalOuter">
            <div className="confirmationInner">
                <p className="closeUserModal" title="close modal" onClick={(e) => cancelRequest(e)}></p>
                <p className="messageBox">{ message }</p>
                {
                    action === 'videoDelete' ?
                    <textarea placeholder="Tell user why you are Deleting the video!" onChange={(e) => setAdminComment(e)}></textarea>
                    : action === 'userDeactivate' ?
                    <textarea placeholder="Tell user why you are De-activating his/her account!" onChange={(e) => setAdminComment(e)}></textarea>
                    : ''
                }
                <div className="actions">
                    <button className="btn primary-light" onClick={(e) => cancelRequest(e)}>No</button>
                    <button className="btn primary-dark" onClick={(e) => confirmYes(e)}>Yes</button>
                </div>
            </div>
        </div>
    )
}