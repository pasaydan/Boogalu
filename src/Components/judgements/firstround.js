import React, { useEffect, useState, useRef } from 'react';
import { sendEmail } from "../../Services/Email.service";
import boogaluLogo from '../../Images/Boogalu-logo.svg';
import { useHistory } from "react-router-dom";
import JudgesLogin from './judgeslogin';
import JudgesPrivacyPolicy from './judgesPrivacyPolicy';
import JudgesTermsUse from './judgesTermsOfUse';
import { PRE_JUDGES_USER, PRE_JUDGES_PWD } from '../../Constants';
import { getCompetitionsList, updateCompetition, getCompetitionsByFilter } from '../../Services/EnrollCompetition.service';
import { getUserById } from '../../Services/User.service';
import RippleLoader from '../RippleLoader';
import VideoPlayer from "../Vedio/Video";
import { getYearDifferenceInTwoDates } from '../../helpers';

const checkJudgesLogin = JSON.parse(localStorage.getItem('preJudgesLogin'));
const checkPreRulesRead = JSON.parse(localStorage.getItem('preJudgeRules'));

function PreFinalRound() {
    // eslint-disable-next-line no-unused-vars
    const history = useHistory();
    
    const [isJudgesLoggedIn, toggleJudgesLogin] = useState(false);
    const [loginMessage, setLoginMessage] = useState('');
    const [isPrivacyPolicyVisible, togglePrivacyPolicy] = useState(false);
    const [isTermsOfUseVisible, toggleTermsOfUse] = useState(false);
    const [shouldEnableVideoList, enableVideoLists] = useState(false);
    const [isVideosLoading, toggleRippleLoader] = useState(false);
    const [compeitionListData, setComptitionList] = useState([]);
    const [messageHandler, handleDataFectchMessages] = useState('');
    const [selectOrRejection, toggleSelectionRejectionText] = useState('');
    const [videoActionSelection, setVideoActionValue] = useState('');
    const [isVideoActionModalOpen, toggleVideoActionModal] = useState(false);
    const [contestantName, setContestantName] = useState('');
    const [competionForAction, setCompetitionActionValue] = useState(null);
    const [isFiltersVisible, toggleFilterVisibility] = useState(false);
    const [filterBtnElements, setFilterBtns] = useState(null);

    const selectBtnRef = useRef(null);
    const rejectBtnRef = useRef(null);
    const submitBtnRef = useRef(null);
    const contestantCommentRef = useRef(null);
    
    // eslint-disable-next-line no-unused-vars
    const {REACT_APP_URL} = process.env;
    
    useEffect(() => {
        toggleJudgesLogin(checkJudgesLogin);
        if (checkPreRulesRead) {
            enableVideoLists(true);
            getEnrolledCompetitionList();
        }
    }, []);

    function judgesLoginStatus(value) {
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

    function showCompetitionVideos(event) {
        event.stopPropagation();
        localStorage.setItem('preJudgeRules', true);
        enableVideoLists(true);
        getEnrolledCompetitionList();
    }
    
    function getEnrolledCompetitionList() {
        toggleRippleLoader(true);
        try {
            getCompetitionsList().subscribe(response => {
                if (response.length) {
                    const compList = [];
                    response.forEach( item => {
                        getUserById(item.userId).subscribe( resp => {
                            const compObj = {
                                ...item,
                                userDetails: JSON.parse(JSON.stringify(resp))
                            };
                            compList.push(compObj);
                            if (compList.length === response.length) {
                                toggleRippleLoader(false);
                                toggleFilterVisibility(true);
                                setComptitionList(compList);
                                const filterBtns = document.querySelectorAll('.js-filterBtn');
                                setFilterBtns(filterBtns);
                            }
                        });
                    });
                } else {
                    toggleRippleLoader(false);
                    handleDataFectchMessages('There are no videos uploaded for competition by Users!');
                }
            });
        } catch(e) {
            toggleRippleLoader(false);
            handleDataFectchMessages('Oops! something went wrong, please try in sometime!');
            console.log('Competition list error: ', e);
        }
    }

    function getEnrolledCompetitionsByFilter(event, filterValue) {
        event.stopPropagation();
        if (filterBtnElements && filterBtnElements.length) {
            filterBtnElements.forEach( item => {
                if (item.classList.contains('active')) {
                    item.classList.remove('active');
                }
            });
        }
        event.target.classList.add('active');
        if (filterValue === 'all') {
            getEnrolledCompetitionList();
        } else {
            toggleRippleLoader(true);
            try {
                getCompetitionsByFilter(filterValue).subscribe(response => {
                    if (response.length) {
                        const compList = [];
                        response.forEach( item => {
                            getUserById(item.userId).subscribe( resp => {
                                const compObj = {
                                    ...item,
                                    userDetails: JSON.parse(JSON.stringify(resp))
                                };
                                compList.push(compObj);
                                if (compList.length === response.length) {
                                    toggleRippleLoader(false);
                                    setComptitionList(compList);
                                }
                            });
                        });
                    } else {
                        toggleRippleLoader(false);
                        handleDataFectchMessages('There are no competition videos matching the filter applied, change filter & try!');
                    }
                });
            } catch(e) {
                toggleRippleLoader(false);
                handleDataFectchMessages('Oops! something went wrong, please try in sometime!');
                console.log('Competition filter error: ', e);
            }
        }
    }

    function toggleUserVideoSelection(event, action) {
        event.stopPropagation();
        if (action && action === 'select') {
            if (selectBtnRef.current && rejectBtnRef.current) {
                rejectBtnRef.current.classList.remove('active');
                selectBtnRef.current.classList.add('active');
                if (submitBtnRef.current && submitBtnRef.current.disabled) {
                    submitBtnRef.current.disabled = false;
                }
                setVideoActionValue('Selected');
                toggleSelectionRejectionText('Selection');
            }
        } else {
            if (selectBtnRef.current && rejectBtnRef.current) {
                selectBtnRef.current.classList.remove('active');
                rejectBtnRef.current.classList.add('active');
                if (submitBtnRef.current && submitBtnRef.current.disabled) {
                    submitBtnRef.current.disabled = false;
                }
                setVideoActionValue('Rejected');
                toggleSelectionRejectionText('Rejection');
            }
        }
    }

    function submitActionSelection(event) {
        event.stopPropagation();
        if (videoActionSelection && competionForAction?.key) {
            competionForAction.status = videoActionSelection; 
            if (contestantCommentRef.current && contestantCommentRef.current.value) {
                competionForAction['judgesComment'] = contestantCommentRef.current.value;
            }
            if (submitBtnRef.current) {
                submitBtnRef.current.classList.add('loading');
            }
            try {
                updateCompetition(competionForAction.key, competionForAction).subscribe(resp => {
                    console.log('update enrolled comp: ', resp);
                    toggleVideoActionModal(false);
                    if (submitBtnRef.current) {
                        submitBtnRef.current.classList.remove('loading');
                    }
                });
            } catch(e) {
                console.log('update enrolled comp error: ', e);
                toggleVideoActionModal(false);
                if (submitBtnRef.current) {
                    submitBtnRef.current.classList.remove('loading');
                }
            }
        }
    }

    function toggleActionModalBox(compItem) {
        toggleSelectionRejectionText('');
        setContestantName('');
        setCompetitionActionValue(null);
        toggleVideoActionModal(!isVideoActionModalOpen);
        setTimeout(() => {
            if (submitBtnRef.current) {
                submitBtnRef.current.disabled = true;
            }
        }, 1);
        if (compItem) {
            const userFirstName = `${compItem?.userDetails?.name?.split(' ')[0]}'s`;
            setContestantName(userFirstName);
            setCompetitionActionValue(compItem);
        }
    }

    return (
        <div className="judgementWrap">
            {
                isVideoActionModalOpen ? 
                <div className="videoActionsWrap">
                    <div className="actionsBox">
                        <h2>What do you want to do with {contestantName} performance?</h2>
                        <p className="closeModalLink" title="Close modal" onClick={() => toggleActionModalBox(null)}></p>
                        <button className="mainActionBtn select" ref={selectBtnRef} onClick={(e) => toggleUserVideoSelection(e, 'select')}>Select</button>
                        <button className="mainActionBtn reject" ref={rejectBtnRef} onClick={(e) => toggleUserVideoSelection(e, 'reject')}>Reject</button>
                        <textarea className="comments" 
                            ref={contestantCommentRef}
                            placeholder={`Comments ${selectOrRejection ? 'for' : ''} ${selectOrRejection}`}></textarea>
                        <button className="btn mainActionBtn submitBtn" ref={submitBtnRef} onClick={(e) => submitActionSelection(e)}>Submit</button>
                    </div>
                </div> : ''
            }
            {
                isJudgesLoggedIn ?
                <div className="compeitionsVideoAndRules">
                    <a href="/" className="logo" title="Back to Home">
                        <img src={boogaluLogo} alt="Boogalu" />
                    </a>
                    <h1>Welcome to Competitions judgement Pre-final round</h1>
                    <div className={`innerContentBox ${shouldEnableVideoList ? 'videoListInnerContent' : ''}`}>
                        {
                            !shouldEnableVideoList ? 
                            <div className="rulesBox">
                                <h2>Rules of Judging</h2>
                                <p className="paraTexts">
                                    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
                                </p>
                                <p className="paraTexts">
                                    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
                                </p>
                                <button className="btn" onClick={(e) => showCompetitionVideos(e)}>Agreed &amp; continue</button>
                            </div> :
                            <div className="videoListBox">
                                {
                                    isFiltersVisible ?
                                    <div className="filters">
                                        <p className="filterTitle">Filter by: </p>
                                        <div className="filtersBtn">
                                            <button className="btn primary-light js-filterBtn" onClick={(e) => getEnrolledCompetitionsByFilter(e, 'all')}>All</button>
                                            <button className="btn primary-light js-filterBtn" onClick={(e) => getEnrolledCompetitionsByFilter(e, 'Submitted')}>Submitted</button>
                                            <button className="btn primary-light js-filterBtn" onClick={(e) => getEnrolledCompetitionsByFilter(e, 'Selected')}>Selected</button>
                                            <button className="btn primary-light js-filterBtn" onClick={(e) => getEnrolledCompetitionsByFilter(e, 'Rejected')}>Rejected</button>
                                        </div>
                                    </div> : ''
                                }
                                {
                                    isVideosLoading ?
                                    <RippleLoader />
                                    : 
                                    compeitionListData && compeitionListData.length ?
                                    compeitionListData.map((item, index) => {
                                        return (
                                            <div className="competitionBox" key={`comp-box-${index}`}>
                                                <p className={`compTitle ${item?.status.toLowerCase()}`}>
                                                    <span className="name">{item?.compName}</span>
                                                    <span className="status">{item?.status}</span>
                                                </p>
                                                <div className="videoWrap">
                                                    <VideoPlayer vdoObj={item.vdo} />
                                                </div>
                                                <div className="userVideoDetails">
                                                    <span className="innerValues ageGroup">Age criteria: {item.ageGroup}</span>
                                                    <span className="innerValues userName">Contestant Name: {item?.userDetails?.name}</span>
                                                    <span className="innerValues userAge">Age: {getYearDifferenceInTwoDates(new Date(), new Date(item?.userDetails?.dob))} years old</span>
                                                    <button className="videoActionBtn" title="Video actions" onClick={() => toggleActionModalBox(item)}><span></span></button>
                                                </div>
                                            </div>
                                        )
                                    }) : ''
                                }

                                {
                                    messageHandler ? 
                                    <p className="messageHandlingBox">
                                        {messageHandler}
                                    </p>: ''
                                }
                            </div>
                        }
                    </div>
                </div>
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
