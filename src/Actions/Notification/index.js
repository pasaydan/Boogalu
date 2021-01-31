import { REMOVE_NOTIFICATION, DISPLAY_NOTIFICATION } from "../../Constants";

export const displayNotification = (payload) => {
    return {
        type: DISPLAY_NOTIFICATION,
        payload
    }
}

export const removeNotification = (payload) => {
    return {
        type: REMOVE_NOTIFICATION,
        payload
    }
}