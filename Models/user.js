const schema = require("../imports/schema");
const mongoose = require("mongoose");
const user = new mongoose.Schema(schema.user);
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

user.pre("save", async function () {
  this.name = this.name.toLowerCase();
  /////////////////////////////////////////
  let salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  ////////////////////////////////////////
});
user.pre("findOneAndUpdate", async function () {
  let data;
  if (this.getFilter()._id) {
    data = await this.model.findById(this.getFilter()._id);
  }
  if (this.getFilter().email) {
    data = await this.model.findOne({email:this.getFilter().email});
  }
  await this.model.validate({ ...(await data._doc), ...this.getUpdate() });

  let password = await data.password;

  if (!(await bcrypt.compare(this.get("password"), password))) {
    let salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.get("password"), salt);
    this.set("password", this.password);
  } else {
    this.set("password", password);
  }
});
user.method("chkPassword", async function (password) {
  return await bcrypt.compare(password, this.password);
});
user.method("createToken", function (rememberMe) {
  return rememberMe
    ? jwt.sign({ id: this._id.toString() }, process.env.JWTOKEN, {
        expiresIn: "10d",
      })
    : jwt.sign({ id: this._id.toString() }, process.env.JWTOKEN, {
        expiresIn: "5m",
      });
});
user.static("chkToken", function (token) {
  return jwt.verify(token, process.env.JWTOKEN);
});
user.method("sendResetLink", async function () {
  let token = jwt.sign({ email: this.email }, process.env.JWTOKEN, {
    expiresIn: "5m",
  });
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
    host: "my.smtp.host",
    port: 465,
    secure: true, // use TLS

    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false,
    },
  });
  await transporter.sendMail({
    from: process.env.EMAIL,
    to: this.email,
    subject: "Reset your Effect password. ",
    html: ` 
          <div style="text-align:-webkit-center;">
            <div style="text-align:-webkit-center;color:#adb5bd;">
              <div style="border:4px solid #2dbab3 ;border-bottom:none;border-right:none; width:max-content;padding:3px;border-radius:10rem">
                <div style="border:4px solid #d4a465 ;border-top:none;border-left:none; width:max-content;padding:3px;padding-bottom:6px;padding-right:6px;border-radius:10rem">
                <h5 style="font-weight:800;margin:0px">EFFECT</h5>
                </div>
              </div>
            </div>
            <h2 style="font-weight:100;margin:0px;margin-bottom:15px;margin-top:15px;color:black">Reset your password</h2>
          </div>
          <div style="text-align:-webkit-center;color:black">
            <div style="border:1px solid #e1e4e8;border-radius:10px !important; width:max-content;padding:24px;">
              <h3 style="margin-bottom:10px;color:black"">Password reset</h3>
              <div style="text-align:-webkit-left;margin-bottom:8px;color:black"">We heard that you lost your Effect password. Sorry about that!</div>
              <div style="text-align:-webkit-left;margin-bottom:35px;color:black"">But don’t worry! You can use the following button to reset your password:</div>
              <a href="http://localhost:3000/resetPassword/?${token}" style="text-decoration:none;">
                <div style="width:max-content;color:white;background-color:#2dbab3;border:4px solid #2dbab3 ;border-radius:10px;padding:10px;font-weight:bold;">Reset your password</div>
              </a>             
              <div style="text-align:-webkit-left;margin-top:45px;">Thanks,</div>
              <div style="text-align:-webkit-left;">The Effect Developer</div>
            </div>
          </div>
          <div style="text-align:-webkit-center;color:#6a737d;margin-top:10px;">
            <small>You're receiving this email because a password reset was requested for your account.</small>
          </div>
        `,
  });
});

module.exports = mongoose.model("user", user);
