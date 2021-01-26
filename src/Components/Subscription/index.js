import React, { useState } from 'react'
import { useHistory } from "react-router-dom";
import { useStoreConsumer } from '../../Providers/StateProvider';

function Subscription() {
    const { state, dispatch } = useStoreConsumer();
    const history = useHistory();
    const loggedInUser = state.loggedInUser;

    const subscribeClasses = plan => {
        // if user already login then redirect to home
        if (loggedInUser.name && loggedInUser.phone && loggedInUser.username) {

        } else {
            history.push({
                pathname: `/register?plan=${plan}`,
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
                        <div className="flex-2 plan" onClick={() => subscribeClasses('monthly')}>
                            <div className="plan_tag">MONTHLY PLAN (USD)</div>
                            <div className="plan_price">$2.74<span>/mo</span></div>
                        </div>
                        <div className="flex-2 plan" onClick={() => subscribeClasses('yearly')}>
                            <div className="plan_tag">ANNUAL PLAN (USD)</div>
                            <div className="plan_price">$27.41<span>/year</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Subscription
