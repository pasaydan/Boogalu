import React, { useEffect, useContext, useState } from "react";
import Section1 from '../Section1/index';
import "./DashBoard.css";

export default function Dashboard() {
    return (
        <div className="dashboard">
            <Section1 />
        </div>
    );
}