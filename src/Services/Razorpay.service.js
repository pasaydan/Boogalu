import { Base64 } from 'js-base64';
import {
    RAZORPAY_ORDERS_API_URL,
    RAZORPAY_TEST_KEY,
    RAZORPAY_TEST_SECRET
    } from "../Constants";
import { Observable } from 'rxjs';
import axios from 'axios';


var tok = RAZORPAY_TEST_KEY + ':' + RAZORPAY_TEST_SECRET;
var hash = Base64.encode(tok);
const AuthToken = "Basic " + hash;


const header = new Headers();
header.append('Access-Control-Allow-Origin', '*');
header.append('Content-Type', 'application/json');
header.append('mode', 'cors');
header.append('Authorization', AuthToken);

// const paymentsRef = db.collection('payments');

export function postOrder(data) {
    const ORDERS_POST = RAZORPAY_ORDERS_API_URL;
    return new Observable((observer) => {
        axios.post
            (
                ORDERS_POST,
                data,
                header
            ).then((response) => {
                console.log('response')
                observer.next(response);
            })
            .catch(function (error) {
                console.log('error ', error);
            });
    });
}