// importing modules
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var DoseSchema = new Schema({
    dose: {type: String, required:true, unique:true},
});


// export medicationschema
 module.exports = mongoose.model("Dose", DoseSchema);
