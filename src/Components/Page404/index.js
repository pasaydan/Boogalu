import React from "react";
import {useHistory} from "react-router-dom";


export default function Page404() {
    const history = useHistory();
    return (
        <div className="error-page charcoal-bg">
            <div className="error-board">
                <p className="error-text">error</p>
                <p className="error-code">404</p>
            </div>
            <h3>
                You are looking for a wrong page!
                &nbsp;<a onClick={() => history.goBack()} title="previous page">Take me to the Home</a>
            </h3>
        </div>
    )
}