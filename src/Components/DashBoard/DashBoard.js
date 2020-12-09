import React, { useEffect, useContext, useState } from "react";
import Section1 from '../Section1/index';
import Section2 from "../Section2";
import "./DashBoard.css";
import Subscription from "../Subscription";

export default function Dashboard() {
    return (
        <div className="dashboard">
            <Section1 />
            <Section2 />
            <Subscription />
        </div>
    );
}