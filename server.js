const express = require("express");
const cors = require("cors");
const db = require("./models");
const app = express();

var corsOptions = {
  origin: "http://localhost:3000",
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

db.sequelize.sync().then(() => {
  console.log("Drop and Resync Db");
  initial();
});

// routes
require("./routes/auth.routes")(app);
require("./routes/review.routes")(app);
require("./routes/user.routes")(app);
require("./routes/news.routes")(app);
require("./routes/lesson.routes")(app);
// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
