import { isBrowser, isMobile, isTablet, isAndroid, isIOS, isWinPhone, isChrome, isSafari, isMobileSafari, deviceDetect } from "react-device-detect";
import { analytics } from "./firebase";

export const logAnalyticsEvent = (event, type) => {
    type = { ...type, isMobile, isBrowser, isTablet, isAndroid, isWinPhone, isIOS, isChrome, isSafari, isMobileSafari, device: deviceDetect() }
    analytics.logEvent(event, { ...type })
}
