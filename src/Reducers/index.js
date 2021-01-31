import { LOGIN_USER, LOGOUT_USER, SIGN_UP_USER, ENABLE_LOGIN_FLOW, DISABLE_LOGIN_FLOW, SET_ACTIVE_COMPETITION, SET_ACTIVE_SUBSCRIPTION, ENABLE_LOADER, DISABLE_LOADER } from '../Constants'

const storeReducer = (initialState, action) => {
    switch (action.type) {
        case LOGIN_USER:
            return { ...initialState, loggedInUser: action.payload };
        case LOGOUT_USER:
            return { ...initialState, loggedInUser: {} };
        case SIGN_UP_USER:
            return { ...initialState, loggedInUser: action.payload };
        case ENABLE_LOGIN_FLOW:
            return { ...initialState, currentLoginFlow: action.payload };
        case DISABLE_LOGIN_FLOW:
            return { ...initialState, currentLoginFlow: action.payload };
        case ENABLE_LOADER:
            return { ...initialState, isLoading: action.payload };
        case DISABLE_LOADER:
            return { ...initialState, isLoading: action.payload };
        case SET_ACTIVE_COMPETITION:
            return { ...initialState, activeCompetition: action.payload };
        case SET_ACTIVE_SUBSCRIPTION:
            return { ...initialState, activeSubscription: action.payload };
        default:
            return initialState;
    }
}

export default storeReducer;