import React, { useEffect, useState } from 'react';
import Vedio from "../Vedio/Video";
import { enableLoading, disableLoading } from "../../Actions/Loader";
import { sendEmail } from "../../Services/Email.service";
import { Link } from '@material-ui/core';
import { useHistory } from "react-router-dom";
import JudgesLogin from './judgeslogin';
import JudgesPrivacyPolicy from './judgesPrivacyPolicy';
import JudgesTermsUse from './judgesTermsOfUse';
import { PRE_JUDGES_USER, PRE_JUDGES_PWD } from '../../Constants';

const checkJudgesLogin = JSON.parse(localStorage.getItem('preJudgesLogin'));

function PreFinalRound() {
    // eslint-disable-next-line no-unused-vars
    const history = useHistory();
    
    const [isJudgesLoggedIn, toggleJudgesLogin] = useState(false);
    const [loginMessage, setLoginMessage] = useState('');
    const [isPrivacyPolicyVisible, togglePrivacyPolicy] = useState(false);
    const [isTermsOfUseVisible, toggleTermsOfUse] = useState(false);
    
    // eslint-disable-next-line no-unused-vars
    const {REACT_APP_URL} = process.env;
    
    useEffect(() => {
        toggleJudgesLogin(checkJudgesLogin);
    }, []);

    function judgesLoginStatus(value) {
        console.log('Value: ', value);
        if (value && (!value?.user && !value?.pwd)) {
            setLoginMessage('Enter username & Password!');
        } else if (value && (value?.user !== PRE_JUDGES_USER || value?.pwd !== PRE_JUDGES_PWD)) {
            setLoginMessage('Enter correct username & Password!');
        } else {
            setLoginMessage('');
            toggleJudgesLogin(true);
            localStorage.setItem('preJudgesLogin', true);
        }
    }

    function shouldShowPrivacyPolicy(action) {
        togglePrivacyPolicy(action);
    }
    
    function shouldShowTermsOfUse(action) {
        toggleTermsOfUse(action);
    }

    return (
        <div className="judgementWrap">
            {
                isJudgesLoggedIn ?
                <h1>Welcome to Competitions judgement Pre-final round</h1>
                : ''
            }
            {
                !isJudgesLoggedIn ?
                <JudgesLogin 
                    message={loginMessage}
                    showPrivacyPolicy={shouldShowPrivacyPolicy}
                    showTermsOfUse={shouldShowTermsOfUse}
                    loginAction={judgesLoginStatus}
                /> : ''
            }

            {
                isPrivacyPolicyVisible ? 
                <JudgesPrivacyPolicy 
                    closeModalBox={shouldShowPrivacyPolicy}
                />
                : ''
            }
            
            {
                isTermsOfUseVisible ? 
                <JudgesTermsUse 
                    closeModalBox={shouldShowTermsOfUse}
                />
                : ''
            }
        </div>
    )
}

export default PreFinalRound;
