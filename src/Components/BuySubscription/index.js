import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import { useStoreConsumer } from '../../Providers/StateProvider';
import { useHistory } from "react-router-dom";
import { formatDate } from "../../Services/Utils";
import { disableLoginFlow, enableLoginFlow } from "../../Actions/LoginFlow";
import { saveCompetition } from "../../Services/EnrollCompetition.service";
import { enableLoading, disableLoading } from "../../Actions/Loader";
import { postOrder, updatePayment } from "./../../Services/Razorpay.service";
import { updateUser } from "../../Services/User.service";
import { loginUser, signupUser } from '../../Actions/User/index';

import boogaluLogo from '../../Images/Boogalu-logo.svg';
// modal imports
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';

export default function BuySubsription({ handleClose, activeStep, alreadySubscribed, fnCallback }) {
    const history = useHistory();
    const { state, dispatch } = useStoreConsumer();
    const loggedInUser = state.loggedInUser;
    const [openDetailsModal, setOpenDetailsModal] = useState(true);
    const subscriptionDetails = state.activeSubscription;
    const [subsciptionValidity, setsubsciptionValidity] = useState(null);
    const [subscription, setSubscription] = useState(null);
    const [buttonLoadingClass, toggleButtonLoading] = useState('');
    const competitionDetails = state.activeCompetition;
    const RAZORPAY_TEST_KEY = process.env.REACT_APP_RAZORPAY_KEY;
    useEffect(() => {
        let validUpto = new Date();
        new Date(validUpto.setDate(validUpto.getDate() + 30));
        let displayDate = formatDate(validUpto, 3);
        setsubsciptionValidity(displayDate);
    }, [subscriptionDetails])

    const handleModalClose = () => {
        setOpenDetailsModal(false);
        dispatch(disableLoginFlow());
        handleClose();
    }

    const submitForCompetition = () => {
        dispatch(enableLoading());
        const competitionObj = {
            compId: competitionDetails.key,
            compName: competitionDetails.name,
            compImg: competitionDetails.img,
            userId: loggedInUser.key,
            vdo: {
                key: competitionDetails.selectedVideo.key,
                title: competitionDetails.selectedVideo.title,
                thumbnail: competitionDetails.selectedVideo.thumbnail,
                url: competitionDetails.selectedVideo.url,
                desc: competitionDetails.selectedVideo.desc,
            },
            ageGroup: competitionDetails.ageGroup,
            status: 'Submited'
        }
        console.log(competitionObj)
        saveCompetition(competitionObj).subscribe((response) => {
            dispatch(disableLoading());
            console.log('vdo uploaded for competition suceess');
            dispatch(enableLoginFlow('profile-competition'));
            history.push('/profile');
        })
    }

    const proceedForCompetition = () => {
        // if (state.loggedInUser && state.loggedInUser.subscribed) {
        if (state.currentLoginFlow == 'competition-subscription') {
            submitForCompetition();
        } else {
            history.push('/competitions');
        }
    }

    const handlerFn = (response) => {
        console.log("response", response);
        updatePayment(response).subscribe((res) => {
            const responseData = res.data;
            // setSubscription(responseData);
            console.log('postOrder response >>>>>', response);
            const userDetails = {
                ...loggedInUser,
                subscribed: true,
                subscribedOn: new Date()
            };
            updateUser(userDetails.key, userDetails).subscribe(() => {

                dispatch(loginUser(userDetails));
                console.log('updateUser userDetails>>>>>> ', userDetails);
                fnCallback(userDetails)
            })
            // toggleButtonLoading('');
        });
    }

    const proceedForPayment = () => {
        toggleButtonLoading('loading');
        const userData = {
            "amount": subscriptionDetails.amount * 100,
            "currency": "INR",
            "receipt": loggedInUser.key
        };
        let subscriptionData = {};
        postOrder(userData, loggedInUser, handlerFn)
            .subscribe((response) => {
                const responseData = response.data;
                setSubscription(responseData);
                console.log('postOrder response >>>>>', response);
                toggleButtonLoading('');
            });
    }

    return (
        <div className="subscription-modal-wrap">
            <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                className='subscription-modal-box'
                open={openDetailsModal}
                onClose={() => handleModalClose(false)}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                }}
                disableEnforceFocus
            >
                <Fade in={openDetailsModal}>
                    <div className="subscription-inner-modal">
                        <IconButton className="close-modal-btn" onClick={() => handleModalClose(false)}>
                            <CloseIcon />
                        </IconButton>
                        <h3>Boogalu Subscription</h3>
                        {activeStep == 1 && <div>
                            <div className="subs-details-wrap">
                                <p>
                                    Welcome, we are glad to see you. Now, you can subscribe to our application, and
                                    get a chance to participate in any competition for one month.
                                </p>
                                <p> Just {subscriptionDetails.amount}/{subscriptionDetails.plans}</p>
                                {/* <div>{subscriptionDetails.name}</div> */}
                                {/* <div>{subscriptionDetails.desc}</div> */}
                                {/* <div>{subscriptionDetails.amount} / {subscriptionDetails.plans}</div> */}
                                {/* <div>Valid Upto- {subsciptionValidity}</div> */}
                            </div>
                            {alreadySubscribed ? 
                                <Button variant="contained" color="secondary" onClick={(e) => proceedForCompetition()}>Continue</Button> : 
                                <Button variant="contained" color="secondary" className={buttonLoadingClass} onClick={(e) => proceedForPayment(e)}>Subscribe</Button>
                                // <a href="#" onClick={(e) => proceedForPayment(e)}> Subscribe </a>
                            }
                        </div>}
                        {activeStep == 2 && <div>
                            <h3>Subscription Payment Recieved Successfully</h3>
                            <Button variant="contained" color="secondary" onClick={(e) => proceedForCompetition()}>Continue to competition</Button>
                        </div>}
                        {activeStep == 3 && <div>
                            <h3>Subscription Payment Fail</h3>
                            <Button variant="contained" color="secondary" onClick={(e) => proceedForPayment(e)}>Retry</Button>
                        </div>}
                    </div>
                </Fade>
            </Modal>
        </div>
    )
}