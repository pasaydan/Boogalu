import { useEffect } from 'react';
import { useHistory } from "react-router-dom";

function useRedirection(route) {
    const history = useHistory();
    useEffect(() => {
        history.push(route);
    }, [route, history])
}

export default useRedirection;