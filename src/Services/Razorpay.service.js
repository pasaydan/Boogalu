import { Observable } from 'rxjs';
import axios from 'axios';
import boogaluLogo from '../Images/Boogalu-logo.svg';
const 
    RAZORPAY_ORDERS_API_URL = process.env.REACT_APP_RAZORPAY_ORDERS_API_URL,
    RAZORPAY_TEST_KEY = process.env.REACT_APP_RAZORPAY_KEY,
    RAZORPAY_TEST_SECRET = process.env.REACT_APP_RAZORPAY_SECRET;
export function postOrder(data, loggedInUser) {
    const ORDERS_POST_API_URL = RAZORPAY_ORDERS_API_URL;
    return new Observable((observer) => {
        axios.post
            (
                ORDERS_POST_API_URL,
                data
            ).then((response) => {
                const responseData = response.data;
                // setSubscription(responseData);
                console.log('postOrder response >>>>>', response);
                let subscriptionData = {
                    key: RAZORPAY_TEST_KEY,
                    amount: responseData.amount,
                    currency: responseData.currency,
                    name: loggedInUser.name,
                    description: "Monthly Subscription",
                    image: boogaluLogo,
                    order_id: responseData.id,
                    handler: function (response){
                        console.log("on payment success >>>>>>>>", response)
                    },
                    prefill: {
                        name: loggedInUser.name,
                        email: loggedInUser.email,
                        contact: loggedInUser.phone
                    },
                    theme: {
                        color: "#191313"
                    },
                    modal: {
                        ondismiss: function(e) {
                            console.log("Checkout form closed!!!!")
                        }
                    }
                };
    
    
                const checkOutForm = new window.Razorpay(subscriptionData);
                checkOutForm.on('payment.failed', function (response){
                    console.log(" on payment failure >>>>>> ", response);
                });
                checkOutForm.open();

                observer.next(response);
                // window.location.reload(false);
            });
    });
}