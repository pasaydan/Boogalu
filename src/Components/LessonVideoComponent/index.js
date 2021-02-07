import React, { useState, useRef, useEffect } from 'react';
import VideoThumbnail from '../../videos/lessons/Lesson-Rupesh-thumbnail.jpg';
import VideoThumbnailBack from '../../videos/lessons/Lesson-Rupesh-thumbnail-back.jpg';
import FlipCameraAndroidOutlinedIcon from '@material-ui/icons/FlipCameraAndroidOutlined';
import FlipIcon from '@material-ui/icons/Flip';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';

function LessonsVideoContainer({ title, desc, activeVideosList }) {
    const [activeVideoState, setActiveVideoState] = useState('front'); // front,back,front-mirror,back-mirror
    const [fullScreenMode, setFullScreenMode] = useState(false);

    useEffect(() => {
        const videoFront = document.getElementById(activeVideosList?.fUrl);
        const videoBack = document.getElementById(activeVideosList?.bUrl);
        const videoFrontMirror = document.getElementById(activeVideosList?.fMUrl);
        const videoBackMirror = document.getElementById(activeVideosList?.bMUrl);
        videoBack.muted = false;
        videoFrontMirror.muted = true;
        videoBackMirror.muted = true;
        console.log(activeVideosList)
        // Video Mirror will also come here
    }, []);

    function triggerFullScreen(e) {
        const fullScreenWrapper = document.getElementById('innerVideoWrap');
        if (!document.fullscreenElement) {
            setFullScreenMode(true);
            if (fullScreenWrapper.requestFullscreen) {
                fullScreenWrapper.requestFullscreen();
            } else if (fullScreenWrapper.webkitRequestFullscreen) { /* Safari */
                fullScreenWrapper.webkitRequestFullscreen();
            } else if (fullScreenWrapper.msRequestFullscreen) { /* IE11 */
                fullScreenWrapper.msRequestFullscreen();
            }
        } else {
            setFullScreenMode(false);
            document.exitFullscreen();
        }
    }

    function pauseVideo(params) {
        const videoFront = document.getElementById(activeVideosList?.fUrl);
        const videoBack = document.getElementById(activeVideosList?.bUrl);
        const videoFrontMirror = document.getElementById(activeVideosList?.fMUrl);
        const videoBackMirror = document.getElementById(activeVideosList?.bMUrl);
        const currentVideoState = activeVideoState;
        if (currentVideoState == 'front') {
            videoFrontMirror.pause();
            videoBack.pause();
            videoBackMirror.pause();
        } else if (currentVideoState == 'front-mirror') {
            videoFront.pause();
            videoBack.pause();
            videoBackMirror.pause();
        } else if (currentVideoState == 'back') {
            videoFrontMirror.pause();
            videoFront.pause();
            videoBackMirror.pause();
        } else {
            videoFront.pause();
            videoFrontMirror.pause();
            videoBack.pause();
        }
    }

    function playVideo(params) {
        const videoFront = document.getElementById(activeVideosList?.fUrl);
        const videoBack = document.getElementById(activeVideosList?.bUrl);
        const videoFrontMirror = document.getElementById(activeVideosList?.fMUrl);
        const videoBackMirror = document.getElementById(activeVideosList?.bMUrl);
        if (activeVideoState == 'front') {
            videoFrontMirror.play();
            videoBack.play();
            videoBackMirror.play();
        } else if (activeVideoState == 'front-mirror') {
            videoFront.play();
            videoBack.play();
            videoBackMirror.play();
        } else if (activeVideoState == 'back') {
            videoFrontMirror.play();
            videoFront.play();
            videoBackMirror.play();
        } else {
            videoFront.play();
            videoFrontMirror.play();
            videoBack.play();
        }
    }

    function flipVideos(event) {
        const videoFront = document.getElementById(activeVideosList?.fUrl);
        const videoBack = document.getElementById(activeVideosList?.bUrl);
        const videoFrontMirror = document.getElementById(activeVideosList?.fMUrl);
        const videoBackMirror = document.getElementById(activeVideosList?.bMUrl);
        if (activeVideoState == 'front' || activeVideoState == 'front-mirror') {
            setActiveVideoState('back');
            videoFront.muted = true;
            videoBack.muted = false;
            videoFrontMirror.muted = true;
            videoBackMirror.muted = true;
        } else {
            setActiveVideoState('front');
            videoFront.muted = false;
            videoBack.muted = true;
            videoFrontMirror.muted = true;
            videoBackMirror.muted = true;
        }
    }

    function mirrorVideos(event) {
        const videoFront = document.getElementById(activeVideosList?.fUrl);
        const videoBack = document.getElementById(activeVideosList?.bUrl);
        const videoFrontMirror = document.getElementById(activeVideosList?.fMUrl);
        const videoBackMirror = document.getElementById(activeVideosList?.bMUrl);
        if (activeVideoState == 'front') {
            setActiveVideoState('front-mirror');
            videoFront.muted = true;
            videoBack.muted = true;
            videoFrontMirror.muted = false;
            videoBackMirror.muted = true;
        } else if (activeVideoState == 'front-mirror') {
            setActiveVideoState('front');
            videoFront.muted = false;
            videoBack.muted = true;
            videoFrontMirror.muted = true;
            videoBackMirror.muted = true;
        } else if (activeVideoState == 'back') {
            setActiveVideoState('back-mirror');
            videoFront.muted = true;
            videoBack.muted = true;
            videoFrontMirror.muted = true;
            videoBackMirror.muted = false;
        } else {
            setActiveVideoState('back');
            videoFront.muted = true;
            videoBack.muted = false;
            videoFrontMirror.muted = true;
            videoBackMirror.muted = true;
        }
    }
    // This seeking function is to sync all the videos on a specific time
    // when user use video slider to go ahead or back
    function onVideoSeek(event, status) {
        if (activeVideoState == status) {
            const videoFront = document.getElementById(activeVideosList?.fUrl);
            const videoBack = document.getElementById(activeVideosList?.bUrl);
            const videoFrontMirror = document.getElementById(activeVideosList?.fMUrl);
            const videoBackMirror = document.getElementById(activeVideosList?.bMUrl);
            if (activeVideoState == 'front') {
                videoBack.currentTime = videoFront.currentTime;
                videoFrontMirror.currentTime = videoFront.currentTime;
                videoBackMirror.currentTime = videoFront.currentTime;
            } else if (activeVideoState == 'front-mirror') {
                videoFront.currentTime = videoFrontMirror.currentTime;
                videoBack.currentTime = videoFrontMirror.currentTime;
                videoBackMirror.currentTime = videoFrontMirror.currentTime;
            } else if (activeVideoState == 'back') {
                videoFront.currentTime = videoBack.currentTime;
                videoFrontMirror.currentTime = videoBack.currentTime;
                videoBackMirror.currentTime = videoBack.currentTime;
            } else {
                videoFront.currentTime = videoBackMirror.currentTime;
                videoBack.currentTime = videoBackMirror.currentTime;
                videoFrontMirror.currentTime = videoBackMirror.currentTime;
            }
            event.preventDefault();
            event.stopPropagation();
        }
    }

    return (
        <div className="video-component-wrap">
            <h4>{title}</h4>
            <p className="desc">{desc}</p>
            <div className="inner-video-wrap" id="innerVideoWrap">
                <div className="actions">
                    <FlipCameraAndroidOutlinedIcon title="Flip video" className="vdo-controlls" variant="contained" type="submit" onClick={(e) => flipVideos(e)} />
                    <FlipIcon title="Mirror video" className="vdo-controlls" variant="contained" type="submit" onClick={(e) => mirrorVideos(e)} />
                    {fullScreenMode ?
                        <FullscreenExitIcon title="Fullscreen mode" className="vdo-controlls" variant="contained" type="submit" onClick={(e) => triggerFullScreen(e)} />
                        :
                        <FullscreenIcon  title="Exit fullscreen" className="vdo-controlls" variant="contained" type="submit" onClick={(e) => triggerFullScreen(e)} />
                    }
                </div>
                <video id={activeVideosList?.fUrl} className={(activeVideoState == 'front') ? 'active' : ''} onPause={(e) => pauseVideo(e)} onPlay={(e) => playVideo(e)} onSeeked={(e) => onVideoSeek(e, 'front')} poster={VideoThumbnail} controls>
                    <source src={activeVideosList?.fMUrl} type="video/mp4" />
                </video>
                <video id={activeVideosList?.fMUrl} className={(activeVideoState == 'front-mirror') ? 'active' : ''} onPause={(e) => pauseVideo(e)} onPlay={(e) => playVideo(e)} onSeeked={(e) => onVideoSeek(e, 'front-mirror')} poster={VideoThumbnail} controls>
                    <source src={activeVideosList?.fMUrl} type="video/mp4" />
                </video>
                <video id={activeVideosList?.bUrl} className={(activeVideoState == 'back') ? 'active' : ''} onPause={(e) => pauseVideo(e)} onPlay={(e) => playVideo(e)} onSeeked={(e) => onVideoSeek(e, 'back')} poster={VideoThumbnailBack} controls>
                    <source src={activeVideosList?.bUrl} type="video/mp4" />
                </video>
                <video id={activeVideosList?.bMUrl} className={(activeVideoState == 'back-mirror') ? 'active' : ''} onPause={(e) => pauseVideo(e)} onPlay={(e) => playVideo(e)} onSeeked={(e) => onVideoSeek(e, 'back-mirror')} poster={VideoThumbnailBack} controls>
                    <source src={activeVideosList?.bMUrl} type="video/mp4" />
                </video>
            </div>
        </div>
    )
};

export default LessonsVideoContainer;