require('./config/db');
const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const { resolve } = require("path");
// Replace if using a different env file or config
const env = require("dotenv").config({ path: "./.env" });
const UserRoute = require('./components/authentication/route/userRoute');
const StripeRoute = require('./components/stripe/stripeRoute');
const authMiddleware = require('./middlewares/authMiddleware');
const UserToken = require('./components/authentication/model/userTokenModel');

app.use(express.json());

app.use('/user',UserRoute);
app.use('/stripe', StripeRoute);
app.use(express.static(process.env.STATIC_DIR));

app.get("/", (req, res) => {
  const path = resolve(process.env.STATIC_DIR + "/index.html");
  res.sendFile(path);
});

app.get("/auth/dashboard", authMiddleware, async(req, res)=>{
  const user =  await UserToken.find({token:req.headers.authorization});
  // res.send({user});
  // return
  if(user.length)
    res.send({success: true, message: "dashboard"});
  else
    res.send({success: false, message: "unauthenticated"});
})

app.listen(5252, () =>
  console.log(`Node server listening at http://localhost:5252`)
);
