const nodemailer = require("nodemailer");

module.exports = {

    init: function () {
        console.log('trying to send email.');
        //Create reusable transporter object using the default SMTP transport 
        // var transporter1 = nodemailer.createTransport(
        //     'smtps://abhisekh.trinoyon%40gmail.com:Abh1sekh!@smtp.gmail.com');
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'abhisekh.trinoyon@gmail.com',
                pass: 'Abh1sekh!'
            },
            port: 465,
            secure: true, // secure:true for port 465, secure:false for port 587
            transportMethod: 'SMTP',
            // tls: {
            //     rejectUnauthorized: false
            // }
        });

        var mailOptions = {
            from: 'abhisekh.trinoyon@gmail.com',
            to: 'abhisekh.trinoyon@gmail.com',
            subject: 'mw update',
            text: 'abhisekh.trinoyon@gmail.com'
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('++++++++++++++++++++++++++++++++++++Email sent: ' + info.response);
            }
        });

        //     transporter1.sendMail(mailOptions, function(error, info){
        //         if(error){
        //           return console.log(error);
        //         }
        //         console.log('Message sent: ' + info.response);
        //   });
    },


}