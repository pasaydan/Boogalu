import React, { useState, useEffect } from 'react'
import { useHistory } from "react-router-dom";
import { useStoreConsumer } from '../../Providers/StateProvider';
import { getActiveSubscriptionsList } from "../../Services/Subscription.service";
import { setActiveSubscription } from "../../Actions/Subscription";
import BuySubscription from "../BuySubscription";
import { enableLoginFlow, disableLoginFlow } from "../../Actions/LoginFlow";
import { saveUserSubscription } from "../../Services/User.service";
import { loginUser } from "../../Actions/User";
import { SUBSCRIPTION_ACTIVE_STATUS, ADMIN_EMAIL_STAGING } from "../../Constants";
import { enableLoading, disableLoading } from "../../Actions/Loader";
import { sendEmail } from "../../Services/Email.service";

function Subscriptions() {
    const { state, dispatch } = useStoreConsumer();
    const history = useHistory();
    const loggedInUser = state.loggedInUser;
    const activeStepCount = loggedInUser && loggedInUser.subscribed ? 2 : 1;
    const [AvailableSubscriptions, setAvailableSubscriptions] = useState([]);
    const [showSubscriptionDetails, setShowSubscriptionDetails] = useState(false);
    const [activeStep, setActiveStep] = useState(activeStepCount);
    const [alreadySubscribed, setAlreadySubscribed] = useState(false)
    console.log(" loggedInUser >>>>>", loggedInUser)
    const sendEmailToAdmin = () => {
        let emailBody = `<div>
            <h6 style="font-size: 17px;margin-bottom: 26px;">User subscribed for ${state.activeSubscription.name}</h6>
            <h4>User details -</h4>
            <h6>${loggedInUser.name}</h6>
            <h6>${loggedInUser.email}</h6>
            <h6>${loggedInUser.phone}</h6>
            </div>`;
        let payload = {
            mailTo: ADMIN_EMAIL_STAGING,
            title: 'User subscribed',
            content: emailBody
        }
        sendEmail(payload).subscribe((res) => {
            if (!('error' in res)) {
                console.log('Admin Email Send Successfully.');
            } else console.log('Admin Email Send Failed.');
        })
    }

    const sendEmailToUser = () => {
        let emailBody = `<div>
            <p><span >Congratulations</span>  <strong>${loggedInUser.name}</strong>, 
            you have subscribed to our 1-month subscription. Now, you can enroll in any active competitions for a month.</p>
            <h4>Time To Express Your Talent on Our Platform during this Lockdown</h4>`;
        let payload = {
            mailTo: loggedInUser.email,
            title: 'Boogalu subscription successfull',
            content: emailBody
        }
        sendEmail(payload).subscribe((res) => {
            if (!('error' in res)) {
                console.log('Email to user Send Successfully.');
            } else console.log('Email to user Send Failed.');
        })
    }
    // check for payment status if user is in payment flow
    useEffect(() => {
        dispatch(enableLoading());
        if (history.location.search && history.location.search.includes('status')) {
            getActiveSubscriptionsList().subscribe((subscriptionsList) => {
                setAvailableSubscriptions(subscriptionsList);
                dispatch(disableLoading());
                console.log(subscriptionsList);
            })
            let paymentStatus = history.location.search.split('status=')[1];
            if (paymentStatus == 'success') {
                const subscriptionSuccessObj = {
                    subId: state.activeSubscription.key,
                    type: state.activeSubscription.type,
                    status: SUBSCRIPTION_ACTIVE_STATUS, // current subscription status Active or Ended
                    subscribedAt: new Date()
                }
                let loggedInUserData = { ...loggedInUser };
                if (loggedInUserData.subscriptions) loggedInUserData.subscriptions.push(subscriptionSuccessObj)
                else (loggedInUserData.subscriptions = [subscriptionSuccessObj]);

                dispatch(enableLoading());
                saveUserSubscription(state.activeSubscription.key, loggedInUserData).subscribe((response) => {
                    sendEmailToAdmin();
                    sendEmailToUser();
                    dispatch(loginUser(loggedInUserData));
                    setShowSubscriptionDetails(true);
                    dispatch(disableLoading());
                    setActiveStep(2);
                });
            } else {
                // payment failure
                setShowSubscriptionDetails(true);
                setActiveStep(3)
            }
            history.push('/subscription');
        } else {
            getActiveSubscriptionsList().subscribe((subscriptionsList) => {
                setAvailableSubscriptions(subscriptionsList);
                dispatch(disableLoading());
                console.log(subscriptionsList);
                //if user come from competition details 
                if (state.currentLoginFlow == 'competition-subscription') {
                    let subscriptionForCompetition = subscriptionsList.filter((data) => data.type === 'competition-enrollment');
                    dispatch(setActiveSubscription(subscriptionForCompetition[0]));
                    setActiveStep(activeStepCount);
                    setShowSubscriptionDetails(true);
                }
            })
            //is user go to login flow from itself(current page)
            if (state.currentLoginFlow == 'subscription') {
                dispatch(disableLoginFlow());
                setShowSubscriptionDetails(true);
            }
        }
    }, [])

    useEffect(() => {
        // let isSubscribed = loggedInUser?.subscriptions?.filter((data) => data.type === 'competition-enrollment');
        let loggedInUser = state.loggedInUser && state.loggedInUser.subscribed ? true : false
        setAlreadySubscribed(loggedInUser);
    }, [state.loggedInUser])

    const setSubscription = (subscription) => {
        dispatch(setActiveSubscription(subscription));
        setActiveStep(activeStepCount);
        if (loggedInUser.name && loggedInUser.phone && loggedInUser.username) {
            setShowSubscriptionDetails(true);
        } else {
            dispatch(enableLoginFlow('subscription'));
            history.push({
                pathname: '/login',
                state: null
            })
        }
    }


    const fnCallbackFromBuySubscription = (userDetails) => {
        // console.log("fnCallbackFromBuySubscription", userDetails);
        if (userDetails.subscribed) {
            setActiveStep(2);
            setAlreadySubscribed(true);
            sendEmailToUser();
        }
    }

    return (
        <div className="subscription subscription-outer charcoal-bg">
            <div id="Subscription" className="charcoal-bg">
                <div className="flex-container-VC subscription-wrap charcoal-bg">
                    <div className="flex-3 heading-content">
                        <h1>Unlimited Classes For The Price Of One</h1>
                        <div className="line1">Dance to the music that makes YOU want to move at any skill level.</div>
                    </div>
                    <div className="inner-plans-wrap">
                        {AvailableSubscriptions && AvailableSubscriptions.map((subscription) => {
                            return <div className="flex-2 plan" onClick={() => setSubscription(subscription)} key={subscription.key}>
                                <div className="plan_tag">{subscription.name}</div>
                                <div className="plan_price">@{subscription.amount}<span>{subscription.plans}</span></div>
                                <div className="plan_tag">{subscription.desc}</div>
                                {alreadySubscribed && <div>Alredy subscribed</div>}
                            </div>
                        })}
                    </div>
                </div>
            </div>
            {showSubscriptionDetails && <BuySubscription handleClose={() => setShowSubscriptionDetails(false)} activeStep={activeStep} alreadySubscribed={alreadySubscribed} fnCallback={fnCallbackFromBuySubscription}/>}
        </div>
    )
}

export default Subscriptions
