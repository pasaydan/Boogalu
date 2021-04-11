import React from "react";

export default function Pricing() {
    return (
        <div className="pricing-page charcoal-bg">
            <div className="container">
                <h1>Pricing</h1>
                <div className="pricingWrap">
                    <div className="pricingBox">
                        <h3>Startup</h3>
                        <p className="user">&#8377; <strong>199</strong>/user</p>
                        <div className="featuresBox">
                            <p>Multiple <strong>Videos</strong> upload</p>
                            <p>Enrollment in all the active <strong>Competitions</strong></p>
                            <p>Access to all available online <strong>Lessons</strong></p>
                        </div>
                        <button className="btn primary-light">
                            Choose plan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
