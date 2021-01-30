import React, { useState, useEffect } from 'react'
import { useHistory } from "react-router-dom";
import { useStoreConsumer } from '../../Providers/StateProvider';
import { getActiveSubscriptionsList } from "../../Services/Subscription.service";
import { setActiveSubscription } from "../../Actions/Subscription";
import BuySubscription from "../BuySubscription";
import { enableLoginFlow, disableLoginFlow } from "../../Actions/LoginFlow";
import { saveUserSubscription } from "../../Services/User.service";
import { loginUser } from "../../Actions/User";

function Subscriptions() {
    const { state, dispatch } = useStoreConsumer();
    const history = useHistory();
    const loggedInUser = state.loggedInUser;
    const [AvailableSubscriptions, setAvailableSubscriptions] = useState([]);
    const [showSubscriptionDetails, setShowSubscriptionDetails] = useState(false);
    const [activeStep, setActiveStep] = useState(1);

    // check for payment status if user is in payment flow
    useEffect(() => {
        if (history.location.search && history.location.search.includes('status')) {
            let paymentStatus = history.location.search.split('status=')[1];
            if (paymentStatus == 'success') {
                const subscriptionSuccessObj = {
                    subId: state.activeSubscription.key,
                    type: state.activeSubscription.type,
                    subscribedAt: new Date()
                }
                let loggedInUserData = { ...loggedInUser };
                if (loggedInUserData.subscriptions) loggedInUserData.subscriptions.push(subscriptionSuccessObj)
                else (loggedInUserData.subscriptions = [subscriptionSuccessObj]);

                saveUserSubscription(state.activeSubscription.key, loggedInUserData).subscribe((response) => {
                    dispatch(loginUser(loggedInUserData));
                    setShowSubscriptionDetails(true);
                    setActiveStep(2);
                });
            } else {
                // payment failure
                setShowSubscriptionDetails(true);
                setActiveStep(3)
            }
            history.push('/subscription');
        }
    }, [])


    useEffect(() => {
        getActiveSubscriptionsList().subscribe((subscriptionsList) => {
            setAvailableSubscriptions(subscriptionsList);
            console.log(subscriptionsList);
        })
        if (state.currentLoginFlow == 'subscription') {
            dispatch(disableLoginFlow());
            setShowSubscriptionDetails(true);
        }
    }, [])

    const setSubscription = (subscription) => {
        dispatch(setActiveSubscription(subscription));
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
                            </div>
                        })}
                    </div>
                </div>
            </div>
            {showSubscriptionDetails && <BuySubscription handleClose={() => setShowSubscriptionDetails(false)} activeStep={activeStep} />}
        </div>
    )
}

export default Subscriptions
