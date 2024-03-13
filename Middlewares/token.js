const mongoose = require("mongoose");
const getErrorMessage = require("../imports/error");
const model = require("../imports/model");
const token = (req, res, nxt) => {
  try {
    let token = req.headers["x-authtoken"];
    let decoded = model.user.chkToken(token);

    req.userId = decoded.id;
    nxt();
  } catch (error) {
    if (getErrorMessage(error) === "jwt expired")
      res.status(400).json("session expired");
    else res.status(400).json(getErrorMessage(error));
  }
};

module.exports = token;
