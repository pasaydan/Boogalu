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


//send subscriptions End reminder emails
exports.subEndReminder = functions.https.onRequest((request, response) => {
  return cors(request, response, () => {
    console.log('inside subEndReminder')
    const getActiveSubscriptionUsers = async () => {
      return new Promise((res, rej) => {
        const paymentRef = db
          .collection("users")
          .where('subscribed', '==', true).get().then((querySnapshot) => {
            let users = []
            querySnapshot.forEach(function (doc) {
              let data = doc.data();
              const { email, subscriptions } = data;
              users.push({ email, subscriptions });
            })
            res(users);
          })
      })
    };

    getActiveSubscriptionUsers().then((usersList) => {
      // console.log('active subscriptions users list: ', usersList);
      const timeStampToNewDate = (timeStamp) => {
        return new Date(timeStamp.seconds * 1000 + Math.round(timeStamp.nanoseconds / 1000000));
      }
      //get users list whose subscription end in 2 days
      let twoDaysAfterCurrentDate = new Date();
      twoDaysAfterCurrentDate.setDate(new Date().getDate() + 2);
      let expiringSubscriptions = [];
      usersList.map((userData) => {
        if (userData.subscriptions) {
          userData.subscriptions.map((subData) => {
            if (!expiringSubscriptions.includes(userData.email)) {//check any user whose subscription is in expiring plans list then do not check further plans
              let subscriptionDate = new Date(timeStampToNewDate(subData.subscribedOn));//original subscription date
              let subDateAfter1Month = new Date(subscriptionDate.setDate(subscriptionDate.getDate() + 2));
              // subDateAfter1Month.setMonth(subDateAfter1Month.getMonth() + 1);//subscription date after 1 month 
              if (subDateAfter1Month > new Date() && subDateAfter1Month <= twoDaysAfterCurrentDate) {
                //it means subscription plan is currently active && it means subscription ends after two days
                expiringSubscriptions.push(userData.email);
              }
            }
          })
        }
      })
      console.log('expiringSubscriptions users list: ', expiringSubscriptions, new Date());
      if (expiringSubscriptions.length != 0 && false) {
        let emailBody = `<div>
          <h3>Just 2 days left to end your subscription</h3>
          <h6 style="font-size: 17px;margin-bottom: 26px;">Hi dear subscriber,</h6>
          <div> Your Boogalu subscription ends in 2 days, for more subscription details click the link bellow</div>
          <a href="https://boogalusite.web.app/subscription">My Subscriptions</a>
          </div>`;
        const title = `2 days left - Boogalu Subscription`;
        sendMailToReceiptent(expiringSubscriptions, title, emailBody).then((result) => {
          console.log("email sending result: ", result)
          response.status(200).send({
            status: 200,
            data: { expiringSubscriptions, result },
          })
        }).catch((err) => {
          response.status(400).send({
            status: 400,
            data: 'Email sending failed',
          })
        })
      } else {
        response.status(200).send({
          status: 200,
          data: 'No expiring subscriptions',
        })
      }
    })
    return;
  });
});