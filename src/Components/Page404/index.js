import React from "react";

export default function Page404() {
    return (
        <div className="error-page charcoal-bg">
            <div className="error-board">
                <p className="error-text">error</p>
                <p className="error-code">404</p>
            </div>
            <h3>
                You are looking for a wrong page!
                &nbsp;<a href='/'>Take me to the Home</a>
            </h3>
        </div>
    )
}