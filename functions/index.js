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

        getPaymentByUserKey(options).then(() => {
            if (paymentDetails && paymentDetails.id !== paymentDetails.razorpay_payment_id) {
                console.log('then if')
                response.send(paymentDetails)
                return;
            } else {
                console.log('then else')
                instance.orders.create(options, function(err, order) {
                    if (err) {
                        response.send(err)
                        console.error('err >>>>>', err);
                    } else {
                        const paymentRef = db.collection('payments');
                        paymentRef
                            .doc(order.receipt)
                            .set(order);
                        response.send(order)
                        return;
                    }
                });
            }
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
