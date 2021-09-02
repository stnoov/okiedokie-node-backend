var nodemailer = require("nodemailer");
require("dotenv").config();

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = (id, token, email) => {
  var mailOptions = {
    from: "okiedokie.club@gmail.com",
    to: email,
    subject: "Reset password",
    html:
      '<p>Click <a href="https://okiedokie.netlify.app/reset_password/' +
      id +
      "/" +
      token +
      '">here</a> to reset your password</p>',
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

module.exports = sendEmail;
