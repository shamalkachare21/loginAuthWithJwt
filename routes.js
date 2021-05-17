var mysql = require('mysql');
var userModel = require('./model/userModel');


module.exports=  function(app){

	
		app.use('*', async function (req, res, next) {	
		  var jverify=require('./model/jwt');
		    var verify='';
		      try {
		       verify= await jverify.validateToken(req,res);

		      } catch(err) {
		    //    console.log(err);
		      }
		   	 if(verify) //  if(verify.msg=="Key Expired")
		    {	   
		      next();		      
		      }
		    else { 
		      res.json({"status":"0", "msg":"Key Expired"});
		    } 
		   
		  })
		//token validation - end

	app.post('/Api/User/registerUser', function (req, res) {
		userModel.registerUser(req, res);
	});


	app.post('/Api/User/signInUser', function (req, res) {
		userModel.signInUser(req, res);
	});

	app.get('/Api/User/getAllUsers', function (req, res) {
		userModel.getAllUsers(req, res);
	});

	app.post('/Api/User/updateUser', function (req, res) {
		userModel.updateUser(req, res);
	});

	app.get('/Api/User/searchUsers', function (req, res) {
		userModel.searchUsers(req, res);
	});
}