import React from "react";
import Section1 from '../Section1';
import Section2 from '../Section2';
import Subscription from '../Subscription';
import "./Homepage.css";

export default function Homepage() {
    return (
        <div className="homepage">
            <Section1 />
            <Section2 />
            <Subscription />
        </div>
    );
}