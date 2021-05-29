import React from 'react';

export default function GenericInfoModal(props) {
    const { title, message, status, navigateUrl, shouldHaveAction} = props;

    function closeGenericModal(event) {
        event.stopPropagation();
        props.closeInfoModal(navigateUrl);
    }
    
    function confirmAction(event, action) {
        event.stopPropagation();
        props.confirmUserAction(action);
    }

    return (
        <div className="genericModalOverlay">
            <div className={`genericModalInner ${status}`}>
                <p 
                    className="closeModal"
                    title={`${navigateUrl ? `Close & navigate to ${navigateUrl.split('/')[1]} page` : 'Close modal'}`}
                    onClick={(e) => closeGenericModal(e)}></p>
                {
                    title ?
                    <h3>{title}</h3> : ''
                }
                {
                    message ? 
                    <p> {message} </p> : ''
                }
                {
                    navigateUrl ?
                    <a 
                        href={navigateUrl} 
                        className="navigateLink" 
                        title={`navigate to ${navigateUrl.split('/')[1]} page`}>Let's goto Profile!</a> : ''
                }
                {
                    shouldHaveAction ?
                    <div className="actionWrap">
                        <button className="btn primary-light" title="cancel and close" onClick={(e) => closeGenericModal(e)}>No</button>
                        <button className="btn primary-dark" title="yes proceed" onClick={(e) => confirmAction(e, true)}>Yes</button>
                    </div>
                    : ''
                }
            </div>
        </div>
    )
}