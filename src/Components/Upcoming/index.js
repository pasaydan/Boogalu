import React, { useState, useRef, useEffect } from 'react'
import Video from "../Vedio/Video";
import LessonsVideoContainer from '../LessonVideoComponent';
import Lessons from "../../Data/Dummy";
import { useStoreConsumer } from '../../Providers/StateProvider';
import { saveLesson, getLessonByName, getAllLessons } from "../../Services/Lessons.service";
import { enableLoading, disableLoading } from "../../Actions/Loader";
import { NOTIFICATION_ERROR, NOTIFICATION_SUCCCESS } from "../../Constants";
import { displayNotification } from "../../Actions/Notification";

function Upcoming() {

    const { state, dispatch } = useStoreConsumer();
    const loggedInUser = state.loggedInUser;
    const [activeCategory, setActiveCategory] = useState(Lessons[0]);
    const [lessonsData, setLessonsList] = useState(null);
    
    useEffect(() => {
        getAllLessonsData();
    }, []);

    const getAllLessonsData = () => {
        try {
            dispatch(enableLoading());
            getAllLessons().subscribe(lessons => {
                console.log('LESSONS LISTS: ', lessons);
                dispatch(disableLoading());
                if (lessons.length) {
                    setLessonsList(lessons);
                }
            });
        } catch (e) {
            dispatch(disableLoading());
            console.log('Error: ', e);
        }
    }

    return (
        <div className="lessons lessons-wrap" id="upcomingLessons">
            <div className="inner-page">
                <h1>Learn from the Experts</h1>
                <p>
                    Lessons for all users from our expert faculty members.
                    From Hip-Hop to Bharatnatyam. You'll get all learning videos
                    at one place.
                </p>
                <p className="launching-soon">More lessons launching soon! Stay connected!</p>
                {/* <p className="from-our-expert-title">Few sample lessons</p> */}
            </div>
            <div className="lesson-wrap">
                <div className="lessons-vdo-wrap">
                    {lessonsData && lessonsData.length && lessonsData.map((videoData, index) => {
                        return <LessonsVideoContainer
                        title={videoData.name}
                        desc={videoData.desc} 
                        uploadedOn={videoData.uploadedTime}
                        activeVideosList={videoData.videoList}
                        videoId={`lessonVideo-${index + 1}`}
                        key={'lesson-'+index} />
                    })}
                </div>
            </div>
        </div>
    )
}

export default Upcoming;
