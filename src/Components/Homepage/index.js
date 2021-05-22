import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { getUploadedVideosList } from "../../Services/UploadedVideo.service";
import Vedio from "../Vedio/Video";
import Favorite from '@material-ui/icons/Favorite';
import Loader from '../Loader';
import { useStoreConsumer } from '../../Providers/StateProvider';
import { displayNotification, removeNotification } from "../../Actions/Notification";
import { NOTIFICATION_ERROR } from "../../Constants";

const isAppAlreadyLoaded = JSON.parse(localStorage.getItem('isAppLoaded'));

export default function Homepage() {
    const history = useHistory();
    const { dispatch } = useStoreConsumer();
    // const [danceImageVisibleClass, activeDanceImage] = useState('');
    const [UserUploadedVideoList, setUserUploadedVideoList] = useState([]);
    // const [isMobile, toggleMobile] = useState(false);
    const [loadImageClass, toggleLoadImage] = useState('');
    const [firstImageLoaded, toggleFirstImageLoad] = useState('');
    const [loadMessageBox, toggleMessageClass] = useState('');
    const [firstMessageLoaded, toggleFirstMessageLoad] = useState('');
    const [defaultFirstMessageLoaded, toggleDefaultMessageLoad] = useState('');
    const [headingAnimateClass1, toggleHeadingClass] = useState('');
    const [headingAnimateClass2, toggleHeadingClassNew] = useState('');
    const [firstHeadingLoaded, toggleFirstHeadingLoad] = useState('');
    const [startButtonAnimateClass, animateStartButton] = useState('');
    const [firstStartButtonLoaded, toggleFirstStartButtonLoad] = useState('');
    const [videoAnimateClass, animateVideoContainer] = useState('');
    const [firstVideoAnimateLoaded, toggleVideoAnimateLoad] = useState('');
    const [isLoaderActive, toggleLoading] = useState(false);

    useEffect(() => {
        toggleLoading(true);
        try {
            getUploadedVideosList().subscribe((videos) => {
                toggleLoading(false);
                setUserUploadedVideoList(videos);
            });
        } catch (e) {
            console.log('Something wrong in video loading!');
            toggleLoading(false);
            dispatch(displayNotification({
                msg: "Something went wrong! Please reload and try again!",
                type: NOTIFICATION_ERROR,
                time: 5000
            }));
            setTimeout(() => {
                dispatch(removeNotification({
                    msg: "",
                    type: NOTIFICATION_ERROR,
                    time: 0
                }));
            }, 5000);
        }
        if (isAppAlreadyLoaded) {
            toggleFirstImageLoad('noFirstImageLoad');
            toggleDefaultMessageLoad('noFirstMessageLoad')
            toggleFirstMessageLoad('');
            toggleFirstHeadingLoad('');
            toggleFirstStartButtonLoad('');
            toggleVideoAnimateLoad('');
        } else {
            toggleFirstImageLoad('firstTimeLoaded');
            toggleFirstMessageLoad('firstMessageLoaded');
            toggleFirstHeadingLoad('firstHeadingLoaded');
            toggleFirstStartButtonLoad('firstButtonLoaded');
            toggleVideoAnimateLoad('firstVideoLoaded');
            setTimeout(() => {
                // activeDanceImage('show');
                toggleLoadImage('show');
            }, 100);
            setTimeout(() => {
                toggleMessageClass('show');
            }, 200);
            setTimeout(() => {
                toggleHeadingClass('animate');
                toggleHeadingClassNew('animate');
            }, 300);
            setTimeout(() => {
                animateStartButton('animate');
            }, 400);
            setTimeout(() => {
                animateVideoContainer('animate');
                localStorage.setItem('isAppLoaded', true);
            }, 500);
        }
        // let windowViewPortWidth = window.innerWidth;
        // if (windowViewPortWidth > 1023) {
        //     toggleMobile(false);
        // } else {
        //     toggleMobile(true);
        // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="homepage clearfix">
            {
                isLoaderActive ?
                <Loader /> : ''
            }
            <div className={`homepage-display-1 ${firstImageLoaded} ${loadImageClass} ${!UserUploadedVideoList.length ? 'no-video': ''}`}>
                <div className={`main-bg-message ${defaultFirstMessageLoaded} ${firstMessageLoaded} ${loadMessageBox}`}>
                    <h4 className={`${firstHeadingLoaded} ${headingAnimateClass1}`}>
                        The world’s best <span className="color-text-yellow">Dance</span> learning tools,
                    </h4>
                    <h5 className={`${firstHeadingLoaded} ${headingAnimateClass2}`}>
                        at your <span className="color-text-green">Fingertips</span>.
                    </h5>
                    <button className={`btn primary-light get_started ${firstStartButtonLoaded} ${startButtonAnimateClass}`} onClick={() => {
                        history.push('/login');
                    }}>Get Started</button>
                    <div className={`flex-container video-main-wrap ${firstVideoAnimateLoaded} ${videoAnimateClass}`}>
                        {UserUploadedVideoList.length !== 0 ?
                            <div className="feed-wrap">
                                {UserUploadedVideoList && UserUploadedVideoList.map((vdo) => {
                                    return <div key={vdo.key} className="vdo-card">
                                        <div>
                                            <Vedio vdoObj={vdo} />
                                        </div>
                                        <div className="video-title-like-wrap">
                                            <div className="title">{vdo.title}</div>
                                            <div className="like-comment">
                                                <Favorite title="Likes" />
                                                {vdo.likes && vdo.likes.length > 0 && <div className="likes-count">{vdo.likes.length} Likes</div>}
                                            </div>

                                        </div>
                                    </div>
                                })}
                            </div>
                            :
                            ''}
                    </div>
                </div>
            </div>
        </div>
    );
}