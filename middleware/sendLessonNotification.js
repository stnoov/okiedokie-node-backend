var nodemailer = require("nodemailer");
require("dotenv").config();

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

const sendLessonNotification = (email, link, date, time) => {
  var mailOptions = {
    from: "okiedokie.club@gmail.com",
    to: email,
    subject: "You have been successfully registered for the meeting",
    html:
      "<p>You have been successfully registered for the meeting <br/> which will held on " +
      date +
      " at " +
      time +
      ' <a href="' +
      link +
      '">Link for the meeting</a></p>',
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

module.exports = sendLessonNotification;
