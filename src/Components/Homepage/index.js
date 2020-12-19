import React from "react";
import Lessons from '../Lessons';
import Competitions from '../Competitions';
import Subscription from '../Subscription';
import "./Homepage.css";

export default function Homepage() {
    return (
        <div className="homepage">
            <div className="banner_img">
                <h1>Dance Classes for Everyone</h1>
                <h4>The world’s best dance learning tools – at your fingertips. Start free for 7 days.</h4>
                <button className="get_started">Get Started</button>
            </div>
            <Lessons />
            <Competitions />
            <Subscription />
        </div>
    );
}