/* eslint-disable handle-callback-err */
/* eslint-disable prefer-arrow-callback */
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const cors = require('cors')({
    origin: true,
});
let razorpayconfig = require('./test.json');
razorpayconfig = razorpayconfig.razorpayservice;
const Razorpay = require('razorpay');

admin.initializeApp(functions.config().firebase);
var db = admin.firestore();

if (Object.keys(functions.config()).length) {
    razorpayconfig = functions.config().razorpayservice;
}
// post order to razorpay
exports.postOrder = functions.https.onRequest((request, response) => {
    return cors(request, response, () => {
        var instance = new Razorpay({ key_id: razorpayconfig.key, key_secret: razorpayconfig.secret })
        var options = request.body;
        let paymentDetails = null;

        const getPaymentByUserKey = async (options) => {
            const paymentRef = db.collection('payments').doc(options.receipt.toString());
            const doc = await paymentRef.get();
            if (!doc.exists) {
                console.log('No such document!');
            } else {
                paymentDetails = doc.data();
                console.log("paymentDetails", paymentDetails);
                // if (doc.data())
            }
        }

        getPaymentByUserKey(options)
            .then(() => {
                if (paymentDetails && paymentDetails.id !== paymentDetails.razorpay_payment_id) {
                    response.send(paymentDetails)
                    return paymentDetails;
                } else {
                    instance.orders.create(options, function(err, order) {
                        if (err) {
                            response.send(err)
                            console.error('err >>>>>', err);
                            return err;
                        } else {
                            const paymentRef = db.collection('payments');
                            paymentRef
                                .doc(order.receipt)
                                .set(order);
                            response.send(order)
                            return order;
                        }
                    });
                }
                return;
            }).catch((err) => {
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
        console.log('updatePayment options', options)
        const paymentRef = db.collection('payments');
        paymentRef
            .doc(options.receipt)
            .set(options);
        response.send(options);
        return
    });
});

const oAuthClientSecret = 's5Ig826BsWQ-rZgKgCJXSvLK';
const oAuthClientId = '464245437134-1qccb55ud19aia82tdnv6rbi237g6lbc.apps.googleusercontent.com';
const refreshToken = '1//04ZOcCUbJxxhJCgYIARAAGAQSNwF-L9Irgytn1oVM25nbKDYA-4PTsjocBIVtnWguQTPCApZ0M1d8iAhewPmYJFiKUiX8alX_n-g';
const accessToken = 'ya29.a0AfH6SMBLHbXiegiILpPpJiwRBvSC2D9a5SGruXhFy_8s0MJm0mhMq4ms8div_nvakQeDsa2hoPHkFEYyyKLqYxqFv8kTZ_63XwWvfytZIEbHGpkKF5avZUJ_o2jjOrzKvZe4RKAcUtn5Hxu8Au2L5LjTLj-w';
let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        type: 'OAuth2',
        clientId: oAuthClientId,
        clientSecret: oAuthClientSecret,
        refreshToken: refreshToken,
        accessToken: accessToken,
    }
});

transporter.set('oauth2_provision_cb', (user, renew, callback) => {
    let accessToken = userTokens[user];
    if(!accessToken){
        return callback(new Error('Unknown user'));
    }else{
        return callback(null, accessToken);
    }
});

//send email 
exports.sendEmail = functions.https.onRequest((request, response) => {
    return cors(request, response, () => {
        var to = request.body.mailTo;
        var subject = request.body.title;
        var html = request.body.content;
        var mailOptions = {
            from: '"Boogalu" <boogalu.email.test@gmail.com>',
            to: to,
            subject: subject,
            html: html,
            auth: {
                user: 'boogalu.email.test@gmail.com'
            }
        }
        
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("Email sending failed", error)
                response.send({ 'status': 400, 'statusText': 'Email sending failed', 'error': error });
                return error;
            } else {
                response.send({ 'status': 200, 'data': "Email sent succefully." });
                return true;
            }
        });
    })
})
