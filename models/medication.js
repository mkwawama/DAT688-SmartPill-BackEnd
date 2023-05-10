// importing modules
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var MedicationSchema = new Schema({
    pillid: {type: mongoose.Schema.Types.ObjectId, required:true},
    instructionid: {type: mongoose.Schema.Types.ObjectId, required:true},
    userid: {type: mongoose.Schema.Types.ObjectId, required:true},
    doseid: {type: mongoose.Schema.Types.ObjectId, required:true},
    added_date: {type:Date, default:Date.now},
});

// export schema
 module.exports = mongoose.model("Medication", MedicationSchema);
