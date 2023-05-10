// importing modules
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var ScheduleSchema = new Schema({
    medid: {type: mongoose.Schema.Types.ObjectId, required:true},
    userid: {type: mongoose.Schema.Types.ObjectId, required:true},
    added_date: {type:Date, default:Date.now},
    schedule_date: {type:Date, required:true},
    taken:{type:String, default:'0'},
});


// export schema
 module.exports = mongoose.model("Schedule", ScheduleSchema);
