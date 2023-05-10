var express = require("express"),
	mongoose = require("mongoose"),
	passport = require("passport"),
	bodyParser = require("body-parser"),
	LocalStrategy = require("passport-local"),
	passportLocalMongoose = require("passport-local-mongoose"),
	Medication =  require("./models/medication"),
	Pill =  require("./models/pill"),
	Dose =  require("./models/dose"),
	Instruction =  require("./models/instruction"),
	Schedule=  require("./models/schedule"),
	User = require("./models/user");
const { get } = require("express/lib/response");
const cors = require('cors');
const jwt = require("jsonwebtoken");
var moment = require('moment');

mongoose.connect("mongodb+srv://habbit:habbit2022@cluster0.qicx3.mongodb.net/smartpill?retryWrites=true&w=majority");
var userData;
var graphData;
var instructions;
var pills;
var doses;
var thisDate;   //  from selected calendar date

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(require("express-session")({
	secret: "DAT668 Smart Pill Dispenser",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static('public'));

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const corsConf = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204
}

app.use(cors(corsConf));

getInstructions();
getPills();
getDoses();

function getInstructions(){
	Instruction.find({}, function(err, instruction) {   //load instructions
		if (err)
		  console.log(err);
		instructions = instruction;		
	  });
}

function getPills(){ 
	Pill.find({}, function(err, pill) {   //load pills
		if (err)
		  console.log(err);
		pills = pill;		
	  });
}

function getDoses(){ 
	Dose.find({}, function(err, dose) {   //load pills
		if (err)
		  console.log(err);
		doses = dose;		
	  });
}

function postDoses(){

	new Dose({dose:"3"}).save(function (err, str){
	
	if (err){console.log(err); }
	});


}

//=====================
// ROUTES
//=====================


app.post("/register", function (req, res) {
	
	var username = req.body.username;
	var password = req.body.password;
	var fullname = req.body.fullname;
	//console.log(req.body);
	User.register(new User({ username: username, fullname:fullname }),
			password, function (err, user) {
		if (err) {
			console.log(err);
			res.status(500).send({ message: "Error registering user"});
		}else{
			res.status(201).send({ message: "User registered successfully"});
		}
		
	});
});

// Handling  submitted schedule
app.post("/schedule", function (req, res) {
	console.log(req.body.userID);
	console.log(req.body.medID);
	console.log(req.body.schedule_date);
	new Schedule({ medid: req.body.medID, userid: req.body.userID,  schedule_date:req.body.schedule_date }).save(function (err, str) {
		if (err) {
				console.log(err);		
		}else{
			res.status(202).send({ message: "Schedule posted successfully"});
		}
});
});

// Handling  submitted medications
app.post("/medication", function (req, res) {
	console.log(req.body.pillID);
	new Medication({ pillid: req.body.pillID, userid:req.body.userID,doseid:req.body.doseID,instructionid:req.body.instrID }).save(function (err, str) {
		if (err) {
				console.log(err);		
		}else{
			res.status(202).send({ message: "Medication posted successfully"});
		}
});
});


// Handling  taken scheduled medication
app.post("/taken", function (req, res) {
	console.log(req.body.schedID);
	console.log(req.body.userID);
	if (req.body.schedID && req.body.userID){		
	var taken = {taken:"1"};
		// update this scheduled  medication as taken
		Schedule.findOneAndUpdate({_id: req.body.schedID}, taken, {new: true}, function(err, str) {
			if (err)
			  console.log(err);				  
			 res.status(202).send({ message: "Medication Taken successfully"});
		  });
	
	}else {  //not found

	}
	
});


//Handling user login

app.post('/login', (req, res, next) => {
  passport.authenticate('local',
  (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
	res.status(401).send({ message: "User not logged in"});
    }else{

    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }
	//   generate JWT token
          const token = jwt.sign(
            {
              userId: user._id,
              userEmail: user.username,
	      fullname: user.fullname,
            },
            "RANDOM-TOKEN",
            { expiresIn: "1h" }
          );

	res.status(202).send({ message: "User logged in successfully", token});
    });
    }
  })(req, res, next);
});

app.get("/auth", isLoggedIn, function (req, res) {
        res.status(202).send({message:"You are in"});
});

app.get("/instruction", function (req, res) {
	//console.log(instructions);
        res.send(instructions);
});


app.get("/pill", function (req, res) {
	//console.log(pills);
        res.send(pills);
});

app.get("/dose", function (req, res) {
        res.send(doses);
});


app.get("/schedule", function (req, res) {
	Schedule.find({userid: mongoose.Types.ObjectId(req.headers.userid)}, function(err, schedule) {   //load instructions
		if (err)
		  console.log(err);
		  res.send(schedule);
	  });
});


app.get("/medication", function (req, res) {
 Medication.aggregate([
    { $match: { userid: mongoose.Types.ObjectId(req.headers.userid)} },
    { $lookup:  {
                    from: "instructions",
                    localField: "instructionid",
                    foreignField: "_id",
                    as: "medinstr"
            }
    },
    { $lookup:  {
                    from: "pills",
                    localField: "pillid",
                    foreignField: "_id",
                    as: "medpill"
            }
    },
    { $lookup:  {
                    from: "doses",
                    localField: "doseid",
                    foreignField: "_id",
                    as: "meddose"
            }
    },
	  { $lookup:  {
                    from: "schedules",
                    localField: "_id",
                    foreignField: "medid",
                    as: "medsched"
            }
    }

]).exec(function(err, result) {
        if (err) {console.log(err);}else{
	graphData = result;  // prepare data for graph plotting
        res.send(result)}
    });



});


app.get("/graph", function (req, res) {
        var array = [];
	var i = 0;
	var strjson;

        graphData.map((med) => {
        med.medsched.map((sched) => {
                //var str ='{"y":'+med.meddose[0].dose+',"Label":"'+med.medpill[0].pill+'"}';
                //var str ='{"legendText":"'+med.medpill[0].pill+'","name":"'+med.medpill[0].pill+'","label":"'+med.medpill[0].pill+'","y":'+med.meddose[0].dose+',"x":'+i+'}';
		var taken = moment(sched.schedule_date).format("DD/MM/yy");
                //var str ='{"legendText":"'+med.medpill[0].pill+'","name":"'+med.medpill[0].pill+'","label":"'+med.medpill[0].pill+'","y":'+med.meddose[0].dose+'}';
                var str ='{"legendText":"'+med.medpill[0].pill+'","name":"'+med.medpill[0].pill+'","label":"'+taken+' '+med.medpill[0].pill+'","y":'+med.meddose[0].dose+'}';
		i++;
                strjson = JSON.parse(str);
		if (sched.taken == "1"){  // add only taken medication
                array.push(strjson);
		}
        })

        })
	console.log(array);
        res.send(array);
});



function isLoggedIn (req, res, next) {  // check if user is logged in
   try {
    //   get the received token from the browser
    const token = req.headers.authorization.split(" ")[1];

    //verifiy if the received token matches the original one
    const veryfiedToken = jwt.verify(token, "RANDOM-TOKEN");

    next();

  } catch (error) {

        res.status(401).send({message:"You are not in"});
  }
}
module.exports = app;
