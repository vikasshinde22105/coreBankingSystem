'use strict';
const nodemailer = require('nodemailer');

const mailService = { 







 mailSend: function(textPart,bodyPart,emailTo,callback) {
	 
	 console.log('send mail');
	 
   
  // Generate test SMTP service account from ethereal.email
// Only needed if you don't have a real mail account for testing
nodemailer.createTestAccount((err, account) => {
	
	console.log('send mail createTestAccount ');
	
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
           user: 'devendrakumar6780@gmail.com', // generated ethereal user
           pass: 'sonudev@2211' // generated ethereal password
			
			
			
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: 'devendrakumar6780@gmail.com', // sender address
        to: emailTo, // list of receivers
        subject: 'MDRA BANK FAQ Reference details', // Subject line
        text: textPart, // plain text body
        html: bodyPart
		 
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
		
			console.log('send mail transporter ');
        if (error) {
			callback('error in mail');
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
callback('success in mail');
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    });
	
	
	
});
  

  }
   



};
module.exports = mailService;