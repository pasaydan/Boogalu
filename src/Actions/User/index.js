import { LOGIN_USER, LOGOUT_USER, SIGN_UP_USER, GET_UPLOADED_VIDEOS_BY_USER } from '../../Constants'

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

export const getUploadedVideosByUser = payload => {
    return {
        type: GET_UPLOADED_VIDEOS_BY_USER,
        payload
    }
}