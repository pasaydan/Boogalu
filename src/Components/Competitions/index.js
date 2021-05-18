import React, { useState, useEffect } from 'react';
import CompetitionsDetails from "../CompetitionsDetails";
import { getActiveCompetitionsList } from "../../Services/Competition.service";
import { useStoreConsumer } from '../../Providers/StateProvider';
import { setActiveCompetition } from "../../Actions/Competition";
import { disableLoginFlow } from "../../Actions/LoginFlow";
import { getCompetitionByUserId } from "../../Services/EnrollCompetition.service";
import { enableLoading, disableLoading } from "../../Actions/Loader";
import ImageCarousel from '../ImageCarousel';
import { truncateLargeText } from '../../helpers';
import * as $ from 'jquery';

function Competitions() {
    const { state, dispatch } = useStoreConsumer();
    const [isOpenDetailsModal, setIsOpenDetailsModal] = useState(false);
    const [CompletitionList, setCompletitionList] = useState(null);
    const [initialStep, setInitialStep] = useState(1);
    const loggedInUser = state.loggedInUser;

    const prepareUserCompData = (allCompList) => {
        return new Promise((res, rej) => {
            getCompetitionByUserId(loggedInUser.key).subscribe((userCompList) => {
                dispatch(disableLoading());
                if (userCompList.length) {
                    allCompList.forEach((compDetails) => {
                        let isUserEnrolled = userCompList.filter((userCompData) => userCompData.compId === compDetails.key);
                        if (isUserEnrolled.length) {
                            compDetails.isUserEnrolled = true;
                            compDetails.userSubmitedDetails = isUserEnrolled[0];
                        }
                    })
                    res(allCompList);
                } else res(allCompList);
            });
        })
    }

    useEffect(() => {
        $('html,body').animate({
            scrollTop: 0
        }, 700);
        dispatch(enableLoading());
        getActiveCompetitionsList().subscribe(allCompList => {
            if (allCompList.length && loggedInUser.email && loggedInUser.phone) {
                // get user submitted competition details
                prepareUserCompData(allCompList).then((compListWithUserData) => {
                    setCompletitionList(compListWithUserData);
                    // if (state.currentLoginFlow === 'profile-competition') {
                    //     // if user come from profile page by clicking upload for competition
                    //     dispatch(setActiveCompetition(compListWithUserData[0]));
                    //     setIsOpenDetailsModal(true);
                    //     setInitialStep(1);
                    // }
                })
            } else {
                dispatch(disableLoading());
                setCompletitionList(allCompList);
                // if (state.currentLoginFlow === 'profile-competition') {
                //     // if user come from profile page by clicking upload for competition
                //     dispatch(setActiveCompetition(allCompList[0]));
                //     setIsOpenDetailsModal(true);
                //     setInitialStep(1);
                // }
            }
        });
        // if user come from login page
        if (state.currentLoginFlow === 'competition') {
            dispatch(disableLoginFlow());
            setIsOpenDetailsModal(true);
            if (loggedInUser.subscriptions) {
                let isSubscribed = loggedInUser.subscriptions.filter((data) => data.type === 'competition-enrollment');
                if (isSubscribed.length) setInitialStep(3);
                else setInitialStep(1);
            } else setInitialStep(1);
        } else if (state.currentLoginFlow === 'competition-subscription') {
            // if user come from subscription page
            dispatch(disableLoginFlow());
            setIsOpenDetailsModal(true);
            setInitialStep(1);
        } else if (state.currentLoginFlow === 'competition-uploadvdo') {
            // if user come from vdoUpload page
            dispatch(disableLoginFlow());
            setIsOpenDetailsModal(true);
            setInitialStep(3);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const openDetailsModal = (competition) => {
        if (competition.isUserEnrolled) setInitialStep(1);
        dispatch(setActiveCompetition(competition));
        setIsOpenDetailsModal(true);
    }

    return (
        <div className="competition-wrap">
            <ImageCarousel />
            <div className="competition-inner">
                <div className="title-wrap">
                    <h1>Our Active Competition</h1>
                    <div className="competition-desc">Participate in different competitions &amp; win exciting prizes.</div>
                </div>
                <ul className="competition-list" >
                    {CompletitionList && CompletitionList.map((competition) => {
                        return <li key={competition.name + '-id'} onClick={() => openDetailsModal(competition)}>
                            {
                                competition.type && competition.type === 'upcoming' ?
                                <span className="upcomingLabel">Upcoming</span> : ''
                            }
                            <img src={competition.img} alt={competition.name} />
                            <h2>
                                <span className="title">
                                    {competition.name}
                                </span>
                                <span className="otherInfo">
                                    {truncateLargeText(competition.desc, 60)}<br/>
                                </span>
                                <span className="otherInfo">
                                    Enrollment open: {competition.startingDate} to {competition.endingDate}<br/>
                                </span>
                                {competition.isUserEnrolled ? <span className="enrolledMessage">Already Enrolled</span> : ''}
                            </h2>
                        </li>
                    })}
                </ul>

                {isOpenDetailsModal && <CompetitionsDetails open={isOpenDetailsModal} handleClose={() => setIsOpenDetailsModal(false)} initialStep={initialStep} />}
            </div>
        </div>
    )
}

export default Competitions;
