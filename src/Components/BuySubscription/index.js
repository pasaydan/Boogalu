import React, { useRef, useState, useEffect } from 'react';
// import $ from 'jquery'
import { Base64 } from 'js-base64';
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

export default function BuySubsription({ handleClose, activeStep, alreadySubscribed }) {
    const history = useHistory();
    const { state, dispatch } = useStoreConsumer();
    const loggedInUser = state.loggedInUser;
    const [openDetailsModal, setOpenDetailsModal] = useState(true);
    const subscriptionDetails = state.activeSubscription;
    const [subsciptionValidity, setsubsciptionValidity] = useState(null);
    const [subscription, setSubscription] = useState(null);
    const competitionDetails = state.activeCompetition;
    const RAZORPAY_TEST_KEY = process.env.REACT_APP_RAZORPAY_KEY;
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

    function loadScript(src) {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = src;
            script.onload = () => {
                resolve(true);
            };
            script.onerror = () => {
                resolve(false);
            };
            document.body.appendChild(script);
        });
    }
    const proceedForPayment = async () => {
        const res = await loadScript(
            "https://checkout.razorpay.com/v1/checkout.js"
        );
        if (!res) {
            alert("Razorpay SDK failed to load. Are you online?");
            return;
        }
        let subscriptionData = {};
        const userData = {
            "amount": subscriptionDetails.amount * 100,
            "currency": "INR",
            "receipt": loggedInUser.key
        };
        await postOrder(userData)
            .subscribe((response) => {
                subscriptionData = response;


                const { amount, id: order_id, currency } = subscriptionData.data;
                subscriptionData = {
                    key: RAZORPAY_TEST_KEY,
                    amount: amount.toString(),
                    currency: currency,
                    name: loggedInUser.name,
                    description: "Monthly Subscription",
                    image: boogaluLogo,
                    order_id: order_id,
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
                            console.log("Checkout form closed!")
                        }
                    }
                };


                const razorpay = new window.Razorpay(subscriptionData);
                razorpay.on('payment.failed', function (response){
                    console.log(" on payment failure >>>>>> ", response);
                });
                razorpay.open();
            });
        if (!subscriptionData) {
            alert("Server error. Are you online?");
            return;
        }

        // const { amount, id: order_id, currency } = result.data;
        // let subscriptionData = {};
        // postOrder(userData)
        //     .subscribe((response) => {
        //         const responseData = response.data;
        //         setSubscription(responseData);
        //         console.log('postOrder response >>>>>', response);
        //         subscriptionData = {
        //             key: RAZORPAY_TEST_KEY,
        //             amount: responseData.amount,
        //             currency: responseData.currency,
        //             name: loggedInUser.name,
        //             description: "Monthly Subscription",
        //             image: boogaluLogo,
        //             order_id: responseData.id,
        //             handler: function (response){
        //                 console.log("on payment success >>>>>>>>", response)
        //             },
        //             prefill: {
        //                 name: loggedInUser.name,
        //                 email: loggedInUser.email,
        //                 contact: loggedInUser.phone
        //             },
        //             theme: {
        //                 color: "#191313"
        //             },
        //             modal: {
        //                 ondismiss: function(e) {
        //                     console.log("Checkout form closed!")
        //                 }
        //             }
        //         };


        //         const razorpay = new window.Razorpay(subscriptionData);
        //         razorpay.on('payment.failed', function (response){
        //             console.log(" on payment failure >>>>>> ", response);
        //         });
        //         razorpay.open();
        //     });
    }
    // const proceedForPayment = () => {
    //     const userData = {
    //         "amount": subscriptionDetails.amount * 100,
    //         "currency": "INR",
    //         "receipt": loggedInUser.uId
    //     };
    //     let subscriptionData = {};
    //     postOrder(userData)
    //         .subscribe((response) => {
    //             const responseData = response.data;
    //             setSubscription(responseData);
    //             console.log('postOrder response >>>>>', response);
    //             subscriptionData = {
    //                 key: RAZORPAY_TEST_KEY,
    //                 amount: responseData.amount,
    //                 currency: responseData.currency,
    //                 name: loggedInUser.name,
    //                 description: "Monthly Subscription",
    //                 image: boogaluLogo,
    //                 order_id: responseData.id,
    //                 handler: function (response){
    //                     console.log("on payment success >>>>>>>>", response)
    //                 },
    //                 prefill: {
    //                     name: loggedInUser.name,
    //                     email: loggedInUser.email,
    //                     contact: loggedInUser.phone
    //                 },
    //                 theme: {
    //                     color: "#191313"
    //                 },
    //                 modal: {
    //                     ondismiss: function(e) {
    //                         console.log("Checkout form closed!")
    //                     }
    //                 }
    //             };


    //             const razorpay = new window.Razorpay(subscriptionData);
    //             razorpay.on('payment.failed', function (response){
    //                 console.log(" on payment failure >>>>>> ", response);
    //             });
    //             razorpay.open();
    //         });
    // }

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
                            {alreadySubscribed ? 
                                <Button variant="contained" color="secondary" onClick={(e) => proceedForCompetition()}>Continue</Button> : 
                                <Button variant="contained" color="secondary" onClick={(e) => proceedForPayment(e)}>Subscribe</Button>
                                // <a href="#" onClick={(e) => proceedForPayment(e)}> Subscribe </a>
                            }
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