import React, { useState, useRef, useEffect } from 'react';
import RupeshVideoFront from '../../videos/lessons/Lesson-Rupesh-front.mp4';
import RupeshVideoBack from '../../videos/lessons/Lesson-Rupesh-back.mp4';
import VideoThumbnail from '../../videos/lessons/Lesson-Rupesh-thumbnail.jpg';
import VideoThumbnailBack from '../../videos/lessons/Lesson-Rupesh-thumbnail-back.jpg';

function LessonsVideoContainer () {
    const [isFlipToggled, frontBackToggle] = useState(true);

    useEffect(() => {
        const videoFront = document.getElementById('videoFront');
        const videoBack = document.getElementById('videoBack');
        videoBack.muted = true;
        videoFront.muted = false;
        // Video Mirror will also come here
    }, []);
    
    function triggerFullScreen(e) {
        const fullScreenWrapper = document.getElementById('innerVideoWrap');
        if (!document.fullscreenElement) {
            fullScreenWrapper.requestFullscreen().catch(err => {
              console.log(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    function frontVideoPlayed(event) {
        const videoBack = document.getElementById('videoBack');
        videoBack.play();
    }
    
    function frontVideoPaused(event) {
        const videoBack = document.getElementById('videoBack');
        videoBack.pause();
    }
    
    function backVideoPlayed(event) {
        const videoFront = document.getElementById('videoFront');
        videoFront.play();
    }
    
    function backVideoPaused(event) {
        const videoFront = document.getElementById('videoFront');
        videoFront.pause();
    }

    function flipVideos(event) {
        const videoFront = document.getElementById('videoFront');
        const videoBack = document.getElementById('videoBack');
        if (isFlipToggled) {
            frontBackToggle(false);
            videoFront.muted = true;
            videoBack.muted = false;
        } else {
            frontBackToggle(true);
            videoFront.muted = false;
            videoBack.muted = true;
        }
    }

    // This seeking function is to sync all the videos on a specific time
    // when user use video slider to go ahead or back
    function onFrontVideoSeek(event) {
        console.log(event);
        // const videoFront = document.getElementById('videoFront');
        // const videoBack = document.getElementById('videoBack');    
        // videoBack.currentTime = videoFront.currentTime;
    }
    
    // This seeking function is to sync all the videos on a specific time
    // when user use video slider to go ahead or back
    function onBackVideoSeek(event) {
        console.log(event);
        // const videoFront = document.getElementById('videoFront');
        // const videoBack = document.getElementById('videoBack');
        // videoFront.currentTime = videoBack.currentTime;
    }

    return (
        <div className="video-component-wrap">
            <div className="inner-video-wrap" id="innerVideoWrap">
                <div className="actions">
                    <button onClick={(e) => flipVideos(e)}>Flip</button>
                    <button>Mirror</button>
                    <button onClick={(e) => triggerFullScreen(e)}>Fullscreen</button>
                </div>
                <video id="videoFront" className={isFlipToggled ? 'active' : ''} onPause={(e) => frontVideoPaused(e)} onPlay={(e) => frontVideoPlayed(e)} onSeeking={(e) => onFrontVideoSeek(e)} poster={VideoThumbnail} controls>
                    <source src={RupeshVideoFront} type="video/mp4" />
                </video>
                <video id="videoBack" poster={VideoThumbnailBack} className={!isFlipToggled ? 'active' : ''} onSeeking={(e) => onBackVideoSeek(e)} onPause={(e) => backVideoPaused(e)} onPlay={(e) => backVideoPlayed(e)} controls>
                    <source src={RupeshVideoBack} type="video/mp4" />
                </video>
            </div>
        </div>
    )
};

export default LessonsVideoContainer;