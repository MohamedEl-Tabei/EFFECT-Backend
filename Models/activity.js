const Schema = require("../imports/schema");
const mongoose = require("mongoose");
const activity = new mongoose.Schema({
  ...Schema.activity,
  key: {
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "users",
    },
    name: {
      type: String,
      required: "Name is required",
      trim: true,
      validate: {
        validator: (v) => {
          if (v.toLowerCase() === "sleep" || v.toLowerCase() === "wake up")
            throw new Error("This name is already exist.");
        },
      },
    },
  },
  colorKey: {
    color: {
      type: String,
      required: "Select color of activity to be unique in chart.",
    },
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "users",
    },
  },
});
activity.index("key", { unique: true });
activity.index("colorKey", { unique: true });
activity.pre("save", function () {
  if (this.colorKey.color === "white" || this.colorKey.color === "#FFFFFF")
    throw new Error("This color not allowed");
});

module.exports = mongoose.model("activity", activity);
