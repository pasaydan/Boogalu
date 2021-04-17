import React, { useEffect, useState } from 'react';

export default function ActionToolTip(props) {
    const [isActionClick, toggleCompActions] = useState(false);

    useEffect(() => {
        document.addEventListener('click', toggleMenuAction);
    }, []);

    function toggleMenuAction(event) {
        event.stopPropagation();
        
        if (event.currentTarget === document) {
            toggleCompActions(false);
        } else {
            if (event && event.currentTarget.classList.contains('actionBtn')) {
                toggleCompActions(!isActionClick);
            } else {
                toggleCompActions(false);
            }
        }
    }

    function actionSelected(event, action) {
        props.onActionClicked(action);
    }
    
    return (
        <p className="actionLink">
            <button className="actionBtn" onClick={(e) => toggleMenuAction(e)}>
                <span></span>
            </button>
            {
                isActionClick ?
                <div className="menu">
                    <a onClick={(e) => actionSelected(e, 'inactive')}>Inactive</a>
                    <a onClick={(e) => actionSelected(e, 'remove')}>Delete</a>
                </div> : ''
            }
        </p>
    )
}