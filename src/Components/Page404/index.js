import React from "react";
import {useHistory} from "react-router-dom";


export default function Page404() {
    const history = useHistory();

    function redirectToPrevious(event) {
        event.stopPropagation();
        event.preventDefault();
        history.goBack();
    }

    return (
        <div className="error-page charcoal-bg">
            <div className="error-board">
                <p className="error-text">error</p>
                <p className="error-code">404</p>
            </div>
            <h3>
                You are looking for a wrong page!
                &nbsp;<a href="#home" onClick={(e) => redirectToPrevious(e)} title="previous page">Let's go back!</a>
            </h3>
        </div>
    )
}