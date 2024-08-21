const getErrorMessage = require("../imports/error/index");
const { doneActivity, activity, goal } = require("../imports/model/index");
const { getHrs } = require("../imports/util");
const addNewDoneActivity = async (req, res) => {
  try {
    const newDoneActivity = await new doneActivity({
      ...req.body,
      key: {
        userId: req.userId,
        name: req.body.activityName,
      },
    });
    const activity_ = await activity.findOne({
      "key.name": req.body.activityName,
    });
    await newDoneActivity.save();
    res
      .status(200)
      .json({ _id: newDoneActivity._id, color: activity_.colorKey.color });
  } catch (error) {
    res.status(400).json(getErrorMessage(error));
  }
};
const setWkupTime = async (req, res) => {
  try {
    const newDoneActivity = await new doneActivity({
      ...req.body.wakeup,
      note: "Good morning",
      emotion: 0,
      key: {
        userId: req.userId,
        name: `w${req.userId}`,
      },
      relatedGoals: [" "],
    });
    const newDoneActivity_ = await new doneActivity({
      ...req.body.sleep,
      note: "Good night",
      emotion: 0,
      key: {
        userId: req.userId,
        name: `s${req.userId}`,
      },
      relatedGoals: [" "],
    });
    await newDoneActivity.save();
    await newDoneActivity_.save();
    res.status(200).json({ sleepId: newDoneActivity_._id });
  } catch (error) {
    res.status(400).json(getErrorMessage(error));
  }
};
const getDoneActivityByDate = async (req, res) => {
  try {
    let userActivities = await doneActivity.find({
      "key.userId": req.userId,
      date: req.body.date.slice(0, 15),
    });
    let colorsByNameArr = await activity.find({}, "key.name colorKey.color");
    let activities = [];
    userActivities.map((activity) => {
      if (activity.key.name.includes(req.userId)) {
        if (activity.key.name[0] === "w") {
          activities.push({
            ...activity._doc,
            key: undefined,
            activityName: "Wake Up",
          });
        }

        if (activity.key.name[0] === "s") {
          activities.unshift({
            ...activity._doc,
            key: undefined,
            activityName: "Sleep",
          });
        }
      } else {
        activities.push({
          ...activity._doc,
          key: undefined,
          activityName: activity.key.name,
          color: colorsByNameArr.find((v) => v.key.name === activity.key.name)
            .colorKey.color,
        });
      }
    });
    await res.status(200).json(activities);
  } catch (error) {
    res.status(400).json(getErrorMessage(error));
  }
};
const deleteWKupTime = async (req, res) => {
  try {
    let data = await doneActivity.findOneAndDelete({
      "key.name": `w${req.userId}`,
      date: req.body.date,
    });
    await doneActivity.deleteMany({ date: data.date });
    await res.status(200).json("deleted");
  } catch (error) {
    res.status(400).json(getErrorMessage(error));
  }
};
const deleteOneActivity = async (req, res) => {
  try {
    let data = await doneActivity.findById(req.body._id);
    if (data.emotion === 0) {
      await doneActivity.deleteMany({ date: data.date });
    } else await data.deleteOne();
    await res.status(200).json("deleted");
  } catch (error) {
    res.status(400).json(getErrorMessage(error));
  }
};
const EditWkupTime = async (req, res) => {
  try {
    await doneActivity.findOneAndUpdate(
      { "key.name": `w${req.userId}`, date: req.body.date.slice(0, 15) },
      { endTime: req.body.time, startTime: req.body.time }
    );
    let willBeDeleted = (
      await doneActivity.find({ date: req.body.date.slice(0, 15) })
    ).filter((v) => {
      return v.startTime < req.body.time && v.key.name !== `s${req.userId}`;
    });
    await willBeDeleted.map(async (v) => {
      await doneActivity.findByIdAndDelete(v.id);
    });
    await res.status(200).json("updated");
    1;
  } catch (error) {
    res.status(400).json(getErrorMessage(error));
  }
};
const editDoneActivity = async (req, res) => {
  try {
    let activity = req.body.activity;
    if (activity.startTime > activity.endTime) {
      throw new Error("Start time should be before end time.");
    }
    activity.key = {
      name:
        activity.activityName === "Sleep"
          ? `s${req.userId}`
          : activity.activityName,
      userId: req.userId,
    };
    await doneActivity.findOneAndUpdate(
      { _id: activity._id, "key.userId": req.userId },
      activity,
      { runValidators: true }
    );
    await res.status(200).json("updated");
  } catch (error) {
    res.status(400).json(getErrorMessage(error));
  }
};
const sleepBoardDetails = async (req, res) => {
  try {
    let data_ = await doneActivity.find({ "key.userId": req.userId });
    if (data_.length == 0) {
      res.status(200).json("no data");
    }
    let labels = [];
    let date = new Date(data_[0]?.date);
    await labels.push(date.toDateString());

    while (true) {
      if (date.toDateString() === req.body.date) {
        break;
      }
      date.setDate(date.getDate() + 1);
      labels.push(date.toDateString());
    }

    let datasets = [
      {
        label: "Sleep Hours",
        data: [],
        borderColor: "#41416b",
        pointBorderWidth: 0,
        tension: 0.5,
      },
      {
        label: "Emotions",
        data: [],
        borderColor: "#2dbab3",
        pointBorderWidth: 0,
        tension: 0.5,
      },
      {
        label: "Activities Hours",
        data: [],
        borderColor: "#d4a465",
        tension: 0.5,
        pointBorderWidth: 0,
      },
    ];
    labels.forEach((d) => {
      let activitiesOfDay = data_.filter((a) => a.date === d);
      let activitiesHours = 0;
      let activitiesOfDayLength = activitiesOfDay.length - 2;
      let emotionSum = 0;
      activitiesOfDay.forEach((a) => {
        activitiesHours = activitiesHours + getHrs(a.startTime, a.endTime);
        emotionSum = emotionSum + a.emotion;
      });

      datasets[1].data.push(
        emotionSum ? (emotionSum / activitiesOfDayLength).toFixed(0) : 0
      );
      datasets[2].data.push(activitiesHours);
      let wakeup = data_.find(
        (v) => v.date === d && v.key.name === `w${req.userId}`
      );
      let sleep = data_.find(
        (v) => v.date === d && v.key.name === `s${req.userId}`
      );
      if (sleep) {
        let numOfHours =
          Number(wakeup.startTime.slice(0, 2)) +
          Number(wakeup.startTime.slice(3) / 60) -
          (Number(sleep.startTime.slice(0, 2)) +
            Number(sleep.startTime.slice(3)) / 60);
        datasets[0].data.push(numOfHours < 0 ? numOfHours + 24 : numOfHours);
      } else {
        datasets[0].data.push(0);
      }
    });

    let getAvg = (dataset_) => {
      let sum = 0;
      for (i = 0; i < dataset_.length; i++) {
        sum = dataset_[i] + sum;
      }
      return (sum / dataset_.length).toFixed(0);
    };
    let sleepHAvg = getAvg(datasets[0].data);
    let emotionAvg = 3;
    let setAvgFor0Value = (dataset_, avg) => {
      for (i = 0; i < dataset_.length; i++) {
        if (dataset_[i] === 0) dataset_[i] = avg;
      }
    };
    setAvgFor0Value(datasets[0].data, sleepHAvg);
    setAvgFor0Value(datasets[1].data, emotionAvg);
    res.status(200).json({ labels, datasets });
  } catch (error) {
    res.status(400).json(getErrorMessage(error));
  }
};
const sleepVsActivity = async (req, res) => {
  try {
    let data_ = await doneActivity.find({ "key.userId": req.userId });
    if (data_.length == 0) {
      res.status(200).json("no data");
    }
    let labels = [];
    let date = new Date(data_[0]?.date);
    await labels.push(date.toDateString());

    while (true) {
      if (date.toDateString() === req.body.date) {
        break;
      }
      date.setDate(date.getDate() + 1);
      labels.push(date.toDateString());
    }

    let datasets = [
      {
        label: "Activities Hours & Sleep Hours",
        data: [],
        borderColor: "#41416b",
        pointBorderWidth: 0,
        tension: 0.5,
      },

      {
        label: "Activities Hours",
        data: [],
        borderColor: "#d4a465",
        tension: 0.5,
        pointBorderWidth: 0,
      },
    ];
    labels.forEach((d) => {
      let activitiesOfDay = data_.filter((a) => a.date === d);
      let activitiesHours = 0;
      activitiesOfDay.forEach((a) => {
        activitiesHours = activitiesHours + getHrs(a.startTime, a.endTime);
      });

      datasets[1].data.push(activitiesHours);
      let wakeup = data_.find(
        (v) => v.date === d && v.key.name === `w${req.userId}`
      );
      let sleep = data_.find(
        (v) => v.date === d && v.key.name === `s${req.userId}`
      );
      if (sleep) {
        let numOfHours =
          Number(wakeup.startTime.slice(0, 2)) +
          Number(wakeup.startTime.slice(3) / 60) -
          (Number(sleep.startTime.slice(0, 2)) +
            Number(sleep.startTime.slice(3)) / 60);
        datasets[0].data.push(numOfHours < 0 ? numOfHours + 24 : Number(numOfHours.toFixed(0)));
      } else {
        datasets[0].data.push(0);
      }
    });

    let getAvg = (dataset_) => {
      let sum = 0;
      for (i = 0; i < dataset_.length; i++) {
        sum =  sum+dataset_[i] ;
      }
      let avg_=(sum / dataset_.length).toFixed(0)
      return avg_
    };
    let sleepHAvg = getAvg(datasets[0].data);
    let setAvgFor0Value = (dataset_, avg) => {
      for (i = 0; i < dataset_.length; i++) {
        if (dataset_[i] === 0) dataset_[i] = avg;
      }
    };
    
    setAvgFor0Value(datasets[0].data, sleepHAvg);
    let newLabel=[];
    let newData=[];
    for(let l=0;l<17;l++){
      newLabel.push(l)
      newData.push(0)
      let count=0;
      for(let i=0;i< datasets[0].data.length;i++){
        if(datasets[0].data[i]==l)
        {
          newData[l]=newData[l]+Number(datasets[1].data[i])
          count=count+1
        }
      }
      if(count!=0) newData[l]=newData[l]/count
    }
    res.status(200).json({
      labels: newLabel,
      datasets: [{
        label: "Activities Hours & Sleep Hours",
        data: newData,
        pointBorderWidth: 0,
        tension: 0.5,
      }],
    });
  } catch (error) {
    res.status(400).json(getErrorMessage(error));
  }
};
const dailyProgressDetails = async (req, res) => {
  try {
    let doneActivities = await doneActivity.find({ "key.userId": req.userId });
    let numActivities =
      (await activity.find({ "key.userId": req.userId })).length - 2;
    let goals = await goal.find({ "key.userId": req.userId });
    let numGoals = goals.length;
    let numAcheivedGoals = goals.filter(
      (g) => g.achievedDate !== "Not yet."
    ).length;
    let data = [0, 0, 0, 0, 0, 0, 0];
    let totalHr = 0;
    let avgHr = 0;
    let numDays = 1;
    let date = new Date(doneActivities[0]?.date);
    while (date < new Date(doneActivities[doneActivities.length - 1]?.date)) {
      date.setDate(date.getDate() + 1);
      numDays = numDays + 1;
    }
    doneActivities.forEach((a) => {
      let hr = getHrs(a.startTime, a.endTime);
      totalHr = totalHr + hr;
      let d = new Date(a.date);
      let i = d.getDay() + 1 === 7 ? 0 : d.getDay() + 1;
      data[i] = data[i] + hr;
    });
    avgHr = totalHr / numDays;
    res.status(200).json({
      totalHr: totalHr.toFixed(2),
      avgHr: avgHr.toFixed(2),
      numActivities,
      numGoals,
      achievedGoals: (numAcheivedGoals / numGoals).toFixed(2) * 100,
      data,
    });
  } catch (error) {
    res.status(400).json(getErrorMessage(error));
  }
};
module.exports = {
  addNewDoneActivity,
  setWkupTime,
  getDoneActivityByDate,
  deleteWKupTime,
  deleteOneActivity,
  EditWkupTime,
  editDoneActivity,
  sleepBoardDetails,
  dailyProgressDetails,
  sleepVsActivity,
};
