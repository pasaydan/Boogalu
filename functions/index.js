/* eslint-disable handle-callback-err */
/* eslint-disable prefer-arrow-callback */
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const EMAIL_CONFIG = require('./credentials.json');

const {
	CLIENT_SECRET,
    CLIENT_ID,
    REDIRECT_URI,
    REFRESH_TOKEN,
    SEND_EMAIL_FROM,
} = EMAIL_CONFIG;

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
		var instance = new Razorpay({
			key_id: razorpayconfig.key,
			key_secret: razorpayconfig.secret
		})
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
					instance.orders.create(options, function (err, order) {
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
// send email
// new implementation is below :
exports.sendEmail = functions.https.onRequest((request, response) => {
	const oAuth2Client = new google.auth.OAuth2(
		CLIENT_ID,
		CLIENT_SECRET,
		REDIRECT_URI
	);
	oAuth2Client.setCredentials({
		refresh_token: REFRESH_TOKEN
	});
	return cors(request, response, () => {
		var to = request.body.mailTo;
		var subject = request.body.title;
		var html = request.body.content;

		async function sendMail() {
			try {
				const accessToken = await oAuth2Client.getAccessToken();
				const transport = nodemailer.createTransport({
					service: 'gmail',
					auth: {
						type: 'OAuth2',
						user: SEND_EMAIL_FROM,
						clientId: CLIENT_ID,
						clientSecret: CLIENT_SECRET,
						refreshToken: REFRESH_TOKEN,
						accessToken: accessToken,
					},
				});

				var mailOptions = {
					from: '"Boogalu" <' + SEND_EMAIL_FROM + '>',
					to: to,
					subject: subject,
					html: html,
				}

				const result = await transport.sendMail(mailOptions);
				return result;
			} catch (error) {
				return error;
			}
		}
		sendMail()
			.then((result) => {
				response.send({
					'status': 200,
					'data': "Email sent succefully."
				});
				return result;
			})
			.catch((error) => {
				response.send({
					'status': 400,
					'statusText': 'Email sending failed',
					'error': error
				});
				return error;
			});
	})
})