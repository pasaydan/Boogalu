import React, { useRef, useState, useEffect } from 'react';
// import $ from 'jquery'
import { Base64 } from 'js-base64';
// import {
//     RAZORPAY_ORDERS_API_URL,
//     RAZORPAY_TEST_KEY,
//     RAZORPAY_TEST_SECRET
//     } from "../../Constants";
// import axios from 'axios';
import Button from '@material-ui/core/Button';
import { useStoreConsumer } from '../../Providers/StateProvider';
import { useHistory } from "react-router-dom";
import { formatDate } from "../../Services/Utils";
import { disableLoginFlow, enableLoginFlow } from "../../Actions/LoginFlow";
import { saveCompetition } from "../../Services/EnrollCompetition.service";
import { enableLoading, disableLoading } from "../../Actions/Loader";
import { postOrder } from "./../../Services/Razorpay.service";
import boogaluLogo from '../../Images/Boogalu-logo.svg';
// modal imports
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';


function make_base_auth(RAZORPAY_TEST_KEY, RAZORPAY_TEST_SECRET) {
    var tok = RAZORPAY_TEST_KEY + ':' + RAZORPAY_TEST_SECRET;
    var hash = Base64.encode(tok);
    return "Basic " + hash;
}

export default function BuySubsription({ handleClose, activeStep, alreadySubscribed }) {
    const history = useHistory();
    const { state, dispatch } = useStoreConsumer();
    const loggedInUser = state.loggedInUser;
    const [openDetailsModal, setOpenDetailsModal] = useState(true);
    const subscriptionDetails = state.activeSubscription;
    const [subsciptionValidity, setsubsciptionValidity] = useState(null);
    const competitionDetails = state.activeCompetition;

    useEffect(() => {
        let validUpto = new Date();
        new Date(validUpto.setDate(validUpto.getDate() + 30));
        let displayDate = formatDate(validUpto, 3);
        setsubsciptionValidity(displayDate);
    }, [subscriptionDetails])

    const handleModalClose = () => {
        setOpenDetailsModal(false);
        dispatch(disableLoginFlow());
        handleClose();
    }

    const submitForCompetition = () => {
        dispatch(enableLoading());
        const competitionObj = {
            compId: competitionDetails.key,
            compName: competitionDetails.name,
            compImg: competitionDetails.img,
            userId: loggedInUser.key,
            vdo: {
                key: competitionDetails.selectedVideo.key,
                title: competitionDetails.selectedVideo.title,
                thumbnail: competitionDetails.selectedVideo.thumbnail,
                url: competitionDetails.selectedVideo.url,
                desc: competitionDetails.selectedVideo.desc,
            },
            ageGroup: competitionDetails.ageGroup,
            status: 'Submited'
        }
        console.log(competitionObj)
        saveCompetition(competitionObj).subscribe((response) => {
            dispatch(disableLoading());
            console.log('vdo uploaded for competition suceess');
            dispatch(enableLoginFlow('profile-competition'));
            history.push('/profile');
        })
    }

    const proceedForCompetition = () => {
        if (state.currentLoginFlow == 'competition-subscription') {
            submitForCompetition();
        } else history.push('/competition');
    }
    // Basic Auth
    // user name : rzp_test_I6E2xi7pm2VOPG
    // password: 120I15dXhVxr68bXaYTzRMDT
    const proceedForPayment = () => {
        const userData = {
            "amount": subscriptionDetails.amount * 100,
            "currency": "INR",
            "receipt": subscriptionDetails.key + 1


            // "uId": loggedInUser.uId,
            // "email": loggedInUser.email,
            // "phone": loggedInUser.phone,
            // "subscriptionKey": subscriptionDetails.key,
        };
        // postOrder(userData);
        postOrder(userData).subscribe((res) => {
            if (!('error' in res)) {
                console.log('post order data is ', res);
            } else console.log('error in placing order', res);
        })
        // var options = {
        //     "key": "rzp_test_I6E2xi7pm2VOPG", // Enter the Key ID generated from the Dashboard
        //     "amount": "50000", // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        //     "currency": "INR",
        //     "name": "Acme Corp",
        //     "description": "Test Transaction",
        //     "image": boogaluLogo,
        //     "order_id": "order_Gyp0RPVX4YU7vO", //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        //     "handler": function (response){
        //         alert(response.razorpay_payment_id);
        //         alert(response.razorpay_order_id);
        //         alert(response.razorpay_signature)

        //         rzp1.close();
        //         activeStep = 2;
        //     },
        //     "prefill": {
        //         "name": "Gaurav Kumar",
        //         "email": "gaurav.kumar@example.com",
        //         "contact": "9999999999"
        //     },
        //     "notes": {
        //         "address": "Razorpay Corporate Office"
        //     },
        //     "theme": {
        //         "color": "#191313"
        //     },
        //     "modal": {
        //         "ondismiss": function(e) {
        //             console.log("Checkout form closed!")
        //         }
        //     },
        //     "key_id": "rzp_test_I6E2xi7pm2VOPG",
        //     "key_secret": "120I15dXhVxr68bXaYTzRMDT"
        //   };
        // var rzp1 = new window.Razorpay(options);
        // rzp1.on('payment.failed', function (response){
        //   alert(response.error.code);
        //   alert(response.error.description);
        //   alert(response.error.source);
        //   alert(response.error.step);
        //   alert(response.error.reason);
        //   alert(response.error.metadata.order_id);
        //   alert(response.error.metadata.payment_id);

        //   activeStep = 3;
        // });
        // rzp1.open();
        // var params = "?phone=" + loggedInUser.phone + "&orderId=" + subscriptionDetails.key + "&amount=" + subscriptionDetails.amount + "&uId=" + loggedInUser.uId + "&email=" + loggedInUser.email;
        // window.open('http://localhost:5001/boogalusite/us-central1/payment' + params, '_self');
        // window.open('https://us-central1-boogalusite.cloudfunctions.net/payment' + params, '_self');

        // const ORDERS_API_URL = RAZORPAY_ORDERS_API_URL;
        // // let headers = new Headers();
        // const headersList = {
        //     'Access-Control-Allow-Origin': '*',
        //     'Content-Type': 'application/json',
        //     'Accept': 'application/json',
        //     'Content-Type': 'application/json',        
        //     'mode': 'cors',
        //     'Authorization': make_base_auth(),
        //     'Referrer-Policy': "*"
        // }
        // headers = headersList;

        // let headers = new Headers(headersList);
        // headers.append('Access-Control-Allow-Origin', '*');
        // headers.append('Content-Type', 'application/json');
        // headers.append('mode', 'cors');
        // headers.append('Authorization', make_base_auth());

        // const orderData = new Observable((observer) => {
            // const headers = {
            //     'Access-Control-Allow-Origin': '*',
            //     'Content-Type': 'application/json',
            //     'Accept': 'application/json',
            //     'mode': 'cors',
            //     'Authorization': "Basic cnpwX3Rlc3RfSTZFMnhpN3BtMlZPUEc6MTIwSTE1ZFhoVnhyNjhiWGFZVHpSTURU",
            //     "cache-control": "no-cache"
            // }
            // axios.defaults.headers = {"Access-Control-Allow-Origin": "*"}
            // axios.post(
            //     ORDERS_API_URL,
            //     JSON.stringify(userData),
            //     {headers: {
            //         'Content-Type': 'application/json;charset=UTF-8',
            //         "Access-Control-Allow-Origin": "*",
            //         "Accept": "application/json",
            //         'Authorization': "Basic cnpwX3Rlc3RfSTZFMnhpN3BtMlZPUEc6MTIwSTE1ZFhoVnhyNjhiWGFZVHpSTURU",
            //         "Referrer-Policy": "no-referrer-when-downgrade"
            //     }}
            // )
            // .then((response) => {
            //     console.log('orderData', response)
            //     // observer.next(response);
            // })
            // .catch(function (error) {
            //     console.log('error ', error);
            // });


        //     $.ajax({
        //         type: "POST",
        //         headers: { 
        //             Accept : "text/plain; charset=utf-8",
        //             "Content-Type": "text/plain; charset=utf-8",
        //             "Accept": 'application/json',
        //             "Access-Control-Allow-Origin": '*',
        //             "authorization": 'Basic cnpwX3Rlc3RfSTZFMnhpN3BtMlZPUEc6MTIwSTE1ZFhoVnhyNjhiWGFZVHpSTURU'
        //         },
        //         // beforeSend: function(request) {
        //         //     request.setRequestHeader("Authorization", 'Basic cnpwX3Rlc3RfSTZFMnhpN3BtMlZPUEc6MTIwSTE1ZFhoVnhyNjhiWGFZVHpSTURU');
        //         //     request.setRequestHeader("Content-Type", 'application/json');
        //         //     request.setRequestHeader("Accept", 'application/json');
        //         //     request.setRequestHeader("Access-Control-Allow-Origin", 'http://localhost:3000');
        //         // },                
        //         url: ORDERS_API_URL,
        //         data: userData ,
        //         success: function(data) {
        //             console.log('orderData', data)
        //         }
        //   });

        // $.get('https://reqres.in/api/users?page=2')
        // axios.get('https://reqres.in/api/users?page=2').then(function(response) {
        //     console.log('users', response)
        // });

        // axios.post(
        //     'https://reqres.in/api/users',
        //     {
        //         "name": "morpheus",
        //         "job": "leader"
        //     }
        //     ).then(function (response) {
        //         console.log('post users', response)
        //     })


        // });
        // console.log('orderData', orderData)
        // return orderData;
    }

    return (
        <div className="subscription-modal-wrap">
            <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                className='subscription-modal-box'
                open={openDetailsModal}
                onClose={() => handleModalClose(false)}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                }}
            >
                <Fade in={openDetailsModal}>
                    <div className="subscription-inner-modal">
                        <IconButton className="close-modal-btn" onClick={() => handleModalClose(false)}>
                            <CloseIcon />
                        </IconButton>
                        <h3>Boogalu Subscription</h3>
                        {activeStep == 1 && <div>
                            <div className="subs-details-wrap">
                                <p>
                                    Welcome, we are glad to see you. Now, you can subscribe to our application, and
                                    get a chance to participate in any competition for one month.
                                </p>
                                <p> Just {subscriptionDetails.amount}/{subscriptionDetails.plans}</p>
                                {/* <div>{subscriptionDetails.name}</div> */}
                                {/* <div>{subscriptionDetails.desc}</div> */}
                                {/* <div>{subscriptionDetails.amount} / {subscriptionDetails.plans}</div> */}
                                {/* <div>Valid Upto- {subsciptionValidity}</div> */}
                            </div>
                            {alreadySubscribed ? <Button variant="contained" color="secondary" onClick={(e) => proceedForCompetition()}>Continue</Button> : <Button variant="contained" color="secondary" onClick={(e) => proceedForPayment(e)}>Subscribe</Button>}
                        </div>}
                        {activeStep == 2 && <div>
                            <h3>Subscription Payment Recieved Successfully</h3>
                            <Button variant="contained" color="secondary" onClick={(e) => proceedForCompetition()}>Continue to competition</Button>
                        </div>}
                        {activeStep == 3 && <div>
                            <h3>Subscription Payment Fail</h3>
                            <Button variant="contained" color="secondary" onClick={(e) => proceedForPayment(e)}>Retry</Button>
                        </div>}
                    </div>
                </Fade>
            </Modal>
        </div>
    )
}