import React, { useState, useEffect } from "react";
import CompetitionsDetails from "../CompetitionsDetails";
import { getActiveCompetitionsList } from "../../Services/Competition.service";
import { useStoreConsumer } from "../../Providers/StateProvider";
import { setActiveCompetition } from "../../Actions/Competition";
import { getCompetitionByUserId } from "../../Services/EnrollCompetition.service";
import { getActiveSubscriptionsList } from "../../Services/Subscription.service";
import ImageCarousel from "../ImageCarousel";
import { truncateLargeText } from "../../helpers";
import { disableLoginFlow, enableLoginFlow } from "../../Actions/LoginFlow";
import { loginUser } from "../../Actions/User";
import * as $ from "jquery";
import { updateUser } from "../../Services/User.service";
// eslint-disable-next-line no-unused-vars
import { postOrder, updatePayment } from "./../../Services/Razorpay.service";
import Button from "@material-ui/core/Button";
import { isObjectEmpty } from "../../helpers";
import { useHistory } from "react-router-dom";
import { displayNotification } from "../../Actions/Notification";
import { NOTIFICATION_INFO, NOTIFICATION_SUCCCESS } from "../../Constants";
import { EmailTemplate } from "../EmailTemplate/Emailer";
import { sendEmail } from "../../Services/Email.service";
import Loader from "../Loader";
const eventsList = require("../../Data/events.json");

function Competitions() {
  const history = useHistory();
  const { state, dispatch } = useStoreConsumer();
  const [eventsData, setEventsData] = useState(eventsList.events);
  const [isOpenDetailsModal, setIsOpenDetailsModal] = useState(false);
  const [CompletitionList, setCompletitionList] = useState(null);
  const [shouldOpenEventModal, toggleEventModal] = useState(false);
  const [clickedEventData, setEventData] = useState(null);
  const [initialStep, setInitialStep] = useState(1);
  const loggedInUser = state.loggedInUser;
  const [buttonLoadingClass, toggleButtonLoading] = useState("");
  const [openPaymentSuccessModal, setOpenPaymentSuccessModal] = useState(false);
  const [subscriptionsList, setSubscriptionList] = useState([]);
  const [isLoaderActive, toggleLoading] = useState(false);
  const prepareUserCompData = (allCompList) => {
    return new Promise((res, rej) => {
      getCompetitionByUserId(loggedInUser.key).subscribe((userCompList) => {
        toggleLoading(false);
        if (userCompList.length) {
          allCompList.forEach((compDetails) => {
            let isUserEnrolled = userCompList.filter(
              (userCompData) => userCompData.compId === compDetails.key
            );
            if (isUserEnrolled.length) {
              compDetails.isUserEnrolled = true;
              compDetails.userSubmitedDetails = isUserEnrolled[0];
            }
          });
          res(allCompList);
        } else res(allCompList);
      });
    });
  };

  useEffect(() => {
    $("html,body").animate(
      {
        scrollTop: 0,
      },
      700
    );
    toggleLoading(true);
    getActiveCompetitionsList().subscribe((allCompList) => {
      if (allCompList.length && loggedInUser.email && loggedInUser.phone) {
        // get user submitted competition details
        prepareUserCompData(allCompList).then((compListWithUserData) => {
          setCompletitionList(compListWithUserData);
        });
      } else {
        toggleLoading(false);
        setCompletitionList(allCompList);
      }
    });
    try {
      toggleLoading(true);
      getActiveSubscriptionsList().subscribe((subscriptionsList) => {
        toggleLoading(false);
        setSubscriptionList(subscriptionsList);
      });
    } catch (e) {
      toggleLoading(false);
      console.log("Fetching subscription error: ", e);
    }
    // if user come from login page
    if (state.currentLoginFlow === "competition") {
      dispatch(disableLoginFlow());
      setIsOpenDetailsModal(true);
    } else if (state.currentLoginFlow === "competition-subscription") {
      // if user come from subscription page
      dispatch(disableLoginFlow());
      setIsOpenDetailsModal(true);
      setInitialStep(1);
    } else if (state.currentLoginFlow === "competition-uploadvdo") {
      // if user come from vdoUpload page
      dispatch(disableLoginFlow());
      setIsOpenDetailsModal(true);
      setInitialStep(3);
    } else if (state.currentLoginFlow === "competition-event") {
      eventImageClicked(state.currentLoginFlowData);
      dispatch(disableLoginFlow());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isObjectEmpty(loggedInUser)) {
      if (loggedInUser?.events) {
        const eventsDataCopy = [...eventsData];
        eventsDataCopy.forEach((event) => {
          let isEventAlreadyRegistered = loggedInUser?.events?.filter(
            (data) => data.type === event.type
          );
          if (
            isEventAlreadyRegistered &&
            isEventAlreadyRegistered?.length !== 0
          )
            event.isRegistered = true;
        });
        setEventsData(eventsDataCopy);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedInUser]);

  const openDetailsModal = (competition) => {
    if (competition.isUserEnrolled) setInitialStep(1);
    dispatch(setActiveCompetition(competition));
    setIsOpenDetailsModal(true);
  };

  function eventImageClicked(data, event) {
    if (event) {
      event.stopPropagation();
    }
    // console.log('event data: ', event);
    if (data?.id) {
      setEventData(data);
      toggleEventModal(true);
    }
  }

  function closeEventModal(event) {
    event.stopPropagation();
    setEventData(null);
    toggleEventModal(false);
  }

  const sendEmailAfterEventRegSuccess = () => {
    try {
      return new Promise((resolve, reject) => {
        const { email } = loggedInUser;
        const emailBodyConfig = {
          heading: `Hi ${loggedInUser.name},`,
          content: `<div>
                    <p>Thanks for registering for ${
                      clickedEventData.name
                    } You’re all set.</p>
                    ${
                      clickedEventData.offers
                        ? `<p>By registerging you will get ${clickedEventData.offers}.`
                        : ""
                    }
                    <p>To know more about event just click the link bellow.</p>
                    <div class="action-btn-wrap">
                        <a class="action" href=${
                          window.location.href
                        }>Events</a> 
                    </div>
                </div>`,
          bodyFooterText: `<div>See you soon!</div>`,
        };
        let payload = {
          mailTo: email,
          title: `Your registration is confirmed for ${clickedEventData.name}`,
          content: EmailTemplate(emailBodyConfig),
        };
        sendEmail(payload).subscribe((res) => {
          if (!("error" in res)) {
            console.log("User Email Send Successfully.");
            resolve();
          } else {
            console.log("User Email Send Failed.");
            reject();
          }
        });
      });
    } catch (e) {
      console.log("email to user error: ", e);
    }
  };
  const afterPaymentResponse = (response) => {
    // console.log("response", response);
    let updatedUserData = {
      ...loggedInUser,
    };
    let updatedEvent = {
      id: clickedEventData.id,
      type: clickedEventData.type,
      name: clickedEventData.name,
      fees: clickedEventData.fees,
      paymentDate: new Date(),
    };
    if (clickedEventData.offers) {
      updatedEvent["offer"] = clickedEventData.offers;
    }
    if ("events" in loggedInUser) {
      updatedUserData.events.push(updatedEvent);
    } else {
      updatedUserData.events = [updatedEvent];
    }
    if (!loggedInUser?.isSubscriptionOffer) {
      let offerSub = subscriptionsList.filter(
        (subData) =>
          subData.planType === clickedEventData?.subscription || "startup"
      );
      updatedUserData = {
        ...loggedInUser,
        ...updatedUserData,
        subscribed: true,
        subEndingReminderSend: false,
        subEndedReminderSend: false,
        planType: offerSub[0].planType,
      };
      if (
        loggedInUser &&
        loggedInUser?.subscribed &&
        loggedInUser?.planType === offerSub[0].planType
      ) {
        updatedUserData.subscriptions.forEach((subData) => {
          if (subData.planType === offerSub[0].planType && !subData.isExpired) {
            subData.validity += clickedEventData?.offerValidity;
          }
        });
      } else {
        let userSub = {
          id: offerSub[0]?.key,
          name: offerSub[0]?.name,
          planType: offerSub[0].planType,
          validity: clickedEventData?.offerValidity || 1,
          subscribedOn: new Date(),
          isExpired: false,
          isRenewed: false,
        };
        if ("subscriptions" in updatedUserData) {
          updatedUserData.subscriptions.forEach((data, index) => {
            data.isExpired = true; //mark expired to all previous subscriptions
            if (index === updatedUserData.subscriptions.length - 1)
              updatedUserData.subscriptions.push(userSub);
          });
        } else updatedUserData.subscriptions = [userSub];
      }
    }
    try {
      updateUser(updatedUserData.key, updatedUserData).subscribe(() => {
        dispatch(loginUser(updatedUserData));
        toggleEventModal(false);
        setEventData(null);
        setOpenPaymentSuccessModal(true);
        sendEmailAfterEventRegSuccess();
        dispatch(
          displayNotification({
            msg: `${clickedEventData.name} Event Registration successfully`,
            type: NOTIFICATION_SUCCCESS,
            time: 4000,
          })
        );
        // console.log('updateUser updatedUserData>>>>>> ', updatedUserData);
      });
    } catch (e) {
      console.log("Error: ", e);
    }
  };

  const proceedForPayment = () => {
    if (!isObjectEmpty(loggedInUser)) {
      if (
        clickedEventData &&
        new Date(
          clickedEventData?.info?.registrationLastDate
        ).toDateString() === new Date().toDateString()
      ) {
        dispatch(
          displayNotification({
            msg: `${clickedEventData.name} registration has been closed!`,
            type: NOTIFICATION_INFO,
            time: 6000,
          })
        );
      } else {
        toggleButtonLoading("loading");
        const userData = {
          amount: clickedEventData.fees * 100,
          currency: "INR",
          receipt: loggedInUser.key,
        };

        let orderObj = {};
        orderObj[clickedEventData?.type] = userData;
        try {
          postOrder(
            orderObj,
            [clickedEventData?.type],
            "Monthly Subscription",
            loggedInUser,
            afterPaymentResponse
          ).subscribe((response) => {
            // console.log('postOrder response >>>>>', response);
            toggleButtonLoading("");
          });
        } catch (e) {
          console.log("Error: ", e);
        }
      }
    } else {
      dispatch(
        enableLoginFlow({ type: "competition-event", data: clickedEventData })
      );
      history.push({
        pathname: "/login",
        state: null,
      });
    }
  };

  function returnEventFormatedDate(eventInfo) {
    return `
            ${new Date(eventInfo?.from).toDateString()} to ${new Date(
      eventInfo?.to
    ).toDateString()}
            `;
  }

  return (
    <div className="competition-wrap">
      <Loader value={isLoaderActive} />
      <ImageCarousel
        carouselData={eventsData}
        imgClickCallback={eventImageClicked}
      />
      <div className="competition-inner">
        <div className="title-wrap">
          <h1>Events</h1>
          <div className="competition-desc">
            Participate in different competitions &amp; win exciting prizes.
          </div>
        </div>
        <ul className="competition-list">
          {eventsData && eventsData.length
            ? eventsData.map((event) => {
                return (
                  <li
                    key={event.id}
                    onClick={(e) => eventImageClicked(event, e)}
                  >
                    <img src={event.imgUrlForTiles} alt={event.name} />
                    <h2>
                      <span className="title">{event.name}</span>
                      <span className="otherInfo">
                        Registration fees: <i>&#8377;</i>
                        {event.fees}/- only
                        <br />
                      </span>
                      <span className="otherInfo">
                        Offer: {event.offers}
                        <br />
                      </span>
                      {clickedEventData &&
                      event.id === clickedEventData?.id &&
                      clickedEventData?.isRegistered ? (
                        <span className="enrolledMessage">
                          Already registered
                        </span>
                      ) : (
                        ""
                      )}
                    </h2>
                  </li>
                );
              })
            : ""}
          {CompletitionList &&
            CompletitionList.map((competition) => {
              return (
                <li
                  key={competition.name + "-id"}
                  onClick={() => openDetailsModal(competition)}
                >
                  {competition.type && competition.type === "upcoming" ? (
                    <span className="upcomingLabel">Upcoming</span>
                  ) : (
                    ""
                  )}
                  <img src={competition.img} alt={competition.name} />
                  <h2>
                    <span className="title">{competition.name}</span>
                    <span className="otherInfo">
                      {truncateLargeText(competition.desc, 60)}
                      <br />
                    </span>
                    <span className="otherInfo">
                      Enrollment open: {competition.startingDate} to{" "}
                      {competition.endingDate}
                      <br />
                    </span>
                    {competition.isUserEnrolled ? (
                      <span className="enrolledMessage">
                        Already Enrolled - Choose another video
                      </span>
                    ) : (
                      ""
                    )}
                  </h2>
                </li>
              );
            })}
        </ul>
        {isOpenDetailsModal && (
          <CompetitionsDetails
            open={isOpenDetailsModal}
            handleClose={() => setIsOpenDetailsModal(false)}
            initialStep={initialStep}
          />
        )}
      </div>
      {shouldOpenEventModal && clickedEventData?.id ? (
        <div className="eventDetailModal">
          <div className="eventDetailInner">
            <p className="closeModal" onClick={(e) => closeEventModal(e)} />
            <h3>{clickedEventData.name}</h3>
            <div className="mainInnerConent">
              {clickedEventData?.imgUrl ? (
                <div className="imgWrap">
                  <img
                    src={clickedEventData.imgUrl}
                    alt={`alt-${clickedEventData.id}`}
                  />
                </div>
              ) : (
                ""
              )}
              {clickedEventData?.fees ? (
                <div className="eventDate registrationFees">
                  <span>Registration fee: </span>
                  <span className="value">
                    <i>&#8377;</i> {`${clickedEventData.fees}/-`} only
                  </span>
                </div>
              ) : (
                ""
              )}
              {clickedEventData?.offers &&
              !loggedInUser?.isSubscriptionOffer ? (
                <div className="eventDate registrationFees">
                  <span>Offer: </span>
                  <span className="value">{clickedEventData.offers}</span>
                </div>
              ) : (
                ""
              )}
              <div className="modalIfoWrap">
                <h3>More Information</h3>
                <div className="innerInformation">
                  {clickedEventData?.info?.registrationStartDate ? (
                    <div className="eventDate">
                      <span>Registration start date: </span>
                      <span className="value">
                        {new Date(
                          clickedEventData.info.registrationStartDate
                        ).toDateString()}
                      </span>
                    </div>
                  ) : (
                    ""
                  )}
                  {clickedEventData?.info?.registrationLastDate ? (
                    <div className="eventDate">
                      <span>Registration last date: </span>
                      <span className="value">
                        {new Date(
                          clickedEventData.info.registrationLastDate
                        ).toDateString()}
                      </span>
                    </div>
                  ) : (
                    ""
                  )}
                  {clickedEventData?.info?.categories &&
                  clickedEventData?.info?.categories.length ? (
                    <div className="eventInnerSection">
                      <h4>Categories:</h4>
                      {clickedEventData.info.categories.map((item, index) => {
                        return (
                          <p key={`category-item-${index}`}>
                            <span className="number strong">
                              {index + 1}.&nbsp;
                            </span>
                            <span className="division strong">
                              {item.div}&nbsp;
                            </span>
                            <span className="age light">
                              [{item.age}]&nbsp;
                            </span>
                            <span className="members light">
                              ({item.members}) members
                            </span>
                          </p>
                        );
                      })}
                    </div>
                  ) : (
                    ""
                  )}
                  {clickedEventData?.info?.preVideoSubmisstionDate ? (
                    <div className="eventInnerSection">
                      <h4>Preliminary round:</h4>
                      <p>
                        <strong>Submission date:</strong>
                        &nbsp;
                        <span>
                          {returnEventFormatedDate(
                            clickedEventData?.info?.preVideoSubmisstionDate
                          )}
                        </span>
                      </p>
                      <p>
                        <strong>Broadcasting date:</strong>
                        &nbsp;
                        <span>
                          {new Date(
                            clickedEventData?.info?.preVideoSubmisstionDate?.broadCastingDate
                          ).toDateString()}
                        </span>
                      </p>
                      <p>
                        <strong>Result date:</strong>
                        &nbsp;
                        <span>
                          {new Date(
                            clickedEventData?.info?.preRoundResultDate
                          ).toDateString()}
                        </span>
                      </p>
                      <p>
                        <strong>Late fee:</strong>
                        &nbsp;
                        <span>
                          <i>&#8377;</i>{" "}
                          {
                            clickedEventData?.info?.preVideoSubmisstionDate
                              ?.lateFee
                          }{" "}
                          /-
                        </span>
                      </p>
                    </div>
                  ) : (
                    ""
                  )}
                  {clickedEventData?.info?.grandFinaleVideoSubmissionDate ? (
                    <div className="eventInnerSection">
                      <h4>Grand Finale round:</h4>
                      <p>
                        <strong>Submission date:</strong>
                        &nbsp;
                        <span>
                          {returnEventFormatedDate(
                            clickedEventData?.info
                              ?.grandFinaleVideoSubmissionDate
                          )}
                        </span>
                      </p>
                      <p>
                        <strong>Broadcasting date:</strong>
                        &nbsp;
                        <span>
                          {new Date(
                            clickedEventData?.info?.grandFinaleVideoSubmissionDate?.broadCastingDate
                          ).toDateString()}
                        </span>
                      </p>
                      <p>
                        <strong>Late fee:</strong>
                        &nbsp;
                        <span>
                          <i>&#8377;</i>{" "}
                          {
                            clickedEventData?.info
                              ?.grandFinaleVideoSubmissionDate?.lateFee
                          }{" "}
                          /-
                        </span>
                      </p>
                    </div>
                  ) : (
                    ""
                  )}
                  {clickedEventData?.info?.inquiry ? (
                    <div className="eventInnerSection">
                      <h4>Inquiry/Contact details:</h4>
                      <p>
                        <strong>Phone:</strong>&nbsp;
                        {clickedEventData?.info?.inquiry?.phone1 ? (
                          <a
                            title="Call for any query"
                            href={`tel:${clickedEventData.info.inquiry.phone1}`}
                          >
                            {clickedEventData.info.inquiry.phone1}
                          </a>
                        ) : (
                          ""
                        )}
                        {clickedEventData?.info?.inquiry?.phone2 ? (
                          <a
                            title="Call for any query"
                            href={`tel:${clickedEventData.info.inquiry.phone2}`}
                          >{` | ${clickedEventData.info.inquiry.phone2}`}</a>
                        ) : (
                          ""
                        )}
                      </p>
                      {clickedEventData?.info?.inquiry?.whatsapp ? (
                        <p>
                          <strong>Whatsapp:</strong>
                          &nbsp;
                          <a
                            title="Whatsapp for any query"
                            href={`https://wa.me/${
                              clickedEventData.info.inquiry.whatsapp
                            }?text=${encodeURIComponent(
                              clickedEventData.info.inquiry.whatsappMessage
                            )}`}
                          >{`+${clickedEventData.info.inquiry.whatsapp}`}</a>
                        </p>
                      ) : (
                        ""
                      )}
                      {clickedEventData?.info?.inquiry?.email ? (
                        <p>
                          <strong>Email:</strong>
                          &nbsp;
                          <a
                            title="email for any query"
                            href={`mailto:${clickedEventData.info.inquiry.email}`}
                          >
                            {clickedEventData.info.inquiry.email}
                          </a>
                        </p>
                      ) : (
                        ""
                      )}
                    </div>
                  ) : (
                    ""
                  )}
                  {clickedEventData?.info?.followLinks ? (
                    <div className="eventInnerSection">
                      <h4>Follow us for updates:</h4>
                      <p>
                        <strong>Facebook:</strong>
                        <br />
                        <a
                          href={clickedEventData?.info?.followLinks?.facebook}
                          rel="noreferrer"
                          target="_blank"
                        >
                          {clickedEventData?.info?.followLinks?.facebook}
                        </a>
                      </p>
                      <p>
                        <strong>Youtube:</strong>
                        <br />
                        <a
                          href={clickedEventData?.info?.followLinks?.youtube}
                          rel="noreferrer"
                          target="_blank"
                        >
                          {clickedEventData?.info?.followLinks?.youtube}
                        </a>
                      </p>
                      <p>
                        <strong>Twitter:</strong>
                        <br />
                        <a
                          href={clickedEventData?.info?.followLinks?.twitter}
                          rel="noreferrer"
                          target="_blank"
                        >
                          {clickedEventData?.info?.followLinks?.twitter}
                        </a>
                      </p>
                      <p>
                        <strong>Instagram:</strong>
                        <br />
                        <a
                          href={clickedEventData?.info?.followLinks?.instagram}
                          rel="noreferrer"
                          target="_blank"
                        >
                          {clickedEventData?.info?.followLinks?.instagram}
                        </a>
                      </p>
                      <p>
                        <strong>HHI Website:</strong>
                        <br />
                        <a
                          href={clickedEventData?.info?.followLinks?.website}
                          rel="noreferrer"
                          target="_blank"
                        >
                          {clickedEventData?.info?.followLinks?.website}
                        </a>
                      </p>
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              </div>
              {clickedEventData?.info?.rules ? (
                <div className="eventDate">
                  <a
                    href={clickedEventData.info.rules}
                    target="_blank"
                    rel="noreferrer"
                    title="Rules and regulations"
                  >
                    Terms &amp; rules of event
                  </a>
                </div>
              ) : (
                ""
              )}
              {clickedEventData?.info?.judges &&
              clickedEventData?.info?.judges.length ? (
                <div className="judgesWrap modalIfoWrap">
                  <h3>Our Judges</h3>
                  {clickedEventData.info.judges.map((item, index) => {
                    return (
                      <div className="judgesItem" key={`judge-id-${index}`}>
                        <p className="name">
                          {item.name},<span>{item.place}</span>
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                ""
              )}
            </div>
            {new Date(
              clickedEventData.info.registrationLastDate
            ).toDateString() === new Date().toDateString() ? (
              <p className="btn primary-light registeredInfoBtn disabled">
                Registration closed
              </p>
            ) : clickedEventData.isRegistered ? (
              <p className="btn primary-light registeredInfoBtn">
                You have already registered
              </p>
            ) : (
              <button
                className={
                  buttonLoadingClass
                    ? `${buttonLoadingClass} btn primary-dark`
                    : "btn primary-dark"
                }
                onClick={proceedForPayment}
              >
                Register &amp; pay {clickedEventData?.fees}/-
              </button>
            )}
          </div>
        </div>
      ) : (
        ""
      )}

      {openPaymentSuccessModal ? (
        <div className="eventDetailModal">
          <div className="eventDetailInner">
            <p
              className="closeModal"
              onClick={(e) => setOpenPaymentSuccessModal(false)}
            />
            <h3>Success !</h3>
            <div>
              <p className="subscriptionMessage success">
                Payment For Event Registration Recieved Successfully
              </p>
              <div className="actionWrap success">
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={(e) => setOpenPaymentSuccessModal(false)}
                >
                  Explore competition
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

export default Competitions;
