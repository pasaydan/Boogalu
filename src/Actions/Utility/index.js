import { REMOVE_REFETCH_DATA_MODULE, SET_REFETCH_DATA_MODULE } from "../../Constants";

export const setDataRefetchModuleName = (payload) => {
    return {
        type: SET_REFETCH_DATA_MODULE,
        payload
    }
}

export const removeDataRefetchModuleName = () => {
    return {
        type: REMOVE_REFETCH_DATA_MODULE,
        payload: null
    }
}