import { ENABLE_LOADER, DISABLE_LOADER } from '../../Constants'

export const enableLoading = () => {
    return {
        type: ENABLE_LOADER,
        payload: true
    }
}

export const disableLoading = () => {
    return {
        type: DISABLE_LOADER,
        payload: false
    }
}