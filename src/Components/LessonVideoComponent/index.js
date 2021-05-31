import React, { useState, useRef, useEffect } from 'react';
import { MdSettingsBackupRestore, MdShare, MdFlip, MdLock } from 'react-icons/md';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import { useStoreConsumer } from '../../Providers/StateProvider';
import { useHistory } from "react-router-dom";
import { enableLoginFlow } from "../../Actions/LoginFlow";
import { isObjectEmpty } from '../../helpers';
import { updateLessonPlayTime } from '../../Services/Lessons.service';

function LessonsVideoContainer({ 
    lessonKey,
    title, 
    artist, 
    desc, 
    lessonPlayTime,
    videoUserLevel,
    artForm,
    isPaid, 
    thumbNail, 
    activeVideosList, 
    videoId 
}) {
    const { state, dispatch } = useStoreConsumer();
    const loggedInUser = state.loggedInUser;
    const history = useHistory();
    const [activeVideoState, setActiveVideoState] = useState('front'); // front,back,front-mirror,back-mirror
    const [fullScreenMode, setFullScreenMode] = useState(false);
    const [videoDuration, setVideoDurationValue] = useState('');
    const [videoFront, setVideoFront] = useState(null);
    const [videoFrontMirror, setVideoFrontMirror] = useState(null);
    const [videoBack, setVideoBack] = useState(null);
    const [videoBackMirror, setVideoBackMirror] = useState(null);
    const [isVideoOverlayActive, toggleisVideoOverlayActive] = useState(false);
    const [visibilityClass, toggleVideoVisibilityClass] = useState('');
    const [isLoggedInUser, setLoggedInUserValue] = useState(false);
    const [isSubscribedUser, setSubscribedUser] = useState(false);
    const [videoCurrentPlayTime, setCurrentVideoPlayTime] = useState(null);
    const [isVideoPlayed, toggleVideoPlayedValue] = useState(false);
    
    const thumbNailOverlayRef = useRef(null);

    useEffect(() => {
        const videoElements = document.querySelectorAll('video');

        if (!isObjectEmpty(loggedInUser)) {
            if (lessonPlayTime && lessonPlayTime.length) {
                const matchedUser = lessonPlayTime.filter( user =>  user.userKey === loggedInUser.key );
                if (matchedUser?.length && matchedUser[0]?.playedTime) {
                    setCurrentVideoPlayTime(Math.round(matchedUser[0].playedTime) - 5);
                }
            }
            setLoggedInUserValue(true);
        }
        
        if (!isObjectEmpty(loggedInUser) && state.loggedInUser.subscribed) {
            setSubscribedUser(true);
        }
        
        if (videoElements && videoElements.length) {
            videoElements.forEach(item => {
                if (item.getAttribute('data-id') === activeVideosList.frontView) {
                    setVideoFront(item);
                    item.addEventListener('loadeddata', () => {
                        toggleVideoVisibilityClass('showVideoBox');
                        if (item !== null) {
                            item.currentTime = videoCurrentPlayTime;
                        }
                    });
                    item.addEventListener("contextmenu", e => e.preventDefault());
                }

                if (item.getAttribute('data-id') === activeVideosList.frontMirrorView) {
                    setVideoFrontMirror(item);
                    item.addEventListener('loadeddata', () => {
                        if (item !== null) {
                            item.currentTime = videoCurrentPlayTime;
                        }
                    });
                    item.addEventListener("contextmenu", e => e.preventDefault());
                }
                
                if (item.getAttribute('data-id') === activeVideosList.rearView) {
                    setVideoBack(item);
                    item.addEventListener('loadeddata', () => {
                        if (item !== null) {
                            item.currentTime = videoCurrentPlayTime;
                        }
                    });
                    item.addEventListener("contextmenu", e => e.preventDefault());
                }
                
                if (item.getAttribute('data-id') === activeVideosList.rearMirrorView) {
                    setVideoBackMirror(item);
                    item.addEventListener('loadeddata', () => {
                        if (item !== null) {
                            item.currentTime = videoCurrentPlayTime;
                        }
                    });
                    item.addEventListener("contextmenu", e => e.preventDefault());       
                }
            });
        }
        // Video Mirror will also come here
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    function pauseVideo(event, params) {
        event.stopPropagation();
        event.preventDefault();
        const currentVideoState = activeVideoState;
        setCurrentVideoPlayTime(Math.round(videoFront.currentTime) - 5);
        setVideoCurrentTimeToDB();
        if (currentVideoState === 'front') {
            videoFrontMirror.pause();
            videoBack.pause();
            videoBackMirror.pause();
        } else if (currentVideoState === 'front-mirror') {
            videoFront.pause();
            videoBack.pause();
            videoBackMirror.pause();
        } else if (currentVideoState === 'back') {
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
        if (videoCurrentPlayTime) {
            videoFront.currentTime = videoCurrentPlayTime;
            videoFrontMirror.currentTime = videoCurrentPlayTime;
            videoBack.currentTime = videoCurrentPlayTime;
            videoBackMirror.currentTime = videoCurrentPlayTime;
        }
        setTimeout(() => {
            if (activeVideoState === 'front') {
                videoFrontMirror.play().then(_ => {
                    console.log("Front mirror played");
                }).catch(e => {
                    console.log("Front mirror error");
                }) ;
                videoBack.play().then(_ => {
                    console.log("Back played");
                }).catch(e => {
                    console.log("Back played error");
                });
                videoBackMirror.play().then(_ => {
                    console.log("Back Mirror played");
                }).catch(e => {
                    console.log("Back Mirror error");
                });
            } else if (activeVideoState === 'front-mirror') {
                videoFront.play().then(_ => {
                    console.log("Front played");
                }).catch(e => {
                    console.log("Front played error");
                });
                videoBack.play().then(_ => {
                    console.log("Back played");
                }).catch(e => {
                    console.log("Back played error");
                });
                videoBackMirror.play().then(_ => {
                    console.log("Back Mirror played");
                }).catch(e => {
                    console.log("Back Mirror played error");
                });
            } else if (activeVideoState === 'back') {
                videoFrontMirror.play().then(_ => {
                    console.log("Front Mirror played");
                }).catch(e => {
                    console.log("Front Mirror played error");
                });
                videoFront.play().then(_ => {
                    console.log("Front played");
                }).catch(e => {
                    console.log("Front error played");
                });
                videoBackMirror.play().then(_ => {
                    console.log("Back mirror played");
                }).catch(e => {
                    console.log("Back mirror error");
                });
            } else {
                videoFront.play().then(_ => {
                    console.log("Front played");
                }).catch(e => {
                    console.log("Front played error");
                });
                videoFrontMirror.play().then(_ => {
                    console.log("Front Mirror played");
                }).catch(e => {
                    console.log("Front Mirror played error");
                });
                videoBack.play().then(_ => {
                    console.log("Back played");
                }).catch(e => {
                    console.log("Back played error");
                });
            }
        }, 100);
    }

    function flipVideos(event) {
        if (activeVideoState === 'front' || activeVideoState === 'front-mirror') {
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
        if (activeVideoState === 'front') {
            setActiveVideoState('front-mirror');
            videoFront.muted = true;
            videoBack.muted = true;
            videoFrontMirror.muted = false;
            videoBackMirror.muted = true;
        } else if (activeVideoState === 'front-mirror') {
            setActiveVideoState('front');
            videoFront.muted = false;
            videoBack.muted = true;
            videoFrontMirror.muted = true;
            videoBackMirror.muted = true;
        } else if (activeVideoState === 'back') {
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
        event.stopPropagation();
        event.preventDefault();
        if (activeVideoState === status) {
            if (activeVideoState === 'front') {
                videoBack.currentTime = videoFront.currentTime;
                videoFrontMirror.currentTime = videoFront.currentTime;
                videoBackMirror.currentTime = videoFront.currentTime;
            } else if (activeVideoState === 'front-mirror') {
                videoFront.currentTime = videoFrontMirror.currentTime;
                videoBack.currentTime = videoFrontMirror.currentTime;
                videoBackMirror.currentTime = videoFrontMirror.currentTime;
            } else if (activeVideoState === 'back') {
                videoFront.currentTime = videoBack.currentTime;
                videoFrontMirror.currentTime = videoBack.currentTime;
                videoBackMirror.currentTime = videoBack.currentTime;
            } else {
                videoFront.currentTime = videoBackMirror.currentTime;
                videoBack.currentTime = videoBackMirror.currentTime;
                videoFrontMirror.currentTime = videoBackMirror.currentTime;
            }
        }
        if (isVideoPlayed) {
            setVideoCurrentTimeToDB();
        }
    }

    function setVideoCurrentTimeToDB() {
        if (videoFront !== null) {
            const videoData = {
                userKey: loggedInUser.key,
                playedTime: videoFront.currentTime
            }
            try {
                updateLessonPlayTime(lessonKey, videoData).subscribe(res => {
                    console.log('Res: ', res);
                });
            } catch(e) {
                console.log('Update lesson Error: ', e);
            }
        }
    }

    function setVideoDuration(event) {
        const videoDuration = event.target.duration;
        let totalDuration = '';
        const videPlayedRoundedTime = videoCurrentPlayTime;
        videoFront.currentTime = videPlayedRoundedTime;
        videoFrontMirror.currentTime = videPlayedRoundedTime;
        videoBack.currentTime = videPlayedRoundedTime;
        videoBackMirror.currentTime = videPlayedRoundedTime;
        const minutes = parseInt(videoDuration / 60, 10);
        const seconds = videoDuration % 60;
        if (minutes) {
            totalDuration = `${minutes} ${minutes < 2 ? 'min' : 'mins'}`
        } else if (seconds) {
            totalDuration = `${seconds} ${Math.floor(seconds) < 2 ? 'sec' : 'secs'}`
        }
        setVideoDurationValue(totalDuration);
    }

    function toggleVideoOverlay(event, overlayBox) {
        event.stopPropagation();
        
        if (isLoggedInUser) {
            const overlayItem = document.getElementsByClassName(overlayBox)[0];
            if (isPaid === 'free') {
                if (overlayItem.classList.contains('activeOverlay')) {
                    toggleisVideoOverlayActive(false);
                    videoFront.pause();
                    if (thumbNailOverlayRef.current) {
                        thumbNailOverlayRef.current.classList.remove('activeOverlay');
                    }
                    overlayItem.classList.remove('activeOverlay');
                } else {
                    toggleisVideoOverlayActive(true);
                    toggleVideoPlayedValue(true);
                    videoFront.play();
                    if (thumbNailOverlayRef.current) {
                        thumbNailOverlayRef.current.classList.add('activeOverlay');
                    }
                    overlayItem.classList.add('activeOverlay');
                }
            } else if (isPaid === 'paid' && isSubscribedUser) {
                if (overlayItem.classList.contains('activeOverlay')) {
                    toggleisVideoOverlayActive(false);
                    videoFront.pause();
                    if (thumbNailOverlayRef.current) {
                        thumbNailOverlayRef.current.classList.remove('activeOverlay');
                    }
                    overlayItem.classList.remove('activeOverlay');
                } else {
                    toggleisVideoOverlayActive(true);
                    toggleVideoPlayedValue(true);
                    videoFront.play();
                    if (thumbNailOverlayRef.current) {
                        thumbNailOverlayRef.current.classList.add('activeOverlay');
                    }
                    overlayItem.classList.add('activeOverlay');
                }
            } else {
                redirectToSubscription(); 
            }
        } else {
            dispatch(enableLoginFlow('lessons'));
            history.push({
                pathname: '/login',
                state: null
            });    
        }
    }

    function redirectToSubscription() {
        dispatch(enableLoginFlow('subscription'));
        history.push({
            pathname: '/subscription',
            search: `?from=lesson&planType=${isPaid === 'paid' ? 'startup' : isPaid}`,
            state: null
        }); 
    }

    function shareLessonDetails(event) {
        event.stopPropagation();
        if (navigator.share) { 
            navigator.share({
               title: 'Learn from the Experts',
               url: `${window.location.origin}/lessons`
            }).then(() => {
               console.log('Thanks for sharing!');
            }).catch(console.error);
        }
    }

    function redirectToLogin(event) {
        event.stopPropagation();
        history.push('/login');
    }

    function playStopPreviewVideo(event, action) {
        event.stopPropagation();
        if (!isVideoOverlayActive) {
            const previewVideoItem = event.currentTarget.querySelectorAll('.js-previewVideo')[0];
            if (action && action === 'play') {
                const previePlay = previewVideoItem.play();
                if (previePlay !== undefined) {
                    previePlay.then(_ => {
                        console.log('Preview played..');
                    }).catch(e => {
                        console.log('Video play error: ', e);
                    });
                }
            } else {
                previewVideoItem.currentTime = 0;
                previewVideoItem.pause();
            }
        }
    }

    return (
        <div className={`video-component-wrap ${isPaid}`} onMouseOver={(e) => playStopPreviewVideo(e, 'play')} onMouseLeave={(e) => playStopPreviewVideo(e, 'stop')}>
            <div className="videoThumbnailOverlay" ref={thumbNailOverlayRef} onClick={(e) => toggleVideoOverlay(e, `js-${videoId}`)}>
                <img src={thumbNail} alt="preview" className={isVideoOverlayActive ? 'hideImage' : ''} />
            </div>
            {
                isVideoOverlayActive ?
                <p title="close lesson" className="closeLessonBox" onClick={(e) => toggleVideoOverlay(e, `js-${videoId}`)}><span></span></p>
                : ''
            }

            {
                !isVideoOverlayActive ?
                <div className="previewVideoWrap">
                    {
                        activeVideosList?.preview ?
                        <video controlsList="nodownload" muted className="js-previewVideo" onClick={(e) => toggleVideoOverlay(e, `js-${videoId}`)}>
                            <source src={activeVideosList?.preview} type="video/mp4" />
                        </video> : ''
                    }
                </div>
                 : ''
            }

            {
                isPaid === 'free' ?
                <span className="diagonalStrip free">
                    <span>Free</span>
                </span>
                : ''
            }
            
            {
                isPaid === 'paid' ?
                <span className="diagonalStrip paid">
                    <span>Startup</span>
                </span>
                : ''
            }

            {
                isPaid === 'pro' ?
                <span className="diagonalStrip pro">
                    <span>Pro</span>
                </span>
                : ''
            }
            
            {
                isPaid === 'premium' ?
                <span className="diagonalStrip premium">
                    <span>Premium</span>
                </span>
                : ''
            }

            {
                (!isLoggedInUser && isPaid === 'free') ?
                    <p className="lockIconWrap" title="Login to unlock this lesson" onClick={(e) => redirectToLogin(e)}>
                        <MdLock />
                    </p> : 
                (isLoggedInUser && (!isSubscribedUser && (isPaid === 'paid' || isPaid === 'pro' || isPaid === 'premium'))) ?
                <p className="lockIconWrap" title="Subscribe to unlock this lesson" onClick={(e) => redirectToLogin(e)}>
                    <MdLock />
                </p> : 
                (!isLoggedInUser && !isSubscribedUser && (isPaid === 'paid' || isPaid === 'pro' || isPaid === 'premium')) ?
                <p className="lockIconWrap" title="Login &amp; subscribe to unlock this lesson" onClick={(e) => redirectToLogin(e)}>
                    <MdLock />
                </p> : ''
            }

            <div className="videoInfoWrap" onClick={(e) => toggleVideoOverlay(e, `js-${videoId}`)}>
                <h4>{title}</h4>
                <p className="desc">{desc}</p>
                <p className="subTexts">
                    <span>
                        By: <strong>{artist}</strong>
                    </span>
                    {
                        videoDuration ?
                        <span>
                            &nbsp; | &nbsp;
                            <strong>{videoDuration}</strong> 
                        </span> 
                        : ''
                    }
                </p>
            </div>
            
            <i className="shareIcon" title="Share this lesson" onClick={(e) => shareLessonDetails(e)}>
                <MdShare />
            </i>

            <div className="videoTags">
                {
                    videoUserLevel ?
                    <span className={`userLevel ${videoUserLevel.toLowerCase()}`}>{videoUserLevel}</span>
                    : ''
                }

                {
                    artForm ?
                    <span className="danceStyle">{artForm}</span>
                    : ''
                }
            </div>
                
            <div className={`innerLessonVideoWrap ${visibilityClass} js-${videoId}`}>
                <div className="inner-video-wrap" id={videoId}>
                    {
                        isVideoOverlayActive ? 
                        <div className="actions">
                            <MdSettingsBackupRestore title="Flip video" className="vdo-controlls flipVideoIcon" variant="contained" type="submit" onClick={(e) => flipVideos(e)} />
                            <MdFlip title="Mirror video" className="vdo-controlls mirrorVideoIcon" variant="contained" type="submit" onClick={(e) => mirrorVideos(e)} />
                            <MdShare title="Share this lesson" className="vdo-controlls" variant="contained" onClick={(e) => shareLessonDetails(e)} />
                            {fullScreenMode ?
                                <FullscreenExitIcon title="Fullscreen mode" className="vdo-controlls fullScreenToggleIcon" variant="contained" type="submit" onClick={(e) => triggerFullScreen(e)} />
                                :
                                <FullscreenIcon title="Exit fullscreen" className="vdo-controlls fullScreenToggleIcon" variant="contained" type="submit" onClick={(e) => triggerFullScreen(e)} />
                            }
                        </div> : ''
                    }
                    {
                        activeVideosList?.frontView ?
                        <video 
                            data-id={activeVideosList?.frontView} 
                            className={(activeVideoState === 'front') ? 'active' : ''} 
                            onPause={(e) => pauseVideo(e)} 
                            onPlay={(e) => playVideo(e)} 
                            onSeeked={(e) => onVideoSeek(e, 'front')} 
                            poster={thumbNail} 
                            controls
                            controlsList="nodownload"
                            onLoadedMetadata={(e) => setVideoDuration(e)}
                            >
                            <source src={activeVideosList?.frontView} type="video/mp4" />
                        </video> : ''
                    }
                    {
                        activeVideosList?.frontMirrorView ?
                        <video muted controlsList="nodownload" data-id={activeVideosList?.frontMirrorView} className={(activeVideoState === 'front-mirror') ? 'active' : ''} onPause={(e) => pauseVideo(e)} onPlay={(e) => playVideo(e)} onSeeked={(e) => onVideoSeek(e, 'front-mirror')} poster={thumbNail} controls>
                            <source src={activeVideosList?.frontMirrorView} type="video/mp4" />
                        </video> : ''
                    }
                    {
                        activeVideosList?.rearView ?
                        <video muted controlsList="nodownload" data-id={activeVideosList?.rearView} className={(activeVideoState === 'back') ? 'active' : ''} onPause={(e) => pauseVideo(e)} onPlay={(e) => playVideo(e)} onSeeked={(e) => onVideoSeek(e, 'back')} poster={thumbNail} controls>
                            <source src={activeVideosList?.rearView} type="video/mp4" />
                        </video> : ''
                    }
                    {
                        activeVideosList?.rearMirrorView ?
                        <video muted controlsList="nodownload" data-id={activeVideosList?.rearMirrorView} className={(activeVideoState === 'back-mirror') ? 'active' : ''} onPause={(e) => pauseVideo(e)} onPlay={(e) => playVideo(e)} onSeeked={(e) => onVideoSeek(e, 'back-mirror')} poster={thumbNail} controls>
                            <source src={activeVideosList?.rearMirrorView} type="video/mp4" />
                        </video> : ''
                    }
                </div>
            </div>
        </div>
    )
};

export default LessonsVideoContainer;