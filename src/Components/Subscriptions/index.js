import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useStoreConsumer } from "../../Providers/StateProvider";
import { getActiveSubscriptionsList } from "../../Services/Subscription.service";
import { setActiveSubscription } from "../../Actions/Subscription";
import BuySubscription from "../BuySubscription";
import { enableLoginFlow, disableLoginFlow } from "../../Actions/LoginFlow";
import { ADMIN_EMAIL_STAGING } from "../../Constants";
import { sendEmail } from "../../Services/Email.service";
import { isObjectEmpty, getParameterByName } from "../../helpers";
import { timeStampToNewDate } from "../../Services/Utils";
import { postOrder, updatePayment } from "./../../Services/Razorpay.service";
import { updateUser } from "../../Services/User.service";
import { loginUser } from "../../Actions/User/index";
import * as $ from "jquery";
import Loader from "../Loader";

function Subscriptions(props) {
  const { pageTitle } = props;
  const { state, dispatch } = useStoreConsumer();
  const history = useHistory();
  const loggedInUser = state.loggedInUser;
  const [AvailableSubscriptions, setAvailableSubscriptions] = useState([]);
  const [showSubscriptionDetails, setShowSubscriptionDetails] = useState(false);
  const [buttonLoadingClass, toggleButtonLoading] = useState("");
  const [activeStep, setActiveStep] = useState(1);
  const [isLoaderActive, toggleLoading] = useState(false);
  console.log(" loggedInUser >>>>>", loggedInUser);
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
      title: "User subscribed",
      content: emailBody,
    };
    sendEmail(payload).subscribe((res) => {
      if (!("error" in res)) {
        console.log("Admin Email Send Successfully.");
      } else console.log("Admin Email Send Failed.");
    });
  };

  const sendEmailToUser = () => {
    let emailBody = `<div>
            <p><span >Congratulations</span>  <strong>${loggedInUser.name}</strong>, 
            you have subscribed to our 1-month subscription. Now, you can enroll in any active competitions for a month.</p>
            <h4>Time To Express Your Talent on Our Platform during this Lockdown</h4>`;
    let payload = {
      mailTo: loggedInUser.email,
      title: "Boogaluu subscription successfull",
      content: emailBody,
    };
    sendEmail(payload).subscribe((res) => {
      if (!("error" in res)) {
        console.log("Email to user Send Successfully.");
      } else console.log("Email to user Send Failed.");
    });
  };
  // check for payment status if user is in payment flow
  useEffect(() => {
    toggleLoading(true);
    $("html,body").animate(
      {
        scrollTop: 0,
      },
      700
    );
    try {
      getActiveSubscriptionsList().subscribe((subscriptionsList) => {
        filterSubacriptionsWRTUser(subscriptionsList.reverse());
        toggleLoading(false);
        if (
          history.location.search &&
          history.location.search.includes("planType")
        ) {
          //if any plan type in url
          const filterParam = getParameterByName(
            "planType",
            window.location.href
          );
          if (subscriptionsList.length) {
            const matchedSubscription = subscriptionsList.filter((item) => {
              return item.planType === filterParam;
            });
            if (matchedSubscription.length) {
              dispatch(setActiveSubscription(matchedSubscription[0]));
            } else {
              dispatch(setActiveSubscription(subscriptionsList[0]));
            }
          }
        }
        if (state.currentLoginFlow === "subscription") {
          dispatch(disableLoginFlow());
          setActiveStep(1);
          setShowSubscriptionDetails(true);
          console.log(subscriptionsList);
        }
      });
    } catch (e) {
      console.log("Fetching subscription error: ", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isObjectEmpty(loggedInUser)) {
      loggedInUser.subscribed &&
        filterSubacriptionsWRTUser(AvailableSubscriptions);
    } else setAvailableSubscriptions(AvailableSubscriptions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.loggedInUser]);

  const filterSubacriptionsWRTUser = (subscriptionsList) => {
    //filter subscriptions with respect to user
    if (!isObjectEmpty(loggedInUser)) {
      if (loggedInUser.subscriptions) {
        let twoDaysAfterCurrentDate = new Date();
        twoDaysAfterCurrentDate.setDate(new Date().getDate() + 2);
        subscriptionsList.forEach((subDetails, index) => {
          let isAlreadySub = loggedInUser.subscriptions.filter(
            (data) => data.id === subDetails.key && !data.isExpired
          );
          if (isAlreadySub.length !== 0) {
            let subscriptionDate = new Date(
              timeStampToNewDate(isAlreadySub[0].subscribedOn)
            ); //original subscription date
            // let subDateAfter1Month = new Date(subscriptionDate.setDate(subscriptionDate.getDate() + 2));//subscription date after 2 days =>> for testing
            let subDateAfter1Month = new Date(
              subscriptionDate.setMonth(
                subscriptionDate.getMonth() + (isAlreadySub[0].validity || 1)
              )
            ); //subscription date after 1 month

            if (
              subDateAfter1Month.getDate() >= new Date().getDate() && //if plan date is grater than today
              subDateAfter1Month.getMonth() ===
                twoDaysAfterCurrentDate.getMonth()
                ? subDateAfter1Month.getDate() <=
                  twoDaysAfterCurrentDate.getDate()
                : subDateAfter1Month <= twoDaysAfterCurrentDate
            ) {
              //if same month then check only dayes other wise check full date month (check is runs only in 2 days condition for testing)
              //it means subscription plan is currently active && subscription ends in two days
              var daydiff = subDateAfter1Month.getDate() - new Date().getDate();
              switch (daydiff) {
                case 0:
                  subDetails.endsIn2Days = "End today";
                  break;
                case 1:
                  subDetails.endsIn2Days = "End in 1 day";
                  break;
                case 2:
                  subDetails.endsIn2Days = "End in 2 days";
                  break;
                default:
                  break;
              }
              if (
                state.activeSubscription &&
                subDetails.key === state.activeSubscription.key
              ) {
                const stateSubCopy = { ...subDetails };
                dispatch(setActiveSubscription(stateSubCopy));
              }
            } else subDetails.endsIn2Days = null;
          }
          subDetails.isSubscribed = isValidSubscriptionBox(subDetails);
          if (index === subscriptionsList.length - 1) {
            setAvailableSubscriptions([...subscriptionsList]);
          }
        });
      } else setAvailableSubscriptions(subscriptionsList);
    } else setAvailableSubscriptions(subscriptionsList);
  };

  const handlerFn = (response, planType, isRenew) => {
    console.log("response", response);
    try {
      updatePayment(response).subscribe((res) => {
        // const responseData = res.data;
        console.log("postOrder response >>>>>", response);
        const userDetails = {
          ...loggedInUser,
          subscribed: true,
          subEndingReminderSend: false,
          subEndedReminderSend: false,
          planType: planType[0],
        };
        let userSub = {
          id: state?.activeSubscription?.key,
          name: state?.activeSubscription?.name,
          planType: planType[0],
          validity: state?.activeSubscription?.plans,
          subscribedOn: new Date(),
          isExpired: false,
          isRenewed: isRenew ? true : false,
        };
        if ("subscriptions" in userDetails) {
          userDetails.subscriptions.forEach((data, index) => {
            data.isExpired = true; //mark expired to all previous subscriptions
            if (index === userDetails.subscriptions.length - 1)
              userDetails.subscriptions.push(userSub);
          });
        } else userDetails.subscriptions = [userSub];
        updateUser(userDetails.key, userDetails).subscribe(() => {
          dispatch(loginUser(userDetails));
          console.log("updateUser userDetails>>>>>> ", userDetails);
          if (userDetails.subscribed) {
            setActiveStep(2);
            setShowSubscriptionDetails(true);
            sendEmailToAdmin();
            sendEmailToUser();
          }
        });
      });
    } catch (e) {
      console.log("Error: ", e);
    }
  };

  const proceedForPayment = (subscriptionDetails, isRenew) => {
    toggleButtonLoading("loading");
    const userData = {
      amount: subscriptionDetails.amount * 100,
      currency: "INR",
      receipt: loggedInUser.key,
    };

    let orderObj = {};
    orderObj[subscriptionDetails?.planType] = userData;
    try {
      postOrder(
        orderObj,
        [subscriptionDetails?.planType],
        "Monthly Subscription",
        loggedInUser,
        handlerFn,
        isRenew
      ).subscribe((response) => {
        console.log("postOrder response >>>>>", response);
        toggleButtonLoading("");
      });
    } catch (e) {
      console.log("Error: ", e);
    }
  };

  const setSubscription = (subscription) => {
    dispatch(setActiveSubscription(subscription));
    if (!isObjectEmpty(loggedInUser)) {
      if (subscription.endsIn2Days) {
        proceedForPayment(subscription, true); //second param true is for if user click to renew subscription
      } else {
        setActiveStep(1);
        setShowSubscriptionDetails(true);
        if (subscription.isSubscribed) setActiveStep(4);
        else setActiveStep(1);
      }
    } else {
      dispatch(enableLoginFlow({ type: "subscription" }));
      history.push({
        pathname: "/login",
        state: null,
      });
    }
  };

  function isValidSubscriptionBox(value) {
    let isSubscribed = false;
    if (!isObjectEmpty(loggedInUser)) {
      if (loggedInUser.planType === "premium") {
        isSubscribed = true;
      } else if (
        loggedInUser.planType === "pro" &&
        (value.planType === "pro" || value.planType === "startup")
      ) {
        isSubscribed = true;
      } else if (
        loggedInUser.planType === "startup" &&
        value.planType === "startup"
      ) {
        isSubscribed = true;
      } else {
        isSubscribed = false;
      }
    }
    return isSubscribed;
  }

  return (
    <div className="subscription subscriptionMainWrap subscription-outer charcoal-bg">
      <Loader value={isLoaderActive} />
      <div id="Subscription" className="charcoal-bg">
        <div className="subscription-wrap charcoal-bg">
          <div className="flex-3 heading-content">
            {pageTitle ? (
              <h1>{pageTitle}</h1>
            ) : (
              <h1>Unlimited Classes For The Price Of One</h1>
            )}

            {pageTitle ? (
              <div className="line1">
                Multiple Pricing with multiple features.
              </div>
            ) : (
              <div className="line1">
                Subscribe to our features at your ease and choice .
              </div>
            )}
          </div>
          <div className="inner-plans-wrap">
            {AvailableSubscriptions &&
              AvailableSubscriptions.map((subscription) => {
                return (
                  <div
                    className={`flex-2 plan ${subscription.planType} ${
                      subscription.isSubscribed ? "alreadySubscribed" : ""
                    }`}
                    onClick={() => setSubscription(subscription)}
                    key={subscription.key}
                  >
                    {subscription.endsIn2Days && (
                      <div className="ending-label-wrapper">
                        <div className="ending-label">
                          {subscription.endsIn2Days}
                        </div>
                      </div>
                    )}
                    <div className="plan_tag">{subscription.name}</div>
                    <div className="plan_price">
                      @{subscription.amount}
                      <span>{subscription.plans === 1 ? "Monthly" : ""}</span>
                    </div>
                    <div className="featuresBox">
                      {/* <p>Multiple <strong>Videos</strong> upload</p> */}
                      {subscription.isCompetitionAccess ? (
                        <p>
                          Enrollment in all the active{" "}
                          <strong>Competitions</strong>
                        </p>
                      ) : (
                        ""
                      )}
                      {subscription.isLessonAccess ? (
                        <p>
                          Access to all <strong>Lessons</strong> videos
                        </p>
                      ) : (
                        ""
                      )}
                      {subscription.isHHIAccess ? (
                        <p>
                          Access to{" "}
                          <strong>Hip-hop International Championship</strong>{" "}
                          registration
                        </p>
                      ) : (
                        ""
                      )}
                      {subscription.desc.length ? (
                        <p>{subscription.desc}</p>
                      ) : (
                        ""
                      )}
                    </div>
                    {!subscription.isSubscribed ? (
                      <p className="expireWrap">
                        Offer valid till{" "}
                        <strong>{subscription.endingDate}</strong>
                      </p>
                    ) : (
                      <p className="expireWrap">
                        Subscription valid till{" "}
                        <strong>{subscription.endingDate}</strong>
                      </p>
                    )}
                    {subscription.endsIn2Days ? (
                      <div className={`btn primary-light subscribed`}>
                        Renew
                      </div>
                    ) : (
                      <div
                        className={`btn primary-light ${
                          subscription.isSubscribed ? "subscribed" : ""
                        }`}
                      >
                        {subscription.isSubscribed
                          ? "Already subscribed"
                          : "Buy subscription"}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </div>
      {showSubscriptionDetails && loggedInUser.key && (
        <BuySubscription
          handleClose={() => setShowSubscriptionDetails(false)}
          activeStep={activeStep}
          buttonLoadingClass={buttonLoadingClass}
          proceedForPayment={(subDetails, isRenew) =>
            proceedForPayment(subDetails, isRenew)
          }
        />
      )}
    </div>
  );
}

export default Subscriptions;
