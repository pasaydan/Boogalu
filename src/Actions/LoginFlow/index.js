import { ENABLE_LOGIN_FLOW, DISABLE_LOGIN_FLOW } from '../../Constants'

export const enableLoginFlow = (payload) => {
    return {
        type: ENABLE_LOGIN_FLOW,
        payload
    }
}

export const disableLoginFlow = () => {
    return {
        type: DISABLE_LOGIN_FLOW,
        payload: null
    }
}