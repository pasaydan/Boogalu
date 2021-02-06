import React, { useState, useRef, useEffect } from 'react';
import RupeshVideoFront from '../../videos/lessons/Lesson-Rupesh-front.mp4';
import RupeshVideoBack from '../../videos/lessons/Lesson-Rupesh-back.mp4';
import VideoThumbnail from '../../videos/lessons/Lesson-Rupesh-thumbnail.jpg';

function LessonsVideoContainer () {
    const [isFlipToggled, frontBackToggle] = useState(true);
    function triggerFullScreen(e) {
        const fullScreenWrapper = document.getElementById('innerVideoWrap');
        if (!document.fullscreenElement) {
            fullScreenWrapper.requestFullscreen().catch(err => {
              alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
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
        } else {
            frontBackToggle(true);
        }
    }

    return (
        <div className="video-component-wrap">
            <div className="inner-video-wrap" id="innerVideoWrap">
                <div className="actions">
                    <button onClick={(e) => flipVideos(e)}>Flip</button>
                    <button>Mirror</button>
                    <button onClick={(e) => triggerFullScreen(e)}>Fullscreen</button>
                </div>
                <video id="videoFront" className={isFlipToggled ? 'active' : ''} onPause={(e) => frontVideoPaused(e)} onPlay={(e) => frontVideoPlayed(e)} poster={VideoThumbnail} controls>
                    <source src={RupeshVideoFront} type="video/mp4" />
                </video>
                <video id="videoBack" className={!isFlipToggled ? 'active' : ''} onPause={(e) => backVideoPaused(e)} onPlay={(e) => backVideoPlayed(e)} controls>
                    <source src={RupeshVideoBack} type="video/mp4" />
                </video>
            </div>
        </div>
    )
};

export default LessonsVideoContainer;