import React, { useState, useEffect } from 'react'
import { useStoreConsumer } from '../../Providers/StateProvider';
import { removeNotification } from "../../Actions/Notification";
export default function Notification() {

    const { state, dispatch } = useStoreConsumer();
    const [ShowNotification, setShowNotification] = useState(true);
    const [ActiveNotification, setActiveNotification] = useState(null);

    useEffect(() => {
        if (state.notification && state.notification.msg) {
            setShowNotification(true);
            setActiveNotification(state.notification);
            setTimeout(() => {
                setShowNotification(false);
                setActiveNotification(null);
                dispatch(removeNotification({ msg: '', type: '', time: 3000 }));
            }, state.notification.time);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state]);

    return (
        <>
            {ShowNotification ? <div className={`${ActiveNotification?.type ? ActiveNotification.type : 'noNotification'} notification-wrap`}>
                <div className="notification-type">
                    <div className="notification-msg">{ActiveNotification?.msg}</div>
                </div>
            </div> : null}
        </>
    )
}