// importing modules
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var PillSchema = new Schema({
    pill: {type: String, required:true, unique:true},
});


// export medicationschema
 module.exports = mongoose.model("Pill", PillSchema);
