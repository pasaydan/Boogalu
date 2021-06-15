import React, { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import { getUploadedVideosList } from "../../Services/UploadedVideo.service";
// eslint-disable-next-line no-unused-vars
import VideoPlayer from "../Vedio/Video";
// eslint-disable-next-line no-unused-vars
import Favorite from '@material-ui/icons/Favorite';
import { BsArrowRight, BsCameraVideo, BsBook, BsAward } from "react-icons/bs";
import Loader from '../Loader';
import LessonsImg from '../../Images/home-page/lesson-1.jpg';
import CompImg from '../../Images/home-page/comp-1.jpg';
import { useStoreConsumer } from '../../Providers/StateProvider';
import { displayNotification, removeNotification } from "../../Actions/Notification";
import { NOTIFICATION_ERROR } from "../../Constants";
import { isElementInViewport } from '../../helpers';

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
    // eslint-disable-next-line no-unused-vars
    const [headingAnimateClass1, toggleHeadingClass] = useState('');
    // eslint-disable-next-line no-unused-vars
    const [headingAnimateClass2, toggleHeadingClassNew] = useState('');
    // eslint-disable-next-line no-unused-vars
    const [firstHeadingLoaded, toggleFirstHeadingLoad] = useState('');
    const [startButtonAnimateClass, animateStartButton] = useState('');
    const [firstStartButtonLoaded, toggleFirstStartButtonLoad] = useState('');
    // eslint-disable-next-line no-unused-vars
    const [videoAnimateClass, animateVideoContainer] = useState('');
    // eslint-disable-next-line no-unused-vars
    const [firstVideoAnimateLoaded, toggleVideoAnimateLoad] = useState('');
    const [isLoaderActive, toggleLoading] = useState(false);
    const [visibleClass, toggleVisibleClass] = useState('');

    const sectionServiceRef = useRef(null);
    const sectionLessonRef = useRef(null);
    const sectionCompetitionRef = useRef(null);
    const sectionFeatureRef = useRef(null);
    const cardShowcaseRef = useRef(null);
    const cardCompRef = useRef(null);
    const cardLessonRef = useRef(null);

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

        window.addEventListener('scroll', onWindowScroll);

        return () => window.removeEventListener('scroll', onWindowScroll);
        // let windowViewPortWidth = window.innerWidth;
        // if (windowViewPortWidth > 1023) {
        //     toggleMobile(false);
        // } else {
        //     toggleMobile(true);
        // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function onWindowScroll(event) {
        event.stopPropagation();
        if (window.scrollY > 100) {
            toggleVisibleClass('active');
            if (
                (sectionServiceRef.current && !sectionServiceRef.current.classList.contains('animateContent'))
                || (sectionLessonRef.current && !sectionLessonRef.current.classList.contains('animateContent'))
                || (sectionCompetitionRef.current && !sectionCompetitionRef.current.classList.contains('animateContent'))
                || (sectionFeatureRef.current && !sectionFeatureRef.current.classList.contains('animateContent'))
            ) {
                setTimeout(() => {
                    if (sectionServiceRef.current) {
                        const headingEle = sectionServiceRef.current.querySelectorAll('h2')[0];
                        if (isElementInViewport(headingEle)) {
                            sectionServiceRef.current.classList.add('animateContent');
                            setTimeout(() => {
                                if (cardShowcaseRef.current) {
                                    cardShowcaseRef.current.classList.add('show');
                                }
                            }, 50);
                            setTimeout(() => {
                                if (cardCompRef.current) {
                                    cardCompRef.current.classList.add('show');
                                }
                            }, 150);
                            setTimeout(() => {
                                if (cardLessonRef.current) {
                                    cardLessonRef.current.classList.add('show');
                                }
                            }, 200);
                        }
                    }
                    if (sectionLessonRef.current) {
                        const headingEle = sectionLessonRef.current.querySelectorAll('h2')[0];
                        if (isElementInViewport(headingEle)) {
                            sectionLessonRef.current.classList.add('animateContent');
                        }
                    }
                    if (sectionCompetitionRef.current) {
                        const headingEle = sectionCompetitionRef.current.querySelectorAll('h2')[0];
                        if (isElementInViewport(headingEle)) {
                            sectionCompetitionRef.current.classList.add('animateContent');
                        }
                    }
                    if (sectionFeatureRef.current) {
                        const headingEle = sectionFeatureRef.current.querySelectorAll('h2')[0];
                        if (isElementInViewport(headingEle)) {
                            sectionFeatureRef.current.classList.add('animateContent');
                        }
                    }
                }, 300);
            }
        } else {
            toggleVisibleClass('');
        }
    }

    function scrollToTop(event) {
        event.stopPropagation();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    function scrollToNextSection(event, nextSection) {
        event.stopPropagation();
        if (nextSection.current) {
            window.scrollTo({
                top: nextSection.current.offsetTop - 45,
                behavior: 'smooth'
            });
        }
    }

    return (
        <div className="homepage clearfix">
            {
                isLoaderActive ?
                <Loader /> : ''
            }
            <div className={`homepage-display-1 ${firstImageLoaded} ${loadImageClass} ${!UserUploadedVideoList.length ? 'no-video': ''}`}>
                <section className={`main-bg-message ${defaultFirstMessageLoaded} ${firstMessageLoaded} ${loadMessageBox}`}>
                    <div className="boxContent">
                        <h2>Compete, learn &amp; perform</h2>
                        <p>Innovative and comprehensive learning to enlighten your journey of dance and fitness to make your dream come true.</p>
                        <button className={`btn primary-light get_started ${firstStartButtonLoaded} ${startButtonAnimateClass}`} onClick={(e) => scrollToNextSection(e, sectionServiceRef)}>Learn more</button>
                    </div>
                    {/* <h4 className={`${firstHeadingLoaded} ${headingAnimateClass1}`}>
                        The world’s best <span className="color-text-yellow">Dance</span> learning tools,
                    </h4>
                    <h5 className={`${firstHeadingLoaded} ${headingAnimateClass2}`}>
                        at your <span className="color-text-green">Fingertips</span>.
                    </h5>
                    <button className={`btn primary-light get_started ${firstStartButtonLoaded} ${startButtonAnimateClass}`} onClick={() => {
                        history.push('/login');
                    }}>Get Started</button>
                    <div className={`flex-container video-main-wrap ${firstVideoAnimateLoaded} ${videoAnimateClass}`}> */}
                        {/* {UserUploadedVideoList.length !== 0 ?
                            <div className="feed-wrap">
                                {UserUploadedVideoList && UserUploadedVideoList.map((vdo) => {
                                    return <div key={vdo.key} className="vdo-card">
                                        <div>
                                            <VideoPlayer vdoObj={vdo} />
                                        </div>
                                        <div className="video-title-like-wrap">
                                            <div className="title">{vdo.title}</div>
                                            <div className="like-comment">
                                                <Favorite title="Likes" />
                                                {vdo.likes && vdo.likes.length > 0 && <div className="likes-count">{vdo.likes.length} {vdo.likes.length > 1 ? 'Likes' : 'Like'}</div>}
                                            </div>

                                        </div>
                                    </div>
                                })}
                            </div>
                            :
                            ''}
                    </div> */}
                    <div 
                        className="scrollToNexBtn" 
                        title="Scroll to Showcase"
                        onClick={(e) => scrollToNextSection(e, sectionServiceRef)}
                    >
                        <p className="mouseBtnWrap">
                            <span className="mouse">
                                <span>
                                </span>
                            </span>
                        </p>
                        <p className="text">next</p>
                    </div>
                </section>
                <section className="otherSections sectionServices" ref={sectionServiceRef}>
                    <h2>What you can expect from Boogaluu</h2>
                    <div className="othersInnerSection">
                        <div className="cards cardShowcase" ref={cardShowcaseRef}>
                            <div className="cardIcon">
                                <BsCameraVideo />
                            </div>
                            <p className="title">Showcase</p>
                            <p className="para">An opportunity to showcase your talent and get visibility and fame by uploading your dance videos.</p>
                            <button title="login and explore" onClick={(e) => history.push('/login')}>
                                Let's explore 
                                <i><BsArrowRight /></i>
                            </button>
                        </div>
                        <div className="cards cardCompetition" ref={cardCompRef}>
                            <div className="cardIcon">
                                <BsAward />
                            </div>
                            <p className="title">Competition</p>
                            <p className="para">A platform to compete in different dance styles and win exciting prizes under the guidance of international and celebrity judges.</p>
                            <button title="enroll in competition" onClick={(e) => history.push('/competitions')}>
                                Let's enroll
                                <i><BsArrowRight /></i>
                            </button>
                        </div>
                        <div className="cards cardLessons" ref={cardLessonRef}>
                            <div className="cardIcon">
                                <BsBook />
                            </div>
                            <p className="title">Lessons</p>
                            <p className="para">Learn different dance styles by Masters and with the help of the modern technologies for adequate learning experience.</p>
                            <button title="learn lessons" onClick={(e) => history.push('/lessons')}>
                                Let's learn
                                <i><BsArrowRight /></i>
                            </button>
                        </div>
                    </div>
                    <div className="scrollToNexBtn" title="Scroll to lessons" onClick={(e) => scrollToNextSection(e, sectionLessonRef)}>
                        <p className="mouseBtnWrap">
                            <span className="mouse">
                                <span>
                                </span>
                            </span>
                        </p>
                        <p className="text">next</p>
                    </div>
                </section>
                <section className="otherSections sectionLessons" ref={sectionLessonRef}>
                    <h2>Know about lessons</h2>
                    <div className="othersInnerSection">
                        <div className="childs">
                            <div className="imgWrap">
                                <img src={LessonsImg} alt="lessons"/>
                            </div>
                        </div>
                        <div className="childs">
                            <p>
                                Now you can learn different dance styles anywhere anytime at your fingertips directly from the dance Gurus;
                            </p>
                            <ul>
                                <li>Three-dimensional video (VR) - Learn from an advance artificial three dimensional videos.</li>
                                <li>Mirror View- Mirror view feature to get rid of left and right puzzlement.</li>
                                <li>Front and Back View- Flip the view from front to back or from back to front for efficient and hassle-free understanding.</li>
                            </ul>
                            <p>You will get this experiential and fun learning experience at very nominal charges.</p>
                            <button className="btn primary-dark" onClick={(e) => history.push('/lessons')}>Let's Learn</button>
                        </div>
                    </div>
                    <div className="scrollToNexBtn" title="Scroll to competition" onClick={(e) => scrollToNextSection(e, sectionCompetitionRef)}>
                        <p className="mouseBtnWrap">
                            <span className="mouse">
                                <span>
                                </span>
                            </span>
                        </p>
                        <p className="text">next</p>
                    </div>
                </section>
                <section className="otherSections sectionCompetition" ref={sectionCompetitionRef}>
                    <h2>Know about competitions</h2>
                    <div className="othersInnerSection">
                        <div className="childs">
                            <p>
                                Boogaluu hosts monthly competitions of different dance styles for every age group.
                            </p>
                            <ul>
                                <li>You can compete with your peers.</li>
                                <li>These competitions will be guided by international and celebrity judges.</li>
                                <li>It will allow you to present your talent and enhance your skills</li>
                                <li>Give you visibility and fame along with the exciting prizes.</li>
                            </ul>
                            <button className="btn primary-dark" onClick={(e) => history.push('/competitions')}>Participate</button>
                        </div>
                        <div className="childs">
                            <div className="imgWrap">
                                <img src={CompImg} alt="competition"/>
                            </div>
                        </div>
                    </div>
                    <div className="scrollToNexBtn" title="Scroll to features" onClick={(e) => scrollToNextSection(e, sectionFeatureRef)}>
                        <p className="mouseBtnWrap">
                            <span className="mouse">
                                <span>
                                </span>
                            </span>
                        </p>
                        <p className="text">next</p>
                    </div>
                </section>
                <section className="otherSections featureSection" ref={sectionFeatureRef}>
                    <h2>More features of Boogaluu</h2>
                    <div className="othersInnerSection">
                        <div className="childs">
                            <p>Available in mobile, tablets, desktop, laptop, etc.</p>
                            <p>
                                Boogaluu is a complete solution for dance and fitness for those who have a wish to become a dancer or fitness instructor to enlighten their journey of dance and fitness from learning to compete with their peers and exhibit their talent to create the milestone.
                            </p>
                            <button className="btn primary-dark" onClick={(e) => history.push('/login')}>Let's explore</button>
                        </div>
                    </div>
                </section>
                <p className={`backToTopBtn ${visibleClass}`} title="back to top" onClick={(e) => scrollToTop(e)}></p>
            </div>
        </div>
    );
}