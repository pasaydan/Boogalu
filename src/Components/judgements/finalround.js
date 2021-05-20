import React, { useEffect, useState } from 'react';
import Vedio from "../Vedio/Video";
import { enableLoading, disableLoading } from "../../Actions/Loader";
import { sendEmail } from "../../Services/Email.service";
import { Link } from '@material-ui/core';
import { useHistory } from "react-router-dom";
import JudgesLogin from './judgeslogin';
import JudgesPrivacyPolicy from './judgesPrivacyPolicy';

function FinalRound() {
    const history = useHistory();
    // eslint-disable-next-line no-unused-vars
    const {REACT_APP_URL} = process.env;
    // eslint-disable-next-line no-unused-vars
    
    return (
        <div className="judgementWrap">
            {/* <h1>This is Finals</h1> */}
            <JudgesLogin />
        </div>
    )
}

export default FinalRound;
