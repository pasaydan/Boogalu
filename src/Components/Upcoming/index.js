import React, { useState, useRef, useEffect } from 'react'
import LessonsCategories from '../../Data/LessonsCategory';
import Video from "../Vedio/Video";
import LessonsVideoContainer from '../LessonVideoComponent';

function Upcoming () {
    const [activeCategory, setActiveCategory] = useState(LessonsCategories[0]);
    return (
        <div className="lessons lessons-wrap" id="upcomingLessons">
            <div className="inner-page">
                <h1>Learn from the Experts</h1>
                <p>
                    Lessons for all users from our expert faculty members.
                    From Hip-Hop to Bharatnatyam. You'll get all learning videos
                    at one place.
                </p>
                <p className="launching-soon">Videos launching soon! Stay connected!</p>
                <p className="from-our-expert-title">Few sample lessons</p>
                <div className="lessons-vdo-wrap">
                    <LessonsVideoContainer />
                    {/* {activeCategory.upcoming.map((item, index) => {
                        return <Video key={'upcoming-'+index} vdoObj={item}></Video>
                    })} */}
                </div>
            </div>
        </div>
    )
}

export default Upcoming;
