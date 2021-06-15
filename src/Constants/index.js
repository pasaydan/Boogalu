export const PAYMENT_STAGING_URL = 'http://localhost:5001/boogalusite/us-central1/payment'
export const PAYMENT_PROD_URL = 'https://us-central1-boogalusite.cloudfunctions.net/payment'

export const PAYMENT_STAGING_CALLBACK_URL = 'http://localhost:5001/boogalusite/us-central1/paymentCallback'
export const PAYMENT_PROD_CALLBACK_URL = 'https://us-central1-boogalusite.cloudfunctions.net/paymentCallback'

export const THUMBNAIL_URL = 'https://firebasestorage.googleapis.com/v0/b/boogalusite.appspot.com/o/uploads%2Fthumbnail%2Fthumbnail.jpg?alt=media&token=36fb88fc-0cde-4019-890f-5bb285791575'
export const MALE_PROFILE_DEFAULT_IMAGE = 'https://i.imgur.com/EyKfwBo.png'
export const FEMALE_PROFILE_DEFAULT_IMAGE = 'https://firebasestorage.googleapis.com/v0/b/boogalusite.appspot.com/o/uploads%2Fuser%2Ffemale-profile.png?alt=media&token=0c40e1cd-c965-4edf-b307-1cea5f9f1f72'
export const EMAIL_SENDING_STAGING_API_URL = 'http://localhost:5001/boogalusite/us-central1/sendEmail'
export const EMAIL_SENDING_PROD_API_URL = 'https://us-central1-boogalusite.cloudfunctions.net/sendEmail'
export const ADMIN_EMAIL_STAGING = 'boogalu.email.test@gmail.com'

export const LOGIN_USER = 'LOGIN_USER'
export const LOGOUT_USER = 'LOGOUT_USER'
export const SIGN_UP_USER = 'SIGN_UP_USER'

export const ENABLE_LOGIN_FLOW = 'ENABLE_LOGIN_FLOW'
export const DISABLE_LOGIN_FLOW = 'DISABLE_LOGIN_FLOW'

export const ENABLE_LOADER = 'ENABLE_LOADER'
export const DISABLE_LOADER = 'DISABLE_LOADER'

export const SET_ACTIVE_COMPETITION = 'SET_ACTIVE_COMPETITION'
export const SET_ACTIVE_VIDEO_FOR_COMPETITION = 'SET_ACTIVE_VIDEO_FOR_COMPETITION'

export const SET_ACTIVE_SUBSCRIPTION = 'SET_ACTIVE_SUBSCRIPTION'
export const SUBSCRIPTION_ACTIVE_STATUS = 'Active'
export const SUBSCRIPTION_ENDED_STATUS = 'Ended'

export const SET_REFETCH_DATA_MODULE = 'SET_REFETCH_DATA_MODULE'
export const REMOVE_REFETCH_DATA_MODULE = 'REMOVE_REFETCH_DATA_MODULE'

export const DISPLAY_NOTIFICATION = 'DISPLAY_NOTIFICATION'
export const REMOVE_NOTIFICATION = 'REMOVE_NOTIFICATION'

export const NOTIFICATION_SUCCCESS = 'NOTIFICATION_SUCCCESS'
export const NOTIFICATION_ERROR = 'NOTIFICATION_ERROR'
export const NOTIFICATION_INFO = 'NOTIFICATION_INFO'
export const NOTIFICATION_WARNING = 'NOTIFICATION_WARNING'

// Admin Login
export const ADMIN_USER = 'b2b@boxpuppet.com';
export const ADMIN_PWD = 'Box-puppet@1001';

// Pre-judges Login
export const PRE_JUDGES_USER = 'pre-round@boogalu.com';
export const PRE_JUDGES_PWD = 'Pre-round@1001';

// Final-judges Login
export const FINAL_JUDGES_USER = 'final-round@boogalu.com';
export const FINAL_JUDGES_PWD = 'Final-round@1001';

// Subscription Plans Mapping
export const SUBSCIPTION_PLANS_MAP = {
    startup: {
        modalMessage: 'get a chance to participate in active compeitions and take paid lessons.',
        className: 'startup',
        features: {
            lessons: ['paid'],
            competition: true
        }
    },
    pro: {
        modalMessage: 'will have access to all the features of Start-up plan and additionally you can have access to all Pro lesson videos.',
        className: 'pro',
        features: {
            lessons: ['paid', 'pro'],
            competition: true
        }
    },
    premium: {
        modalMessage: 'will have access to all the features of Start-up & pro plans, additionally you can have access to all Premium lesson videos.',
        className: 'premium',
        features: {
            lessons: ['paid', 'pro', 'premium'],
            competition: true
        }
    }
}

// User Videos Count
export const GET_UPLOADED_VIDEOS_BY_USER = 'GET_UPLOADED_VIDEOS_BY_USER';

// boogalu.email.test@gmail.com / Box-puppet@1001

// Video Upload Limit Count
export const VIDEO_LIMIT_COUNT = {
    monthly: 4,
    yearly: 48
}
