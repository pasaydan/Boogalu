import React from 'react'
import "./subscription.css";

function Subscription() {
    return (
        <div className="flex-container-VC subscription-wrap">
            <div className="flex-3">
                <h1>Unlimited Classes For The Price Of One</h1>
                <div className="line1">Dance to the music that makes YOU want to move at any skill level.</div>
            </div>
            <div className="flex-1"></div>
            <div className="flex-2 plan">
                <div className="plan_tag">MONTHLY PLAN (USD)</div>
                <div className="plan_price">$20<span>/mo</span></div>
            </div>
            <div className="flex-2 plan">
                <div className="plan_tag">ANNUAL PLAN (USD)</div>
                <div className="plan_price">$8.33<span>/mo</span></div>
            </div>
        </div>
    )
}

export default Subscription
