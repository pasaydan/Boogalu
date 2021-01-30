import React, { useState, useEffect } from 'react'
import { useHistory } from "react-router-dom";
import { useStoreConsumer } from '../../Providers/StateProvider';
import { getActiveSubscriptionsList } from "../../Services/Subscription.service";
import { setActiveSubscription } from "../../Actions/Subscription";
import BuySubscription from "../BuySubscription";
import { enableLoginFlow, disableLoginFlow } from "../../Actions/LoginFlow";

function Subscriptions() {
    const { state, dispatch } = useStoreConsumer();
    const history = useHistory();
    const loggedInUser = state.loggedInUser;
    const [AvailableSubscriptions, setAvailableSubscriptions] = useState([]);
    const [showSubscriptionDetails, setShowSubscriptionDetails] = useState(false);
    const [activeStep, setActiveStep] = useState(1);

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
