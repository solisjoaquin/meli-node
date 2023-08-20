const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 3000;

dotenv.config();

app.use(cors());

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

const router = require("./routes/items");

app.use("/", router);

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
