import React, { useState, useEffect } from "react";
import { useStoreConsumer } from '../../Providers/StateProvider';
import { useHistory } from "react-router-dom";
import { getUploadedVideosList } from "../../Services/UploadedVideo.service";
import Vedio from "../Vedio/Video";
import Favorite from '@material-ui/icons/Favorite';

const isAppAlreadyLoaded = JSON.parse(localStorage.getItem('isAppLoaded'));

export default function Homepage() {
    const history = useHistory();
    const { state } = useStoreConsumer();
    let loggedInUser = state.loggedInUser;
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

    useEffect(() => {
        getUploadedVideosList().subscribe((videos) => {
            setUserUploadedVideoList(videos)
        });
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
            }, 1500);
            setTimeout(() => {
                toggleMessageClass('show');
            }, 3500);
            setTimeout(() => {
                toggleHeadingClass('animate');
                toggleHeadingClassNew('animate');
            }, 4500);
            setTimeout(() => {
                animateStartButton('animate');
            }, 5200);
            setTimeout(() => {
                animateVideoContainer('animate');
                localStorage.setItem('isAppLoaded', true);
            }, 6000);
        }
        // let windowViewPortWidth = window.innerWidth;
        // if (windowViewPortWidth > 1023) {
        //     toggleMobile(false);
        // } else {
        //     toggleMobile(true);
        // }
    }, []);

    return (
        <div className="homepage clearfix">
            <div className={`homepage-display-1 ${firstImageLoaded} ${loadImageClass} ${!UserUploadedVideoList.length ? 'no-video': ''}`}>
                <div className={`main-bg-message ${defaultFirstMessageLoaded} ${firstMessageLoaded} ${loadMessageBox}`}>
                    <h4 className={`${firstHeadingLoaded} ${headingAnimateClass1}`}>
                        The world’s best <span className="color-text-yellow">Dance</span> learning tools,
                    </h4>
                    <h5 className={`${firstHeadingLoaded} ${headingAnimateClass2}`}>
                        at your <span className="color-text-green">Fingertips</span>.
                    </h5>
                    <button className={`btn primary-light get_started ${firstStartButtonLoaded} ${startButtonAnimateClass}`} onClick={() => {
                        loggedInUser ? history.push('/competitions') : history.push('/login');
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