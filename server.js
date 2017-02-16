'use strict'

let nodemailer = require('nodemailer');
let request = require('request');
let express = require('express');
let bodyParser = require('body-parser');


const config = require('./contact_form_config');
const port = process.env.PORT || 3000;


// create express server object and serve html files
let app = express();
app.use(express.static('public'));

// get and encode request parameters
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// create route
app.post('/contactForm', recaptcha_verify, node_mailer); 



/*
* send POST request to google recaptcha servers for verification
*/
function recaptcha_verify(req, res, next){

	// create google recaptcha data
	let	recaptcha_data = {
		remoteip: req.ip,
		secret: config.recaptcha_secret,
		response: req.body.recaptcha
	}

	// request google recaptcha validation
	request({
		method: 'POST',
		uri: 'https://www.google.com/recaptcha/api/siteverify',
		qs: recaptcha_data
	}, function (err, resReq, body) {
		if (err) return next(err);

		// if recaptcha successful go to next middleware
		return next();
	});
}




/*
* generate xoauth2 token and send email
*/
function node_mailer(req, res, next) {

	// create a mail transporter
	let transporter = nodemailer.createTransport({
		service: 'Gmail',
		auth: config.mail_auth
	});

	// collect email data
	let email_data = {
		from: req.body.email,
		to: config.mail_auth.user,
		subject: 'Website Contact Form',
		text: `From: ${req.body.name}\nEmail address: ${req.body.email}\nMessage: ${req.body.message}`
	}

	// send email
	transporter.sendMail(email_data, function(err, info) {
		if (err) return next(err);

		return res.json({info: info});
	});	
}



/*
* error handler for contact form route
*/
app.post('/contactForm', function(err, req, res, next) {
  	return res.status(500).json({ error: err });
});





// booting up server function
let boot = function() {
	app.listen(port, function() {
		console.log('Express server listening on port', port);
	})
}
// shutdown server function
let shutdown = function() {
	app.close();
}
// if main module then start server else pass to exports
if(require.main === module){
	boot();
} else {
	console.log('Running contactForm as module')
	module.exports = {
		boot: boot,
		shutdown: shutdown,
		port: port,
		app: app
	}
}