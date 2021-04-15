import { Observable } from 'rxjs';
import axios from 'axios';
const 
    RAZORPAY_ORDERS_API_URL = process.env.REACT_APP_RAZORPAY_ORDERS_API_URL,
    RAZORPAY_TEST_KEY = process.env.REACT_APP_RAZORPAY_KEY,
    RAZORPAY_TEST_SECRET = process.env.REACT_APP_RAZORPAY_SECRET;
export function postOrder(data) {
    const ORDERS_POST_API_URL = RAZORPAY_ORDERS_API_URL;
    return new Observable((observer) => {
        axios.post
            (
                ORDERS_POST_API_URL,
                data
            ).then((response) => {
                observer.next(response);
            });
    });
}