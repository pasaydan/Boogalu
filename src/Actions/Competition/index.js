import { SET_ACTIVE_COMPETITION } from '../../Constants'

export const setActiveCompetition = (data) => {
    return {
        type: SET_ACTIVE_COMPETITION,
        payload: data
    }
}