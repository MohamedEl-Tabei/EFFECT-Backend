const model = require("../imports/model");
const getErrorMessage = require("../imports/error");
const createNewActivity = async (req, res) => {
  try {
    let newActivity = new model.activity({
      hidden: req.body.hidden,
      key: {
        userId: req.userId,
        name: req.body.name,
      },
      colorKey: {
        userId: req.userId,
        color: req.body.color,
      },
    });
    await newActivity.save();
    await res.status(200).json("success");
  } catch (error) {
    res.status(400).json(getErrorMessage(error));
  }
};
const getAllActivities = async (req, res) => {
  try {
    let allActivities = await model.activity.find(
      { "key.userId": req.userId },
      "key.name hidden"
    );
    await res.status(200).json(allActivities);
  } catch (error) {
    res.status(400).json(getErrorMessage(error));
  }
};
const sendOnepageofActivities = async (req, res) => {
  try {
    let allActivities = (
      await model.activity.find(
        { "key.userId": req.userId },
        "key.name hidden colorKey.color"
      )
    ).filter(
      (v) =>
        !(
          v.key.name === `s${req.userId.toString()}` ||
          v.key.name === `w${req.userId.toString()}`
        )
    );
    let numberOfPages =
      (await allActivities.length) % 50 !== 0
        ? allActivities.length / 50 + 1
        : allActivities.length / 50;
    await allActivities.sort((a, b) => a.key.name.localeCompare(b.key.name));

    let pageOfActivities = await allActivities.slice(
      (req.body.pageNumber - 1) * 50,
      req.body.pageNumber * 50
    );
    await res.status(200).json({
      pageOfActivities,
      numberOfPages:
        Math.floor(numberOfPages) === 0 ? 1 : Math.floor(numberOfPages),
    });
  } catch (error) {
    res.status(400).json(getErrorMessage(error));
  }
};
const searchActivities = async (req, res) => {
  try {
    let activities = (
      await model.activity.find(
        { "key.userId": req.userId },
        "key.name hidden colorKey.color"
      )
    ).filter((v) => {
      return (
        v.key.name.toLowerCase().search(req.body.search.toLowerCase()) !== -1 &&
        !(
          v.key.name === `s${req.userId.toString()}` ||
          v.key.name === `w${req.userId.toString()}`
        )
      );
    });

    let numberOfPages =
      (await activities.length) % 50 !== 0
        ? activities.length / 50 + 1
        : activities.length / 50;
    await activities.sort((a, b) => a.key.name.localeCompare(b.key.name));

    let pageOfActivities = await activities.slice(
      (req.body.pageNumber - 1) * 50,
      req.body.pageNumber * 50
    );
    await res.status(200).json({
      items: pageOfActivities,
      numberOfPages:
        Math.floor(numberOfPages) === 0 ? 1 : Math.floor(numberOfPages),
    });
  } catch (error) {
    res.status(400).json(getErrorMessage(error));
  }
};
const getUnhiddenActivitiesName = async (req, res) => {
  try {
    let names = await model.activity.find(
      { "key.userId": req.userId, hidden: false },
      "key.name"
    );
    await res.status(200).json({ names });
  } catch (error) {
    res.status(400).json(getErrorMessage(error));
  }
};
const editActivity = async (req, res) => {
  try {
    await model.activity.findByIdAndUpdate(
      req.body._id,
      {
        "key.name": req.body.key.name,
        hidden: req.body.hidden,
        "colorKey.color": req.body.colorKey.color,
      },
      { runValidators: true }
    );
    if (req.body.oldName) {
      await model.doneActivity.updateMany(
        { "key.name": req.body.oldName },
        { "key.name": req.body.key.name }
      );
    }
    await res.status(200).json("updated");
  } catch (error) {
    res.status(400).json(getErrorMessage(error));
  }
};
const getDetailsOfActivity = async (req, res) => {
  try {
    let userId = req.userId;
    let name = req.body.name;
    let doneActivities = await model.doneActivity.find({
      "key.name": name,
      "key.userId": userId,
    });
    let colorKey = await model.activity.find(
      { "key.name": name, "key.userId": userId },
      "colorKey"
    );
    let color = await colorKey[0].colorKey.color;
    let labels = [];
    let sDate = new Date(doneActivities[0].date.slice(4));
    let eDate = new Date(
      doneActivities[doneActivities.length - 1].date.slice(4)
    );
    for (let date = sDate; date <= eDate; date.setDate(date.getDate() + 1)) {
      labels.push(new Date(date).toString().slice(0, 15));
    }
    let data = [];
    labels.forEach(() => {
      data.push(0);
    });
    doneActivities.forEach((actvty) => {
      let index = labels.findIndex((label) => label === actvty.date);
      let sTime =
        Number(actvty.startTime.slice(0, 2)) +
        Number(actvty.startTime.slice(3)) / 60;
      let eTime =
        Number(actvty.endTime.slice(0, 2)) +
        Number(actvty.endTime.slice(3)) / 60;
      let d = eTime - sTime;
      data[index] = data[index] + d;
    });
    await res.status(200).json({ labels, color, data });
  } catch (error) {
    res.status(400).json(getErrorMessage(error));
  }
};
module.exports = {
  createNewActivity,
  getAllActivities,
  sendOnepageofActivities,
  searchActivities,
  getUnhiddenActivitiesName,
  editActivity,
  getDetailsOfActivity,
};
