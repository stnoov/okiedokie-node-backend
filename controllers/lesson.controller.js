const db = require("../models");
const Lesson = db.lesson;
const User = db.user;
const { Op } = require("sequelize");
var moment = require("moment");

exports.add_lesson = (req, res) => {
  Lesson.create({
    title: req.body.title,
    description: req.body.description,
    date: req.body.date,
    time: req.body.time,
    teacher: req.body.teacher,
    group: req.body.group,
    num_students: req.body.num_students,
    link: req.body.link,
    price: req.body.price,
    datetime: moment(
      `${req.body.date} ${req.body.time}`,
      "YYYY-MM-DD HH:mm"
    ).unix(),
  })
    .then(() => {
      Lesson.findAll({
        order: [["updatedAt", "DESC"]],
        include: [
          {
            model: User,
            as: "user",
            through: {
              attributes: ["lesson_id", "user_id"],
            },
          },
        ],
      }).then((data) => {
        res.send({ lessons: data });
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({ message: err.message });
    });
};

exports.get_lessons = (req, res) => {
  Lesson.findAll({
    order: [["updatedAt", "DESC"]],
    include: [
      {
        model: User,
        as: "user",
        through: {
          attributes: ["lesson_id", "user_id"],
        },
      },
    ],
  })
    .then((data) => {
      res.send({ lessons: data });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.edit_lesson = (req, res) => {
  Lesson.findOne({
    where: {
      id: req.body.id,
    },
  }).then((lesson) => {
    if (lesson) {
      lesson
        .update({
          title: req.body.title,
          description: req.body.description,
          date: req.body.date,
          time: req.body.time,
          teacher: req.body.teacher,
          group: req.body.group,
          num_students: req.body.num_students,
          link: req.body.link,
          price: req.body.price,
        })
        .then(() => {
          Lesson.findAll({
            order: [["updatedAt", "DESC"]],
            include: [
              {
                model: User,
                as: "user",
                through: {
                  attributes: ["lesson_id", "user_id"],
                },
              },
            ],
          }).then((data) => {
            res.send({ lessons: data });
          });
        });
      if (!lesson) {
        return res.status(404).send({ message: "Lesson Not found." });
      }
    }
  });
};

exports.delete_lesson = (req, res) => {
  Lesson.findOne({
    where: {
      id: req.body.id,
    },
  }).then((lesson) => {
    if (lesson) {
      lesson.destroy().then(() => {
        Lesson.findAll({
          order: [["updatedAt", "DESC"]],
          include: [
            {
              model: User,
              as: "user",
              through: {
                attributes: ["lesson_id", "user_id"],
              },
            },
          ],
        }).then((data) => {
          res.send({ lessons: data });
        });
      });
      if (!lesson) {
        return res.status(404).send({ message: "Lesson Not found." });
      }
    }
  });
};

exports.sign_up_for_a_lesson = (req, res) => {
  User.findOne({ where: { id: req.userId } })
    .then((user) => {
      if (user) {
        Lesson.findOne({ where: { id: req.body.lesson_id } }).then((lesson) => {
          lesson.getUser({ where: { id: req.userId } }).then((result) => {
            if (result.length < 1) {
              if (parseInt(user.balance) < parseInt(lesson.price)) {
                return res.status(400).send({ message: "Not enough balance." });
              } else {
                lesson.addUser(req.userId);
                user.update({
                  balance: parseInt(user.balance) - parseInt(lesson.price),
                  classes_completed: parseInt(user.classes_completed) + 1,
                });
              }
              return res.status(200).send({ message: "Success!" });
            } else {
              return res
                .status(409)
                .send({ message: "Already exists.", number: 409 });
            }
          });
        });
      }
    })
    .catch((err) => {
      return res.status(404).send({ message: "User not found." });
    });
};

exports.get_user_classes = (req, res) => {
  User.findOne({
    where: { id: req.userId },
    include: [
      {
        model: Lesson,
        where: {
          datetime: {
            [Op.gt]: moment().subtract(1, "hours").unix(),
          },
        },
        as: "lessons",
        through: {
          attributes: ["lesson_id", "user_id"],
          where: { user_id: req.userId },
        },
      },
    ],
    order: [[Lesson, "datetime", "ASC"]],
  })
    .then((data) => {
      res.send({ user_lessons: data.lessons });
    })
    .catch((err) => {
      console.log(err);
    });
};
