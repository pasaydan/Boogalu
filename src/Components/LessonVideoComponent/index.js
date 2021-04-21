import React, { useState, useRef, useEffect } from 'react';
import VideoThumbnail from '../../videos/lessons/Lesson-Rupesh-thumbnail.jpg';
import VideoThumbnailBack from '../../videos/lessons/Lesson-Rupesh-thumbnail-back.jpg';
import FlipCameraAndroidOutlinedIcon from '@material-ui/icons/FlipCameraAndroidOutlined';
import FlipIcon from '@material-ui/icons/Flip';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';

function LessonsVideoContainer({ title, desc, uploadedOn, activeVideosList, videoId }) {
    const [activeVideoState, setActiveVideoState] = useState('front'); // front,back,front-mirror,back-mirror
    const [fullScreenMode, setFullScreenMode] = useState(false);
    const [videoDuration, setVideoDurationValue] = useState('');
    const [videoFront, setVideoFront] = useState(null);
    const [videoFrontMirror, setVideoFrontMirror] = useState(null);
    const [videoBack, setVideoBack] = useState(null);
    const [videoBackMirror, setVideoBackMirror] = useState(null);

    useEffect(() => {
        const videoElements = document.querySelectorAll('video');
        if (videoElements && videoElements.length) {
            videoElements.forEach(item => {
                if (item.getAttribute('data-id') === activeVideosList.frontView) {
                    setVideoFront(item);
                }

                if (item.getAttribute('data-id') === activeVideosList.frontMirrorView) {
                    setVideoFrontMirror(item);
                }
                
                if (item.getAttribute('data-id') === activeVideosList.rearView) {
                    setVideoBack(item);                
                }
                
                if (item.getAttribute('data-id') === activeVideosList.rearMirrorView) {
                    setVideoBackMirror(item);                
                }
            });
        }
        // Video Mirror will also come here
    }, []);

    function triggerFullScreen(e) {
        const fullScreenWrapper = document.getElementById(videoId);
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

    function setVideoDuration(videoMetaData) {
        const minutes = parseInt(videoMetaData / 60, 10);
        const seconds = videoMetaData % 60;
        const totalDuration = `${minutes} ${minutes < 2 ? 'min' : 'mins'} ${Math.floor(seconds)} ${Math.floor(seconds) < 2 ? 'sec' : 'secs'}`
        setVideoDurationValue(totalDuration);
    }

    function enableOverlay(event, overlayBox) {
        event.stopPropagation();
        const overlayItem = document.getElementsByClassName(overlayBox)[0];
        
        if (overlayItem.classList.contains('activeOverlay')) {
            videoFront.pause();
            event.currentTarget.classList.remove('activeOverlay');
            overlayItem.classList.remove('activeOverlay');
        } else {
            videoFront.play();
            event.currentTarget.classList.add('activeOverlay');
            overlayItem.classList.add('activeOverlay');
        }
    }

    return (
        <div className="video-component-wrap">
            <div className="videoThumbnailOverlay" onClick={(e) => enableOverlay(e, `js-${videoId}`)}></div>
            <div className={`innerLessonVideoWrap js-${videoId}`}>
                <h4>{title}</h4>
                <p className="desc">{desc}</p>
                <p className="durationBox">
                    <span>
                        Created on: <strong>{uploadedOn}</strong>
                    </span>
                    {
                        videoDuration ?
                        <span>
                            Duration: <strong>{videoDuration}</strong> 
                        </span> 
                        : ''
                    }
                </p>
                <div className="inner-video-wrap" id={videoId}>
                    <div className="actions">
                        <FlipCameraAndroidOutlinedIcon title="Flip video" className="vdo-controlls" variant="contained" type="submit" onClick={(e) => flipVideos(e)} />
                        <FlipIcon title="Mirror video" className="vdo-controlls" variant="contained" type="submit" onClick={(e) => mirrorVideos(e)} />
                        {fullScreenMode ?
                            <FullscreenExitIcon title="Fullscreen mode" className="vdo-controlls" variant="contained" type="submit" onClick={(e) => triggerFullScreen(e)} />
                            :
                            <FullscreenIcon  title="Exit fullscreen" className="vdo-controlls" variant="contained" type="submit" onClick={(e) => triggerFullScreen(e)} />
                        }
                    </div>
                    <video 
                        data-id={activeVideosList?.frontView} 
                        className={(activeVideoState === 'front') ? 'active' : ''} 
                        onPause={(e) => pauseVideo(e)} 
                        onPlay={(e) => playVideo(e)} 
                        onSeeked={(e) => onVideoSeek(e, 'front')} 
                        poster={VideoThumbnail} controls
                        onLoadedMetadata={(e) => setVideoDuration(e.target.duration)}
                        >
                        <source src={activeVideosList?.frontView} type="video/mp4" />
                    </video>
                    <video muted data-id={activeVideosList?.frontMirrorView} className={(activeVideoState === 'front-mirror') ? 'active' : ''} onPause={(e) => pauseVideo(e)} onPlay={(e) => playVideo(e)} onSeeked={(e) => onVideoSeek(e, 'front-mirror')} poster={VideoThumbnail} controls>
                        <source src={activeVideosList?.frontMirrorView} type="video/mp4" />
                    </video>
                    <video muted data-id={activeVideosList?.rearView} className={(activeVideoState === 'back') ? 'active' : ''} onPause={(e) => pauseVideo(e)} onPlay={(e) => playVideo(e)} onSeeked={(e) => onVideoSeek(e, 'back')} poster={VideoThumbnailBack} controls>
                        <source src={activeVideosList?.rearView} type="video/mp4" />
                    </video>
                    <video muted data-id={activeVideosList?.rearMirrorView} className={(activeVideoState === 'back-mirror') ? 'active' : ''} onPause={(e) => pauseVideo(e)} onPlay={(e) => playVideo(e)} onSeeked={(e) => onVideoSeek(e, 'back-mirror')} poster={VideoThumbnailBack} controls>
                        <source src={activeVideosList?.rearMirrorView} type="video/mp4" />
                    </video>
                </div>
            </div>
        </div>
    )
};

export default LessonsVideoContainer;