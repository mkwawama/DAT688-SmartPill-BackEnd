// importing modules
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var InstructionSchema = new Schema({
    instruction: {type: String, required:true, unique:true},
});


// export instructionschema
 module.exports = mongoose.model("Instruction", InstructionSchema);
