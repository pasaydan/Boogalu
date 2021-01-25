import { LOGIN_USER, LOGOUT_USER, SIGN_UP_USER, ENABLE_COMPETITION_LOGIN_FLOW, DISABLE_COMPETITION_LOGIN_FLOW, SET_ACTIVE_COMPETITION } from '../Constants'

const storeReducer = (initialState, action) => {
    switch (action.type) {
        case LOGIN_USER:
            return { ...initialState, loggedInUser: action.payload };
        case LOGOUT_USER:
            return { ...initialState, loggedInUser: {} };
        case SIGN_UP_USER:
            return { ...initialState, loggedInUser: action.payload };
        case ENABLE_COMPETITION_LOGIN_FLOW:
            return { ...initialState, competitionLogginFlow: action.payload };
        case DISABLE_COMPETITION_LOGIN_FLOW:
            return { ...initialState, competitionLogginFlow: action.payload };
        case SET_ACTIVE_COMPETITION:
            return { ...initialState, activeCompetition: action.payload };
        default:
            return initialState;
    }
}

export default storeReducer;