import { Observable } from 'rxjs';
import axios from 'axios';
import boogaluLogo from '../Images/Boogalu-logo.svg';
const
    APP_API_URL = process.env.REACT_APP_API_URL,
    RAZORPAY_ORDERS_API_URL = process.env.REACT_APP_RAZORPAY_ORDERS_API_URL,
    RAZORPAY_TEST_KEY = process.env.REACT_APP_RAZORPAY_KEY;

const header = new Headers();
header.append('Access-Control-Allow-Origin', '*');
header.append('Content-Type', 'application/json');
header.append('mode', 'cors');

export function postOrder(data, planType, planDescription, loggedInUser, handlerFn) {
    return new Observable((observer) => {
        axios.post(RAZORPAY_ORDERS_API_URL, data)
            .then((response) => {
                const responseData = response.data;
                const selectedPlanData = responseData[planType];
                console.log('postOrder response >>>>>', response);
                let subscriptionData = {
                    key: RAZORPAY_TEST_KEY,
                    amount: selectedPlanData.amount,
                    currency: selectedPlanData.currency,
                    name: loggedInUser.name,
                    description: planDescription,
                    image: boogaluLogo,
                    order_id: selectedPlanData.id,
                    handler: function (successResponse) {
                        const data = {
                            ...selectedPlanData,
                            ...successResponse
                        }
                        responseData[planType] = data;
                        handlerFn(responseData, planType);
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
                        ondismiss: function (e) {
                            console.log("Checkout form closed!!!!")
                        }
                    }
                };
                const checkOutForm = new window.Razorpay(subscriptionData);
                checkOutForm.on('payment.failed', function (response) {
                    console.log(" on payment failure >>>>>> ", response);
                });
                checkOutForm.open();
                observer.next(response);
            });
    });
}

export function updatePayment(data) {
    return new Observable((observer) => {
        axios.post(APP_API_URL + "/updatePayment", data, header).then((response) => {
            console.log('updatePayment API response', response)
            observer.next(response);
        });
    });
}