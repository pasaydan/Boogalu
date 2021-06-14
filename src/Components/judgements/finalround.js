import React, { useEffect } from 'react';
import { useHistory } from "react-router-dom";
import JudgesLogin from './judgeslogin';

function FinalRound() {
    const history = useHistory();
    // eslint-disable-next-line no-unused-vars
    const {REACT_APP_URL} = process.env;
    // eslint-disable-next-line no-unused-vars
    
    useEffect(() => {
        console.log('history: ', history);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="judgementWrap">
            {/* <h1>This is Finals</h1> */}
            <JudgesLogin />
        </div>
    )
}

export default FinalRound;
