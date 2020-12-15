import { LOGIN_USER, LOGOUT_USER, SIGN_UP_USER } from '../Constants'

const storeReducer = (initialState, action) => {
    switch (action.type) {
        case LOGIN_USER:
            return { ...initialState, loggedInUser: action.payload };
        case LOGOUT_USER:
            return { ...initialState, loggedInUser: {} };
        case SIGN_UP_USER:
            return { ...initialState, loggedInUser: action.payload };
        default:
            return initialState;
    }
}

export default storeReducer;