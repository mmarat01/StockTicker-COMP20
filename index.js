const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const router = express.Router();
const app = express();

/*
     SETUP
 */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

/*
     DATABASE
 */

dotenv.config();

mongoose
  .connect(process.env.DB_CONNECT, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .catch((e) => {
    console.error("Connection error", e.message);
  })
  .then(console.log("Successfully connected to the 'hw14' database"));

const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));

const Company = mongoose.model(
  "companies",
  new mongoose.Schema({
    name: String,
    ticker: String,
  })
);

/*
     REQUEST ROUTE
 */
router.post("/match", async (req, res) => {
  const companyTicker = req.body.ticker;
  const companyName = req.body.name;

  if (companyTicker) {
    await Company.find({ ticker: companyTicker }, (err, companies) => {
      if (err) return res.status(400).json({ success: false, message: err });

      if (!companies.length) {
        return res.status(404).json({
          success: false,
          message: "No companies with that stock ticker were found.",
        });
      }

      let output = "";

      companies.forEach((c) => {
        output += `<p>${c.name}&nbsp; - &nbsp;${c.ticker}</p>`;
      });

      return res.status(200).send(output);
    }).catch((err) => console.log(err));
  } else if (companyName) {
    await Company.findOne({ name: companyName }, (err, company) => {
      if (err) return res.status(400).json({ success: false, message: err });

      if (!company)
        return res
          .status(404)
          .json({ success: false, message: "Company not found." });

      let output = `<p>${company.name}&nbsp; -&nbsp; ${company.ticker}</p>`;

      return res.status(200).send(output);
    }).catch((err) => console.log(err));
  }
});

app.use("/api/stock", router);

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running!");
});
