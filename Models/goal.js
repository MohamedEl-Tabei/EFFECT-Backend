const schema = require("../imports/schema").goal;
const mongoose = require("mongoose");
const Schema = new mongoose.Schema({
  ...schema,
  key: {
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "users",
    },
    name: {
      type: String,
      required: "Please write your goal.",
    },
  },
});

Schema.index("key", { unique: true });

module.exports = mongoose.model("goal", Schema);
