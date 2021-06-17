/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
/* eslint-disable handle-callback-err */
/* eslint-disable prefer-arrow-callback */
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const cors = require("cors")({
  origin: true,
});
let razorpayconfig = require("./test.json");
let oauthservice = require("./credentials.json");
razorpayconfig = razorpayconfig.razorpayservice;
const Razorpay = require("razorpay");

admin.initializeApp(functions.config().firebase);
var db = admin.firestore();

// if (Object.keys(functions.config()).length) {
// 	razorpayconfig = functions.config().razorpayservice;
// 	console.log("razorpayconfig", razorpayconfig);
// 	oauthservice = functions.config().oauthservice;
// 	console.log("oauthservice", oauthservice);
// }

let { clientsecret, clientid, redirecturi, refreshtoken, sendemailfrom } =
  oauthservice;

// post order to razorpay
exports.postOrder = functions.https.onRequest((request, response) => {
  // console.log(' post order to razorpay', request.body)
  return cors(request, response, () => {
    var instance = new Razorpay({
      key_id: razorpayconfig.key,
      key_secret: razorpayconfig.secret,
    });
    var options = request.body;
    const identifier = Object.keys(options)[0];  //order type -- "startup" Subscription / "premium" Subscription / "event" Competition
    const data = options[identifier];            //{ "amount": 19900-- order amount, "currency": "INR", "receipt": "EM9ronoBLk2Q70OMk2wg-- user id" }
    let paymentDetails = null;


    const getPaymentByUserKey = async (options) => {
      const paymentRef = db
        .collection("payments")
        .doc(options.receipt.toString());
      const doc = await paymentRef.get();
      if (!doc.exists) {
        console.log("No such document!");
      } else {
        paymentDetails = doc.data();
        console.log("paymentDetails", paymentDetails);
      }
    };

    getPaymentByUserKey(data)
      .then(() => {
        // console.log("if existing paymentDetails data: ", data);
        if (paymentDetails) {
          if (paymentDetails[identifier] === identifier && paymentDetails[identifier].id !== paymentDetails[identifier].razorpay_payment_id) {
            response.send(paymentDetails);
            return paymentDetails;
          } else {
            instance.orders.create(data, function (err, order) {
              if (err) {
                response.send(err);
                console.log('post order to razorpay err: ', err);
                return err;
              } else {
                const paymentRef = db.collection("payments");
                let newOrderdata = {};
                newOrderdata[identifier] = order;
                let mergedData = { ...paymentDetails, ...newOrderdata };
                // console.log("post order to razorpay new payment collection doc data:", mergedData);
                paymentRef.doc(order.receipt).set(mergedData);
                response.send(mergedData);
                return mergedData;
              }
            });
          }
        } else {
          console.log("if existing paymentDetails not available ");
          instance.orders.create(data, function (err, order) {
            if (err) {
              console.log('post order to razorpay err: ', err);
              response.send(err);
              return err;
            } else {
              // console.log('post order to razorpay response: ', order);
              const paymentRef = db.collection("payments");
              let newOrderdata = {};
              newOrderdata[identifier] = order;
              paymentRef
                .doc(newOrderdata[identifier].receipt.toString())
                .set(newOrderdata);
              // console.log("post order to razorpay new payment collection doc data:", newOrderdata);
              response.send(newOrderdata);
              return newOrderdata;
            }
          });
        }
        return paymentDetails;
      })
      .catch((err) => {
        return err;
      });
  });
});

// Add Razor Pay payment details
exports.updatePayment = functions.https.onRequest((request, response) => {
  // console.log('inside updatePayment', request)
  return cors(request, response, () => {
    // console.log('inside updatePayment', request)
    var options = request.body;
    const identifier = Object.keys(options)[0];
    const data = options[identifier];
    console.log("updatePayment options", options);
    const paymentRef = db.collection("payments");
    paymentRef.doc(options[identifier].receipt).set(options);
    response.send(options);
    return;
  });
});
// send email
async function sendMailToReceiptent(to, subject, html) {
  const oAuth2Client = new google.auth.OAuth2(
    clientid,
    clientsecret,
    redirecturi
  );
  oAuth2Client.setCredentials({
    refresh_token: refreshtoken,
  });
  try {
    const accessToken = await oAuth2Client.getAccessToken();
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: sendemailfrom,
        clientId: clientid,
        clientSecret: clientsecret,
        refreshToken: refreshtoken,
        accessToken: accessToken,
      },
    });

    var mailOptions = {
      from: '"Boogalu" <' + sendemailfrom + ">",
      to: to,
      subject: subject,
      html: html,
    };

    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    return error;
  }
}
// new implementation is below :
exports.sendEmail = functions.https.onRequest((request, response) => {
  return cors(request, response, () => {
    var to = request.body.mailTo;
    var subject = request.body.title;
    var html = request.body.content;
    sendMailToReceiptent(to, subject, html)
      .then((result) => {
        console.log("Email Sent", result);
        if (result && result.code && result.code === "400") {
          return response.status(401).send({
            status: 401,
            data: "Failed.",
          });
        } else {
          return response.status(200).send({
            status: 200,
            data: "Email sent succefully.",
          });
        }
      })
      .catch((error) => {
        return response.status(400).send({
          status: 400,
          statusText: "Email sending failed",
          error: error,
        });
      });
  });
});


async function getActiveSubscriptionUsers() {
  return new Promise((res, rej) => {
    const userRef = db.collection("users").where('subscribed', '==', true).get();
    userRef.then((querySnapshot) => {
      let users = []
      querySnapshot.forEach(function (doc) {
        let data = doc.data();
        if (data.subscriptions && data.subscribed) {
          //data.subscriptions means user is subscribed for one or more subscription plan
          //subscribed means user with currently active subscription plan
          data.id = doc.id;
          const { email, subscriptions, id, subEndingReminderSend, subEndedReminderSend } = data;
          users.push({ email, subscriptions, id, subEndingReminderSend, subEndedReminderSend });
        }
      })
      res(users);
      return;
    })
  })
}

function sendEmailToEndingSubUser(userList) {
  return new Promise((res, rej) => {
    if (userList.length !== 0) {
      let emailBody = `<div>
        <h3>Just 2 days left to end your subscription</h3>
        <h6 style="font-size: 17px;margin-bottom: 26px;">Hi dear subscriber,</h6>
        <div> Your Boogalu subscription ends in 2 days, for more subscription details click the link bellow</div>
        <a href="https://boogalusite.web.app/subscription">My Subscriptions</a>
        </div>`;
      const title = `2 days left - Boogalu Subscription`;
      const userRef = db.collection("users")
      let emailList = userList.map((data) => data.email);
      console.log('Subscription Ending emailList :', emailList);
      //send email to users
      sendMailToReceiptent(emailList, title, emailBody).then((result) => {
        userList.forEach((user, index) => {
          //update user subEndingReminderSend key in user obj saying that reminder send to user successfully
          // eslint-disable-next-line promise/no-nesting
          userRef.doc(user.id).update({ 'subEndingReminderSend': true }).then(() => {
            console.log('Reminder send to: ', user.email);
          }).catch(() => { });
          if (index === userList.length - 1) res({ result: "Reminder Emails send Successfully" });
        })
      }).catch((err) => {
        // eslint-disable-next-line prefer-promise-reject-errors
        rej({ result: "Reminder Emails sending failed" })
      })
    } else res({ result: "No user available to send reminder email" });
  })
}

function sendEmailToEndedSubUser(userList) {
  return new Promise((res, rej) => {
    res({ "sendEmailToEndedSubUser:": userList })
    if (userList.length !== 0) {
      let emailBody = `<div>
        <h3>Your subscription ended</h3>
        <h6 style="font-size: 17px;margin-bottom: 26px;">Hi dear subscriber,</h6>
        <div> Your Boogalu subscription ended today, for more subscription details click the link bellow</div>
        <a href="https://boogalusite.web.app/subscription">Subscriptions</a>
        </div>`;
      const title = `Boogalu Subscription Ended`;
      const userRef = db.collection("users")
      let emailList = userList.map((data) => data.email);
      console.log('Subscription Ended emailList :', emailList);
      //send email to users
      sendMailToReceiptent(emailList, title, emailBody).then(() => {
        userList.forEach((user, index) => {
          //update user subEndedReminderSend key in user obj saying that sub end notification email send to user successfully
          //update user subscribed key to false
          // eslint-disable-next-line promise/always-return
          // eslint-disable-next-line promise/no-nesting
          userRef.doc(user.id).update({ 'subEndedReminderSend': true, 'subscribed': false }).then(() => {
            console.log('Sub ended email send to: ', user.email);
          }).catch(() => { });
          if (index === userList.length - 1) res({ result: "Subscription ended notification emails send successfully" });
        })
      }).catch((err) => {
        // eslint-disable-next-line prefer-promise-reject-errors
        rej({ result: "Subscription ended notification emails sending failed" })
      })
    } else res({ result: "No user available to send subscription ended notification emails" });
  })
}

//send subscriptions End reminder emails
exports.subEndReminder = functions.https.onRequest((request, response) => {
  return cors(request, response, () => {
    console.log('inside subEndReminder')
    getActiveSubscriptionUsers().then((usersList) => {
      console.log('active subscriptions users list: ', usersList);
      const timeStampToNewDate = (timeStamp) => {
        return new Date(timeStamp.seconds * 1000 + Math.round(timeStamp.nanoseconds / 1000000));
      }
      //get users list whose subscription end in 2 days
      let twoDaysAfterCurrentDate = new Date();
      twoDaysAfterCurrentDate.setDate(new Date().getDate() + 2);
      let usersWithSubEnding = [];
      let usersWithSubEnded = [];
      usersList.forEach((userData) => {
        //subEndingReminderSend == true means reminder email already send
        if (!userData.subEndingReminderSend) {
          userData.subscriptions.forEach((subData) => {
            if (!subData.isExpired && !usersWithSubEnding.includes(userData.email)) {
              //ignore all expired subscriptions
              //check any user whose subscription is in expiring plans list then do not check further plans
              let subscriptionDate = new Date(timeStampToNewDate(subData.subscribedOn));//original subscription date
              // let subDateAfter1Month = new Date(subscriptionDate.setDate(subscriptionDate.getDate() + 2));
              let subDateAfter1Month = new Date(subscriptionDate.setMonth(subscriptionDate.getMonth() + (subData.validity || 1)));//subscription date after 1 month 
              if (subDateAfter1Month > new Date() && subDateAfter1Month <= twoDaysAfterCurrentDate) {
                //it means subscription plan is currently active && it means subscription ends after two days
                usersWithSubEnding.push(userData);
              }
            }
          })
        }
        //subEndedReminderSend == true means sub ended notification email already send
        if (!userData.subEndedReminderSend && userData.subEndingReminderSend) {
          userData.subscriptions.forEach((subData) => {
            if (!subData.isExpired && !usersWithSubEnded.includes(userData.email)) {
              //ignore all expired subscriptions
              //check any user whose subscription is in ended plans list then do not check further plans
              let subscriptionDate = new Date(timeStampToNewDate(subData.subscribedOn));//original subscription date
              // let subDateAfter1Month = new Date(subscriptionDate.setDate(subscriptionDate.getDate() + 2));
              let subDateAfter1Month = new Date(subscriptionDate.setMonth(subscriptionDate.getMonth() + (subData.validity || 1)));//subscription date after 1 month 
              if (subDateAfter1Month <= new Date()) {
                //it means subscription plan ended before current time
                subData.isExpired = true;
                usersWithSubEnded.push(userData);
              }
            }
          })
        }
      })
      console.log('usersWithSubEnding users list: ', usersWithSubEnding, new Date());
      console.log('usersWithSubEnded users list: ', usersWithSubEnded, new Date());
      if (usersWithSubEnding.length !== 0 || usersWithSubEnded.length !== 0) {
        // eslint-disable-next-line promise/no-nesting
        Promise.all([sendEmailToEndingSubUser(usersWithSubEnding), sendEmailToEndedSubUser(usersWithSubEnded)])
          // eslint-disable-next-line promise/always-return
          .then((result) => {
            console.log('email sending response result', result)
            response.status(200).send({
              status: 200,
              data: result,
            })
          })
      } else {
        response.status(200).send({
          status: 200,
          data: 'No expiring/ended subscriptions user for email sending',
        })
      }
      return;
    }).catch(() => { })
    return;
  });
});