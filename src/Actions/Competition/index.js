import { ENABLE_COMPETITION_LOGIN_FLOW, DISABLE_COMPETITION_LOGIN_FLOW, SET_ACTIVE_COMPETITION } from '../../Constants'

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

export const setActiveCompetition = (data) => {
    return {
        type: SET_ACTIVE_COMPETITION,
        payload: data
    }
}