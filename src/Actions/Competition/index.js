import { SET_ACTIVE_COMPETITION, SET_ACTIVE_VIDEO_FOR_COMPETITION } from '../../Constants'

export const setActiveCompetition = (data) => {
    return {
        type: SET_ACTIVE_COMPETITION,
        payload: data
    }
}

export const setActiveVideoForCompetition = (data) => {
    return {
        type: SET_ACTIVE_VIDEO_FOR_COMPETITION,
        payload: data
    }
}