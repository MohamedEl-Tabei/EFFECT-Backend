const schema = require("../imports/schema");
const mongoose = require("mongoose");
const Schema = new mongoose.Schema({
  ...schema.doneActivity,
  key:{
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "users",
    },
    name: {
      type: String,
      required: "Name is required",
      trim:true
    },
  },
});
Schema.index("key",{ref:"activities"})
Schema.pre("save",function(){
  if(this.startTime>this.endTime)
  {
    throw new Error("Start time should be before end time.")
  }
  this.date=this.date.slice(0,15)

})
module.exports = mongoose.model("doneActivity", Schema);
