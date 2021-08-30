const db = require("../models");
const News = db.news;

exports.add_news = (req, res) => {
  News.create({
    title: req.body.title,
    content: req.body.content,
  })
    .then(() => {
      News.findAll({ order: [["createdAt", "DESC"]], limit: 3 }).then(
        (data) => {
          res.send({ news: data });
        }
      );
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.get_news = (req, res) => {
  News.findAll({ order: [["updatedAt", "DESC"]] })
    .then((data) => {
      res.send({ news: data });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.edit_news = (req, res) => {
  News.findOne({
    where: {
      id: req.body.id,
    },
  }).then((news) => {
    if (news) {
      news
        .update({
          title: req.body.title,
          content: req.body.content,
        })
        .then(() => {
          News.findAll({ order: [["updatedAt", "DESC"]] }).then((data) => {
            res.send({ news: data });
          });
        });
      if (!news) {
        return res.status(404).send({ message: "News Not found." });
      }
    }
  });
};

exports.delete_news = (req, res) => {
  News.findOne({
    where: {
      id: req.body.id,
    },
  }).then((news) => {
    if (news) {
      news.destroy().then(() => {
        News.findAll({ order: [["updatedAt", "DESC"]] }).then((data) => {
          res.send({ news: data });
        });
      });
      if (!news) {
        return res.status(404).send({ message: "News Not found." });
      }
    }
  });
};
