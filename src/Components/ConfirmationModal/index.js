import React, {useEffect, useState} from 'react';

export default function ConfirmationModal(props) {
    const {action, message, userId, videoId, videoURL} = props;
    const [commentForUser, setUserComment] = useState('');

    useEffect(() => {
        let userCommentValue = '';
        if (action === 'videoDelete') {
            userCommentValue = 'We are deleting your video as this video containing some indecent clips, which is violating our uploading videos terms and policies!'
        } else if (action === 'userDeactivate') {
            userCommentValue = 'We are temporarily De-activating your account as you have violated our Privacy policies and terms of use of our application! For more clarification please reach us on b2b@boxpuppet.com'
        }

        setUserComment(userCommentValue);
    }, []);

    function confirmYes(event) {
        event.stopPropagation();
        props.confirmationResponse(action, true, userId, videoId, commentForUser, videoURL);
    }

    function cancelRequest(event) {
        event.stopPropagation();
        props.confirmationResponse(false);
    }

    function setAdminComment(event) {
        event.stopPropagation();
        const adminComment = event.currentTarget.value;
        setUserComment(adminComment);
    }

    return (
        <div className="confirmationModalOuter">
            <div className="confirmationInner">
                <a className="closeUserModal" title="close modal" onClick={(e) => cancelRequest(e)}></a>
                <p className="messageBox">{ message }</p>
                {
                    action === 'videoDelete' ?
                    <textarea placeholder="Tell user why you are Deleting the video!" onChange={(e) => setAdminComment(e)}></textarea>
                    : action === 'userDeactivate' ?
                    <textarea placeholder="Tell user why you are De-activating his/her account!" onChange={(e) => setAdminComment(e)}></textarea>
                    : ''
                }
                <div className="actions">
                    <a className="btn primary-light" onClick={(e) => cancelRequest(e)}>No</a>
                    <a className="btn primary-dark" onClick={(e) => confirmYes(e)}>Yes</a>
                </div>
            </div>
        </div>
    )
}