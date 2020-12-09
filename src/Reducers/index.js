import { LOGIN_USER, LOGOUT_USER, SIGN_UP_USER } from '../Constants'

const storeReducer = (initialState, action) => {
    switch (action.type) {
        case LOGIN_USER:
            return initialState;
        case LOGOUT_USER:
            return initialState;
        case SIGN_UP_USER:
            return initialState;
        default:
            return initialState;
    }
}

export default storeReducer;