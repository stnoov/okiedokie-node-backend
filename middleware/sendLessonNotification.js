var nodemailer = require("nodemailer");
require("dotenv").config();

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

const sendLessonNotification = (locale, email, link, date, time) => {
  var mailOptions =
    locale === "ru"
      ? {
          from: "okiedokie.club@gmail.com",
          to: email,
          subject: "Ваше следующее мероприятие в OkieDokie! club",
          html:
            "<p>Вы успешно зарегистрировались на встречу в OkieDokie! club, которая состоится " +
            new Date(date).toLocaleDateString() +
            " в " +
            time +
            '<br/> Ссылка на подключение: <a href="' +
            link +
            '">link</a> <br /> Так же, cсылку на подключение вы можете также найти на главной странице сайта, на картинке забронированного мероприятия, за 15 минут до его начала <br /> <br /> <br /> Warmest regards, <br />Your OkieDokie!</p>',
        }
      : {
          from: "okiedokie.club@gmail.com",
          to: email,
          subject: "Your next OkieDokie! club meeting",
          html:
            "<p>You are successfully registered for the OkieDokie meeting on " +
            new Date(date).toLocaleDateString() +
            " at " +
            time +
            '<br/> Click here to join: <a href="' +
            link +
            '">link</a> <br />The link is also available on the main page of the web-site 15 minutes before the meeting starts. <br /> <br /> <br /> Warmest regards, <br />Your OkieDokie!</p>',
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
