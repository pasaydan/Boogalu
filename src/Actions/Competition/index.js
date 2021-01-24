import { ENABLE_COMPETITION_LOGIN_FLOW, DISABLE_COMPETITION_LOGIN_FLOW } from '../../Constants'

export const enableLoginFlow = () => {
    return {
        type: ENABLE_COMPETITION_LOGIN_FLOW,
        payload: true
    }
}

export const disableLoginFlow = () => {
    return {
        type: DISABLE_COMPETITION_LOGIN_FLOW,
        payload: false
    }
}