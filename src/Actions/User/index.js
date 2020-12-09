import { LOGIN_USER, LOGOUT_USER, SIGN_UP_USER } from '../../Constants'

export const loginUser = payload => {
    return {
        type: LOGIN_USER,
        payload
    }
}

export const logoutUser = payload => {
    return {
        type: LOGOUT_USER,
        payload
    }
}

export const signupUser = payload => {
    return {
        type: SIGN_UP_USER,
        payload
    }
}