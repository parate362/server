const express = require("express");
require("dotenv").config();
const cors = require("cors");
require("./db/conn");
const path = require("path");
const userRouter = require("./routes/userRoute");

const app = express();

app.use(express.json());

const allowedOrigins = ["http://localhost:3000",'https://keek-client.vercel.app'];

app.use(cors({
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

// app.use(cors());
// // app.use(
// //   cors({
// //     origin: "http://localhost:3000",
// //     methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
// //     credentials: true,
// //   })
// // );

// app.get("/", (req, res) => {
//   app.use(express.static(path.resolve(__dirname, "client", "build")));
//   res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
//   });

// app.get("/", (req, res) => {
//   res.send("Hello Keek!");
// });

app.use("/api/user", userRouter);

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listen on port${port}...`));
