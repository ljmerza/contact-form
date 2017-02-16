$(document).ready(function() {

	// process the form
	$('#contact_form').submit( function(e) {

		// prevent form from submitting
		e.preventDefault();

		// get message div
		var $message = $('.message');

		// get form data
		var formData = {
			name: $('input[name=name]').val(),
			email: $('input[name=email]').val(),
			message: $('input[name=message]').val(),
			recaptcha: grecaptcha.getResponse()
		};

		// send data to server
		$.ajax({
			type: 'POST',
			url	: 'contactForm',
			data: formData,
			dataType: 'json',
			encode: true
		})
		// if returned okay then show message
		.done( function(data) {
			$message.html( data );
		})
		// if returned error then show message
		.fail( function(data) {
			$message.html( data );
		})
		// always reset recaptcha no matter the response
		.always( function() {
			grecaptcha.reset();
		});

	});
	
});