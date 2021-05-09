import React, { useState, useRef, useEffect } from 'react';
import LessonsVideoContainer from '../LessonVideoComponent';
import Lessons from "../../Data/Dummy";
import { useStoreConsumer } from '../../Providers/StateProvider';
import { getAllLessons, getLessonByPlanType } from "../../Services/Lessons.service";
import { enableLoading, disableLoading } from "../../Actions/Loader";
import { getParameterByName } from '../../helpers';

function Upcoming() {

    const { state, dispatch } = useStoreConsumer();
    const loggedInUser = state.loggedInUser;
    const [activeCategory, setActiveCategory] = useState(Lessons[0]);
    const [lessonsData, setLessonsList] = useState(null);
    const [filterEmptyMessage, setFilterEmptyMessage] = useState('');
    const [lessonsSubHeading, setLessonSubHeading] = useState('');
    const [isDataPresentAndFilterApplied, toggleFilterOptionVisiblity] = useState(false);

    const allFilterBtnRef = useRef();
    const freeFilterBtnRef = useRef();
    const paidFilterBtnRef = useRef();
    const proFilterBtnRef = useRef();
    const premiumFilterBtnRef = useRef();

    useEffect(() => {
        let filterParam = getParameterByName('filter', window.location.href);
        if (filterParam && filterParam.length) {
            filterParam = filterParam.toLocaleLowerCase();
            filterLesson(null, filterParam);
        } else {
            if (allFilterBtnRef.current) {
                allFilterBtnRef.current.classList.add('active');
            }
            getAllLessonsData();
        }
    }, []);

    const getAllLessonsData = (from) => {
        try {
            dispatch(enableLoading());
            getAllLessons().subscribe(lessons => {
                dispatch(disableLoading());
                toggleFilterOptionVisiblity(true);
                const filterBtns = document.querySelectorAll('.js-filterWrap')[0].querySelectorAll('button');
                if (filterBtns.length) {
                    filterBtns.forEach( item => {
                        if (item.classList.contains('active')) {
                            item.classList.remove('active');
                        }
                    });
                }
                if (allFilterBtnRef.current) {
                    allFilterBtnRef.current.classList.add('active');
                }
                
                if (from && from === 'filters') {
                    window.history.replaceState(null, null, `?filter=all`);   
                }

                if (lessons.length) {
                    toggleFilterOptionVisiblity(true);
                    setLessonsList(lessons);
                    setLessonSubHeading('Learn from the experts and many dance forms!');
                } else {
                    setLessonSubHeading('Lessons video launching soon, stay connected!');
                }
            });
        } catch (e) {
            dispatch(disableLoading());
            console.log('Error: ', e);
        }
    }

    function filterLesson(event, filter) {
        if (event) {
            event.stopPropagation();
        }
        if (filter === 'all') {
            getAllLessonsData('filters');
        } else {
            try {
                dispatch(enableLoading());
                getLessonByPlanType(filter === 'startup' ? 'paid' : filter).subscribe(lessons => {
                    dispatch(disableLoading());
                    toggleFilterOptionVisiblity(true);
                    const filterBtns = document.querySelectorAll('.js-filterWrap')[0].querySelectorAll('button');
                    if (filterBtns.length) {
                        filterBtns.forEach( item => {
                            if (item.classList.contains('active')) {
                                item.classList.remove('active');
                            }
                        });
                    }
                    if (event) {
                        event.target.classList.add('active');
                        window.history.replaceState(null, null, `?filter=${filter}`);
                    } else {
                        switch (filter) {
                            case 'all':     if (allFilterBtnRef.current) {
                                                allFilterBtnRef.current.classList.add('active');
                                            }
                                            break;
            
                            case 'startup': if (paidFilterBtnRef.current) {
                                                paidFilterBtnRef.current.classList.add('active');
                                            }
                                            break;
            
                            case 'premium': if (premiumFilterBtnRef.current) {
                                                premiumFilterBtnRef.current.classList.add('active');
                                            }
                                            break;
                            
                            case 'free':    if (freeFilterBtnRef.current) {
                                                freeFilterBtnRef.current.classList.add('active');
                                            }
                                            break;
                            
                            case 'pro':     if (proFilterBtnRef.current) {
                                                proFilterBtnRef.current.classList.add('active');
                                            }
                                            break;
                            
                            default: break;
                        }
                    }
                    if (lessons.length) {
                        setLessonsList(lessons);
                    } else {
                        setLessonsList([]);
                        switch (filter) {
                            case 'startup': setFilterEmptyMessage("Sorry, there is no Startup lessons currently available. Please try another filters!");
                                            break;

                            case 'premium': setFilterEmptyMessage("Sorry, there is no Premium lessons currently available. Please try another filters!");
                                            break;
                            
                            case 'free':    setFilterEmptyMessage("Sorry, there is no Free lessons currently available. Please try another filters!");
                                            break;
                            
                            case 'pro':     setFilterEmptyMessage("Sorry, there is no Pro lessons currently available. Please try another filters!");
                                            break;
                            
                            default: break;
                        }
                    }
                });
            } catch (e) {
                dispatch(disableLoading());
                console.log('Error: ', e);
            }
        }
    }

    return (
        <div className="lessons lessons-wrap" id="upcomingLessons">
            <div className="inner-page">
                <h1>Learn from the Experts</h1>
                {/* <p>
                    Lessons for all users from our expert faculty members.
                    From Hip-Hop to Bharatnatyam. You'll get all learning videos
                    at one place.
                </p>  */}
                {
                    lessonsData && lessonsData.length ?
                    <p className="launching-soon">Our recent lessons!</p>
                    : <p className="launching-soon">
                        {lessonsSubHeading}
                    </p>
                }
            </div>
            
            <div className="lesson-wrap">
                {
                    isDataPresentAndFilterApplied ?
                    <div className="filterWrap js-filterWrap">
                        <button ref={allFilterBtnRef} className="btn primary-dark active" onClick={(e) => filterLesson(e, 'all')}>All</button>
                        <button ref={freeFilterBtnRef} className="btn primary-dark" onClick={(e) => filterLesson(e, 'free')}>Free</button>
                        <button ref={paidFilterBtnRef} className="btn primary-dark" onClick={(e) => filterLesson(e, 'startup')}>Startup</button>
                        <button ref={proFilterBtnRef} className="btn primary-dark" onClick={(e) => filterLesson(e, 'pro')}>Pro</button>
                        <button ref={premiumFilterBtnRef} className="btn primary-dark" onClick={(e) => filterLesson(e, 'premium')}>Premium</button>
                    </div> : ''
                }
                <div className="lessons-vdo-wrap">
                    {lessonsData && lessonsData.length ? lessonsData.map((videoData, index) => {
                        return <LessonsVideoContainer
                        title={videoData.name}
                        artist={videoData.teacher}
                        desc={videoData.desc}
                        videoUserLevel={videoData?.expertiseLevel}
                        artForm={videoData?.artForm}
                        isPaid={videoData.accessbility}
                        uploadedOn={videoData.uploadedTime}
                        thumbNail={videoData.thumbnailImage}
                        activeVideosList={videoData.videoList}
                        videoId={`lessonVideo-${index + 1}`}
                        key={'lesson-'+index} />
                    }) : 
                        filterEmptyMessage && filterEmptyMessage.length ?
                            <p className="emptyLessonsFilterMessage">
                                {filterEmptyMessage}
                            </p>
                        : 
                            ''
                    }
                </div>
            </div>
        </div>
    )
}

export default Upcoming;
