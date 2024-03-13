const { user, activity, doneActivity } = require("../imports/model");
const getErrorMessage = require("../imports/error");
const signUp = async (req, res) => {
  try {
    const newUser = new user(req.body);
    let token = await newUser.createToken(req.body.rememberMe);
    let wakeUp = new activity({
      hidden: true,
      key: {
        name: `w${newUser.id.toString()}`,
        userId: newUser.id,
      },
      colorKey: {
        color: "#00adf4",
        userId: newUser.id,
      },
    });
    let sleep = new activity({
      hidden: true,
      key: {
        name: `s${newUser.id.toString()}`,
        userId: newUser.id,
      },
      colorKey: {
        color: "#41416b",
        userId: newUser.id,
      },
    });
    await wakeUp.save();
    await sleep.save();
    await newUser.save();

    await res.header({ "x-authToken": token });
    await res.status(200).json({ profilePicture: newUser.profilePicture });
  } catch (error) {
    res.status(400).json(getErrorMessage(error));
  }
};
const emailIsUsedChk = async (req, res) => {
  res
    .status(200)
    .json((await user.findOne({ email: req.body.email })) ? true : false);
};
const getUserByToken = async (req, res) => {
  try {
    let authUser = await user.findById(req.userId);
    let wkupTime = await doneActivity.findOne({
      "key.name": `w${req.userId}`,
      date: req.body.date.slice(0, 15),
    });
    let sleepTime = await doneActivity.findOne({
      "key.name": `s${req.userId}`,
      date: req.body.date.slice(0, 15),
    });
    authUser.password = undefined;
    authUser.__v = undefined;
    authUser._doc._id = undefined;
    res
      .status(200)
      .json(
        await {
          ...authUser._doc,
          wkupTime: wkupTime ? wkupTime.startTime : "",
          sleepTime: sleepTime ? sleepTime.startTime : "",
        }
      );
  } catch (error) {
    res.status(400).json(getErrorMessage(error));
  }
};
const updateUser = async (req, res) => {
  try {
    await user.findOneAndUpdate({ _id: req.userId }, { ...req.body });
    res.status(200).json("Success");
  } catch (error) {
    res.status(400).json(getErrorMessage(error));
  }
};
const verifyPassword = async (req, res) => {
  try {
    let _User = await user.findById(req.userId);

    res.status(200).json(await _User.chkPassword(req.body.password));
  } catch (error) {
    res.status(400).json(getErrorMessage(error));
  }
};

const login = async (req, res) => {
  try {
    let _user = await user.findOne({ email: req.body.email });
    if (await _user.chkPassword(req.body.password)) {
      let wkupTime = await doneActivity.findOne({
        "key.name":`w${ _user._id}`,
        date: req.body.date.slice(0, 15),
      });
      let token = await _user.createToken(req.body.rememberMe);
      await res.header({ "x-authToken": token });
      await res.status(200).json({
        profilePicture: _user.profilePicture,
        name: _user.name,
        birthday: _user.birthday,
        wkupTime: wkupTime ? wkupTime.startTime : "",
      });
    } else {
      throw new Error("Invalid email or password");
    }
  } catch (error) {
    res.status(400).json("Invalid email or password");
  }
};
const sendResetLink = async (req, res) => {
  try {
    let _user = await user.findOne({ email: req.body.email });
    if (await _user) {
      await _user.sendResetLink();
    } else {
      throw new Error("This email does not have an acount.");
    }
    await res.status(200).json("ok");
  } catch (error) {
    res.status(400).json(getErrorMessage(error));
  }
};
const chkUrl = async (req, res) => {
  try {
    let token = req.headers["x-resetpasstoken"];
    let email = user.chkToken(token).email;
    let name = await user.findOne({ email }, "name");
    res.status(200).json(name);
  } catch (error) {
    if (getErrorMessage(error) !== "jwt expired") res.status(400).json("error");
    else res.status(400).json(getErrorMessage(error));
  }
};
const resetPassword = async (req, res) => {
  try {
    let token = req.headers["x-resetpasstoken"];
    let email = user.chkToken(token).email;
    await user.findOneAndUpdate({ email }, { password: req.body.password });
    res.status(200).json("updated");
  } catch (error) {
    res.status(400).json(getErrorMessage(error));
  }
};

module.exports = {
  signUp,
  emailIsUsedChk,
  getUserByToken,
  updateUser,
  verifyPassword,
  login,
  sendResetLink,
  chkUrl,
  resetPassword,
};
