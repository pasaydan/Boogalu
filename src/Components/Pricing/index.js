import React, { useState, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import { useStoreConsumer } from '../../Providers/StateProvider';
import { postOrder, updatePayment } from "./../../Services/Razorpay.service";
import { updateUser } from "../../Services/User.service";
import { loginUser } from '../../Actions/User/index';
import { sendEmail } from "../../Services/Email.service";
import { ADMIN_EMAIL_STAGING } from "../../Constants";
import { isObjectEmpty } from '../../helpers';

export default function Pricing() {
    const { state, dispatch } = useStoreConsumer();
    const history = useHistory();
    const loggedInUser = state.loggedInUser;
    const subscriptionDetails = state.activeSubscription;
    const competitionDetails = state.activeCompetition;
    const [isLoadingTrueClass, toggleLoadingBtnTrueClass] = useState('');
    const [isUserSubscribed, setUserSubscribeTrue] = useState(false);

    useEffect(() => {
        if (loggedInUser && loggedInUser.subscribed) {
            setUserSubscribeTrue(true);
        }
    }, []);

    const sendEmailToAdmin = () => {
        let emailBody = `<div>
            <h6 style="font-size: 17px;margin-bottom: 26px;">User subscribed for ${state.activeSubscription.name}</h6>
            <h4>User details -</h4>
            <h6>${loggedInUser.name}</h6>
            <h6>${loggedInUser.email}</h6>
            <h6>${loggedInUser.phone}</h6>
            </div>`;
        let payload = {
            mailTo: ADMIN_EMAIL_STAGING,
            title: 'User subscribed',
            content: emailBody
        }
        sendEmail(payload).subscribe((res) => {
            if (!('error' in res)) {
                console.log('Admin Email Send Successfully.');
            } else console.log('Admin Email Send Failed.');
        })
    }

    const sendEmailToUser = () => {
        let emailBody = `<div>
            <p><span >Congratulations</span>  <strong>${loggedInUser.name}</strong>, 
            you have subscribed to our 1-month subscription. Now, you can enroll in any active competitions for a month.</p>
            <h4>Time To Express Your Talent on Our Platform during this Lockdown</h4>`;
        let payload = {
            mailTo: loggedInUser.email,
            title: 'Boogalu subscription successfull',
            content: emailBody
        }
        sendEmail(payload).subscribe((res) => {
            if (!('error' in res)) {
                console.log('Email to user Send Successfully.');
            } else console.log('Email to user Send Failed.');
        })
    }

    const handlerFn = (response) => {
        console.log("response", response);
        updatePayment(response).subscribe((res) => {
            const responseData = res.data;
            console.log('postOrder response >>>>>', response);
            const userDetails = {
                ...loggedInUser,
                subscribed: true,
                subscribedOn: new Date()
            };
            updateUser(userDetails.key, userDetails).subscribe(() => {
                dispatch(loginUser(userDetails));
                console.log('updateUser userDetails>>>>>> ', userDetails);
                sendEmailToAdmin();
                sendEmailToUser();
                history.push('/competitions');
            })
        });
    }

    const choosePlanClickHandler = () => {
        if (isUserSubscribed) {
            history.push('/competitions');
        } else if (isObjectEmpty(loggedInUser)) {
            history.push('/login');
        } else {
            const userData = {
                "amount": subscriptionDetails?.amount * 100,
                "currency": "INR",
                "receipt": loggedInUser?.key
            };
            toggleLoadingBtnTrueClass('loading');
            try {
                postOrder(userData, loggedInUser, handlerFn)
                    .subscribe((response) => {
                        toggleLoadingBtnTrueClass('');
                        console.log('postOrder response >>>>>', response);
                    });
            } catch(e) {
                toggleLoadingBtnTrueClass('');
                console.log('Error: ', e);
            }
        }
    }

    return (
        <div className="pricing-page charcoal-bg">
            <div className="container">
                <h1>Pricing</h1>
                <div className="pricingWrap">
                    <div className="pricingBox">
                        <h3>Startup</h3>
                        <p className="user">&#8377; <strong>199</strong>/user</p>
                        <div className="featuresBox">
                            <p>Multiple <strong>Videos</strong> upload</p>
                            <p>Enrollment in all the active <strong>Competitions</strong></p>
                            <p>Access to all available online <strong>Lessons</strong></p>
                        </div>
                        <button className={`btn primary-light ${isLoadingTrueClass} ${isUserSubscribed ? 'alreadySubscribed' : ''}`} onClick={choosePlanClickHandler}>
                            {
                                isUserSubscribed ?
                                'Already subscribed'
                                : 'Choose plan'
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
