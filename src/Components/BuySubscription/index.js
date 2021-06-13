import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import { useStoreConsumer } from '../../Providers/StateProvider';
import { useHistory } from "react-router-dom";
import { formatDate } from "../../Services/Utils";
import { disableLoginFlow, enableLoginFlow } from "../../Actions/LoginFlow";
import { saveCompetition } from "../../Services/EnrollCompetition.service";
import { enableLoading, disableLoading } from "../../Actions/Loader";
import { SUBSCIPTION_PLANS_MAP } from '../../Constants';
import { FaRupeeSign } from 'react-icons/fa';
import { setActiveSubscription } from "../../Actions/Subscription";

// modal imports
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';

export default function BuySubsription({
    handleClose,
    activeStep,
    proceedForPayment,
    buttonLoadingClass
}) {
    const history = useHistory();
    const { state, dispatch } = useStoreConsumer();
    const loggedInUser = state.loggedInUser;
    const [openDetailsModal, setOpenDetailsModal] = useState(true);
    const subscriptionDetails = state.activeSubscription;
    const competitionDetails = state.activeCompetition;

    const handleModalClose = () => {
        setOpenDetailsModal(false);
        // dispatch(setActiveSubscription(null));
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
            status: 'Submitted'
        }
        console.log(competitionObj)
        saveCompetition(competitionObj).subscribe((response) => {
            dispatch(disableLoading());
            console.log('vdo uploaded for competition suceess');
            dispatch(enableLoginFlow({ type: 'profile-competition' }));
            history.push('/profile');
        })
    }

    const proceedForCompetition = () => {
        if (state.currentLoginFlow === 'competition-subscription') {
            submitForCompetition();
        } else {
            history.push('/competitions');
        }
    }

    const proceedForLessons = () => {
        history.push('/lessons');
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
                        {activeStep === 1 && <div>
                            <div className="subs-details-wrap">
                                <p>
                                    Welcome, we are glad to see you. Now, you can subscribe to our application, and
                                    &npbsp;{SUBSCIPTION_PLANS_MAP[subscriptionDetails?.planType]?.modalMessage}
                                </p>
                                <p className={`planValue ${subscriptionDetails?.planType}`}> Just <i className="rupeeSign"><FaRupeeSign /></i>{subscriptionDetails?.amount} {subscriptionDetails?.plans}</p>
                            </div>
                            {subscriptionDetails.isSubscribed ?
                                <Button variant="contained" color="secondary" onClick={(e) => proceedForCompetition()}>Continue</Button> :
                                <Button variant="contained" color="secondary" className={buttonLoadingClass} onClick={() => proceedForPayment(subscriptionDetails, subscriptionDetails.endsIn2Days ? true : false)}>
                                    {subscriptionDetails.endsIn2Days ? 'Renew' : 'Subscribe'}
                                </Button>
                            }
                        </div>}
                        {activeStep === 2 && <div>
                            <p className="subscriptionMessage success">Subscription Payment Recieved Successfully</p>
                            <div className="actionWrap success">
                                <Button variant="contained" color="secondary" onClick={(e) => proceedForLessons()}>Continue to Lessons</Button>
                                <Button variant="contained" color="secondary" onClick={(e) => proceedForCompetition()}>Continue to competition</Button>
                            </div>
                        </div>}
                        {activeStep === 3 && <div>
                            <p className="subscriptionMessage failed">Subscription Payment Fail</p>
                            <Button variant="contained" color="secondary" onClick={(e) => proceedForPayment(subscriptionDetails, subscriptionDetails.endsIn2Days ? true : false)}>Retry</Button>
                        </div>}
                        {activeStep === 4 && <div>
                            <p className="subscriptionMessage success">You already subscribed to {subscriptionDetails.name} plan</p>
                            <div className="actionWrap success">
                                <Button variant="contained" color="secondary" onClick={(e) => proceedForLessons()}>Continue to Lessons</Button>
                                <Button variant="contained" color="secondary" onClick={(e) => proceedForCompetition()}>Continue to competition</Button>
                            </div>
                        </div>}
                    </div>
                </Fade>
            </Modal>
        </div>
    )
}