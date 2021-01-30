import { SET_ACTIVE_SUBSCRIPTION } from '../../Constants'

export const setActiveSubscription = (data) => {
    return {
        type: SET_ACTIVE_SUBSCRIPTION,
        payload: data
    }
}