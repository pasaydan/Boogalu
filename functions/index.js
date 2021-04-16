/* eslint-disable handle-callback-err */
/* eslint-disable prefer-arrow-callback */
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const cors = require('cors')({
    origin: true,
});
let razorpayconfig = require('./env.json');
const Razorpay = require('razorpay');

admin.initializeApp(functions.config().firebase);
var db = admin.firestore();
if (Object.keys(functions.config()).length) {
    razorpayconfig = functions.config().razorpayservice;
}
// paytm payment 
exports.payment = functions.https.onRequest((request, response) => {
    return cors(request, response, () => {
        console.log(JSON.stringify(request.query))
        var paytm_config = require('./paytm/paytm_config').paytm_config;
        var paytm_checksum = require('./paytm/checksum');
        var myFun = require('./paytmFunction');
        if (request.method !== 'GET') {
            response.send("<script>window.location = '" + paytm_config.PaymentInitURL + "'</script>");
            return
        }
        if (request.method === "GET") {
            var random = Math.floor(Math.random() * 999999).toString();
            var amount = request.query.amount;
            var uId = request.query.uId
            var email = request.query.email
            var phone = request.query.phone;
            var orderId = request.query.orderId //subscription key

            if (amount === undefined) {
                response.send('Amount is Mandatory.');
                return
            }
            if (uId === undefined) {
                uId = 'CUST' + random
            }
            if (email === undefined) {
                email = 'email' + Math.floor(Math.random() * 999999).toString() + '@na.com'
            }
            if (phone === undefined) {
                phone = '9999' + random
            }
            if (orderId === undefined) {
                orderId = 'DONATION' + random
            }

            var paramarray = {};
            paramarray['MID'] = paytm_config.MID; //Provided by Paytm
            paramarray['ORDER_ID'] = orderId.replace(' ', '-'); //unique OrderId for every request
            paramarray['CUST_ID'] = uId.replace(' ', '-'); // unique customer identifier 
            paramarray['INDUSTRY_TYPE_ID'] = paytm_config.INDUSTRY_TYPE_ID; //Provided by Paytm
            paramarray['CHANNEL_ID'] = paytm_config.CHANNEL_ID; //Provided by Paytm
            paramarray['TXN_AMOUNT'] = amount; // transaction amount
            paramarray['WEBSITE'] = paytm_config.WEBSITE; //Provided by Paytm
            paramarray['CALLBACK_URL'] = paytm_config.CALLBACK_URL; //Provided by Paytm
            paramarray['EMAIL'] = email.replace(' ', '-'); // customer email id
            paramarray['MOBILE_NO'] = phone; // customer 10 digit phone no.
            paytm_checksum.genchecksum(paramarray, paytm_config.MERCHANT_KEY, function (err, checksum) {
                response.send(myFun.returnPage(paramarray, checksum, paytm_config.PAYTM_ENVIRONMENT));
            });
        } else {
            // If request is anything other than post do not act. 
            response.status(400).send('Invalid Request');
            return
        }
    });


});

exports.paymentCallback = functions.https.onRequest((request, response) => {
    return cors(request, response, () => {
        var paytm_config = require('./paytm/paytm_config').paytm_config;
        var paytm_checksum = require('./paytm/checksum');
        var checksum = request.body.CHECKSUMHASH;
        delete request.body.CHECKSUMHASH;
        if (paytm_checksum.verifychecksum(request.body, paytm_config.MERCHANT_KEY, checksum)) {
            console.log(request.body)
            if (request.body.STATUS === "TXN_SUCCESS") {
                var paymentRef = db.collection('payments')
                console.log('paymentRef =>>>', paymentRef)
                paymentRef.add(request.body)
                    .then(() => {
                        console.log('payment data saved');
                        return true;
                    })
                    .catch((e) => {
                        console.log(` Error  ${e}`);
                        return null;
                    });
                response.send("<script>window.location = '" + paytm_config.PaymentSuccessURL + "?status=success'</script>");
                return
            } else {
                response.send("<script>window.location = '" + paytm_config.PaymentFailureURL + "?status=fail'</script>");
                return
            }
        } else {
            response.send("<script>window.location = '" + paytm_config.PaymentFailureURL + "?status=fail'</script>");
            return
        }
    });
});
// post order to razorpay
exports.postOrder = functions.https.onRequest((request, response) => {
    return cors(request, response, () => {
        var instance = new Razorpay({ key_id: 'rzp_test_I6E2xi7pm2VOPG', key_secret: '120I15dXhVxr68bXaYTzRMDT' })
        var options = request.body;
        instance.orders.create(options, function(err, order) {
            if (err) {
                response.send(err)
                console.error('err >>>>>', err);
            } else {
                response.send(order)
                console.log("order", order);
            }
        });
    });
});

// email sending 
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'garudkardnyaneshwar@gmail.com',
        pass: 'Pasaydan@4884'
    }
});

//send email 
exports.sendEmail = functions.https.onRequest((request, response) => {
    return cors(request, response, () => {
        var to = request.body.mailTo;
        var subject = request.body.title;
        var html = request.body.content;
        var mailOptions = {
            from: '"Boogalu" <garudkardnyaneshwar@gmail.com>',
            to: to,
            subject: subject,
            html: html
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