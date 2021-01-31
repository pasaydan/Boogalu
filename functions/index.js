/* eslint-disable handle-callback-err */
/* eslint-disable prefer-arrow-callback */
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({
    origin: true,
});

admin.initializeApp(functions.config().firebase);
var db = admin.firestore();

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