import React, { useState, useEffect } from 'react';
import CompetitionsDetails from "../CompetitionsDetails";
import { getActiveCompetitionsList } from "../../Services/Competition.service";
import { useStoreConsumer } from '../../Providers/StateProvider';
import { setActiveCompetition } from "../../Actions/Competition";
import { getCompetitionByUserId } from "../../Services/EnrollCompetition.service";
import { enableLoading, disableLoading } from "../../Actions/Loader";
import ImageCarousel from '../ImageCarousel';
import { truncateLargeText } from '../../helpers';
import { disableLoginFlow, enableLoginFlow } from "../../Actions/LoginFlow";
import { loginUser } from "../../Actions/User";
import * as $ from 'jquery';
import { updateUser } from "../../Services/User.service";
import { postOrder, updatePayment } from "./../../Services/Razorpay.service";
import Button from '@material-ui/core/Button';
import { isObjectEmpty } from '../../helpers';
import { useHistory } from "react-router-dom";
const eventsList = require('../../Data/events.json');

function Competitions() {
    const history = useHistory();
    const { state, dispatch } = useStoreConsumer();
    const [eventsData, setEventsData] = useState(eventsList.events);
    const [isOpenDetailsModal, setIsOpenDetailsModal] = useState(false);
    const [CompletitionList, setCompletitionList] = useState(null);
    const [shouldOpenEventModal, toggleEventModal] = useState(false);
    const [clickedEventData, setEventData] = useState(null);
    const [initialStep, setInitialStep] = useState(1);
    const loggedInUser = state.loggedInUser;
    const [buttonLoadingClass, toggleButtonLoading] = useState('');
    const [openPaymentSuccessModal, setOpenPaymentSuccessModal] = useState(false);

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
                })
            } else {
                dispatch(disableLoading());
                setCompletitionList(allCompList);
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
        } else if (state.currentLoginFlow === 'competition-event') {
            eventImageClicked(state.currentLoginFlowData);
            dispatch(disableLoginFlow());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (!isObjectEmpty(loggedInUser)) {
            if (loggedInUser?.events) {
                const eventsDataCopy = [...eventsData];
                eventsDataCopy.map((event) => {
                    let isEventAlreadyRegistered = loggedInUser?.events?.filter((data) => data.type == event.type);
                    if (isEventAlreadyRegistered && isEventAlreadyRegistered?.length != 0) event.isRegistered = true;
                })
                setEventsData(eventsDataCopy);
            }
        }
    }, [loggedInUser])

    const openDetailsModal = (competition) => {
        if (competition.isUserEnrolled) setInitialStep(1);
        dispatch(setActiveCompetition(competition));
        setIsOpenDetailsModal(true);
    }

    function eventImageClicked(event) {
        console.log('event data: ', event);
        if (event?.id) {
            if (!isObjectEmpty(loggedInUser)) {
                setEventData(event);
                toggleEventModal(true);
            } else {
                dispatch(enableLoginFlow({ type: 'competition-event', data: event }));
                history.push({
                    pathname: '/login',
                    state: null
                });
            }
        }
    }

    function closeEventModal(event) {
        event.stopPropagation();
        setEventData(null);
        toggleEventModal(false);
    }

    const afterPaymentResponse = (response) => {
        console.log("response", response);
        try {
            const updatedUserData = {
                ...loggedInUser,
                events: [{
                    id: clickedEventData.id,
                    type: clickedEventData.type,
                    name: clickedEventData.name,
                    paymentDate: new Date()
                }]
            };
            updateUser(updatedUserData.key, updatedUserData).subscribe(() => {
                dispatch(loginUser(updatedUserData));
                toggleEventModal(false);
                setEventData(null);
                setOpenPaymentSuccessModal(true);
                console.log('updateUser updatedUserData>>>>>> ', updatedUserData);

            })
        } catch (e) {
            console.log('Error: ', e);
        }
    }

    const proceedForPayment = () => {
        toggleButtonLoading('loading');
        const userData = {
            "amount": clickedEventData.amount * 100,
            "currency": "INR",
            "receipt": loggedInUser.key
        };

        let orderObj = {};
        orderObj[clickedEventData?.type] = userData;
        try {
            postOrder(orderObj, [clickedEventData?.type], 'Monthly Subscription', loggedInUser, afterPaymentResponse)
                .subscribe((response) => {
                    console.log('postOrder response >>>>>', response);
                    toggleButtonLoading('');
                });
        } catch (e) {
            console.log('Error: ', e);
        }
    }

    return (
        <div className="competition-wrap">
            <ImageCarousel
                carouselData={eventsData}
                imgClickCallback={eventImageClicked}
            />
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
                                    {truncateLargeText(competition.desc, 60)}<br />
                                </span>
                                <span className="otherInfo">
                                    Enrollment open: {competition.startingDate} to {competition.endingDate}<br />
                                </span>
                                {competition.isUserEnrolled ? <span className="enrolledMessage">Already Enrolled</span> : ''}
                            </h2>
                        </li>
                    })}
                </ul>
                {isOpenDetailsModal && <CompetitionsDetails open={isOpenDetailsModal} handleClose={() => setIsOpenDetailsModal(false)} initialStep={initialStep} />}
            </div>
            {
                shouldOpenEventModal && clickedEventData?.id ?
                    <div className="eventDetailModal">
                        <div className="eventDetailInner">
                            <p className="closeModal" onClick={(e) => closeEventModal(e)} />
                            <h3>{clickedEventData.name}</h3>
                            {
                                clickedEventData?.imgUrl ?
                                    <div className="imgWrap">
                                        <img src={clickedEventData.imgUrl} alt={`alt-${clickedEventData.id}`} />
                                    </div> : ''
                            }
                            {
                                clickedEventData?.amount ?
                                    <div className="eventDate registrationFees">
                                        <span>Registration fee: </span>
                                        <span className="value"><i>&#8377;</i> {`${clickedEventData.amount}/-`} only</span>
                                    </div>
                                    : ''
                            }
                            {
                                clickedEventData?.info?.eventDate ?
                                    <div className="eventDate">
                                        <span>Event date: </span>
                                        <span className="value">{new Date(clickedEventData.info.eventDate).toDateString()}</span>
                                    </div>
                                    : ''
                            }
                            {
                                clickedEventData?.info?.registrationLastDate ?
                                    <div className="eventDate">
                                        <span>Registration till: </span>
                                        <span className="value">{new Date(clickedEventData.info.registrationLastDate).toDateString()}</span>
                                    </div>
                                    : ''
                            }
                            {
                                clickedEventData?.info?.rules ?
                                    <div className="eventDate">
                                        <a href={clickedEventData.info.rules} target="_blank" rel="noreferrer" title="Rules and regulations">Terms &amp; rules of event</a>
                                    </div>
                                    : ''
                            }
                            {
                                clickedEventData?.info?.judges && clickedEventData?.info?.judges.length ?
                                    <div className="judgesWrap">
                                        <h3>Our Judges</h3>
                                        {
                                            clickedEventData.info.judges.map((item, index) => {
                                                return (
                                                    <div className="judgesItem" key={`judge-id-${index}`}>
                                                        <p className="name">
                                                            {item.name},
                                                    <span>{item.place}</span>
                                                        </p>
                                                    </div>
                                                )
                                            })
                                        }
                                    </div> : ''
                            }
                            {
                                clickedEventData.isRegistered ?
                                    <p className="btn primary-light registeredInfoBtn">You have already registered</p>
                                    :
                                    <button className="btn primary-dark" className={buttonLoadingClass ? `${buttonLoadingClass} btn primary-dark` : 'btn primary-dark'} onClick={proceedForPayment}>Register &amp; pay {clickedEventData?.amount}/-</button>
                            }
                        </div>
                    </div> : ''
            }

            {
                openPaymentSuccessModal ?
                    <div className="eventDetailModal">
                        <div className="eventDetailInner">
                            <p className="closeModal" onClick={(e) => setOpenPaymentSuccessModal(false)} />
                            <h3>Success !</h3>
                            <div>
                                <p className="subscriptionMessage success">Payment For Event Registration Recieved Successfully</p>
                                <div className="actionWrap success">
                                    <Button variant="contained" color="secondary" onClick={(e) => openPaymentSuccessModal(false)}>Explore competition</Button>
                                </div>
                            </div>
                        </div>
                    </div> : ''
            }
        </div>
    )
}

export default Competitions;
