/* eslint-disable handle-callback-err */
/* eslint-disable prefer-arrow-callback */
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const EMAIL_CONFIG = require('./credentials.json');

const cors = require('cors')({
	origin: true,
});
let razorpayconfig = require('./test.json');
let oauthservice = require('./credentials.json');
razorpayconfig = razorpayconfig.razorpayservice;
const Razorpay = require('razorpay');

admin.initializeApp(functions.config().firebase);
var db = admin.firestore();

// if (Object.keys(functions.config()).length) {
// 	razorpayconfig = functions.config().razorpayservice;
// 	console.log("razorpayconfig", razorpayconfig);
// 	oauthservice = functions.config().oauthservice;
// 	console.log("oauthservice", oauthservice);
// }

let {
	clientsecret,
    clientid,
    redirecturi,
    refreshtoken,
    sendemailfrom,
} = oauthservice;

// post order to razorpay
exports.postOrder = functions.https.onRequest((request, response) => {
	return cors(request, response, () => {
		var instance = new Razorpay({
			key_id: razorpayconfig.key,
			key_secret: razorpayconfig.secret
		})
		var options = request.body;
		const identifier = Object.keys(options)[0];
		const data = options[identifier];
		let paymentDetails = null;

		const getPaymentByUserKey = async (options) => {
			const paymentRef = db.collection('payments').doc(options.receipt.toString());
			const doc = await paymentRef.get();
			if (!doc.exists) {
				console.log('No such document!');
			} else {
				paymentDetails = doc.data();
				console.log("paymentDetails", paymentDetails);
			}
		}

		getPaymentByUserKey(data)
			.then(() => {
				if (paymentDetails && paymentDetails[identifier] === identifier && paymentDetails[identifier].id !== paymentDetails[identifier].razorpay_payment_id) {
					response.send(paymentDetails)
					return paymentDetails;
				} else {
					if (paymentDetails) {
						console.log("if paymentDetails available ", data);
						instance.orders.create(data, function (err, order) {
							if (err) {
								response.send(err)
								console.error('err >>>>>', err);
								return err;
							} else {							
								const paymentRef = db.collection('payments');
								let newOrderdata = {}
								newOrderdata[identifier] = order;
								let mergedData = {...paymentDetails, ...newOrderdata};
								console.log("merged data", mergedData);
								paymentRef
									.doc(order.receipt)
									.set(mergedData);
								response.send(mergedData)
								return mergedData;
							}
						});
					} else {
						console.log("inside then else >>>>> else");
						instance.orders.create(data, function (err, order) {
							if (err) {
								response.send(err)
								console.error('err >>>>>', err);
								return err;
							} else {							
								const paymentRef = db.collection('payments');
								let newOrderdata = {}
								newOrderdata[identifier] = order;
								paymentRef
									.doc(newOrderdata[identifier].receipt.toString())
									.set(newOrderdata);
								response.send(newOrderdata)
								return newOrderdata;
							}
						});
					}
				}
				return paymentDetails;
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
		const identifier = Object.keys(options)[0];
		const data = options[identifier];
		console.log('updatePayment options', options)
		const paymentRef = db.collection('payments');
		paymentRef
			.doc(options[identifier].receipt)
			.set(options);
		response.send(options);
		return
	});
});
// send email
// new implementation is below :
exports.sendEmail = functions.https.onRequest((request, response) => {
	const oAuth2Client = new google.auth.OAuth2(
		clientid,
		clientsecret,
		redirecturi
	);
	oAuth2Client.setCredentials({
		refresh_token: refreshtoken
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
						user: sendemailfrom,
						clientId: clientid,
						clientSecret: clientsecret,
						refreshToken: refreshtoken,
						accessToken: accessToken,
					},
				});

				var mailOptions = {
					from: '"Boogalu" <' + sendemailfrom + '>',
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
				console.log("Email Sent", result);
				return result;
			})
			.catch((error) => {
				response.send({
					'status': 400,
					'statusText': 'Email sending failed',
					'error': error
				});
				console.log("Email sending failed", error);
				return error;
			});
	})
})