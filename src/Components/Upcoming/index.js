import React, { useState, useRef, useEffect } from 'react'
import Video from "../Vedio/Video";
import LessonsVideoContainer from '../LessonVideoComponent';
import Lessons from "../../Data/Dummy";
function Upcoming() {

    const [activeCategory, setActiveCategory] = useState(Lessons[0]);

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
                <div className="lesson-wrap">
                    <div className="lessons-vdo-wrap">
                        {activeCategory?.videos.map((activeVideo, index) => {
                            return <LessonsVideoContainer
                                title={activeCategory?.title}
                                desc={activeCategory?.desc} 
                                activeVideosList={activeVideo} 
                                key={index} />
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Upcoming;
