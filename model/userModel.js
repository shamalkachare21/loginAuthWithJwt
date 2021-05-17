var database = require('../database');
const bcrypt = require('bcryptjs')
var constants = require('../constants.js');
var jwt = require('jsonwebtoken');

module.exports.registerUser = async function(req, resp) {

    var request = req.body;

    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/";

    MongoClient.connect(url, async function(err, db) {
        if (err) throw err;
        var dbo = db.db("admin");

        var firstname = request.firstname;
        var lastname = request.lastname;
        var emailid = request.emailid;
        var plainTextPassword = request.password;
        var mobileno = request.mobileno;
        var address = request.address;

        if (!emailid || typeof emailid !== 'string') {
            return resp.json({
                status: 'error',
                error: 'Invalid username'
            })
        }

        if (!plainTextPassword || typeof plainTextPassword !== 'string') {
            return res.json({
                status: 'error',
                error: 'Invalid password'
            })
        }

        if (plainTextPassword.length < 5) {
            return resp.json({
                status: 'error',
                error: 'Password too small. Should be atleast 6 characters'
            })
        }

        const password = await bcrypt.hash(plainTextPassword, 10)

        let data = {
            "firstname": firstname,
            "lastname": lastname,
            "emailid": emailid,
            "password": password,
            "mobileno": mobileno,
            "address": address
        }
        let query = {
            "emailid": request.emailid
        }
        dbo.collection("usermaster").find(query).toArray(function(err, result) {
            if (err) throw err;
            if (result.length > 0)
                resp.send([{
                    "status": 0,
                    "message": "EmailId already  exists"
                }]);
            else {

                dbo.collection("usermaster").insertOne(data, function(err, res) {
                    if (err) {
                        throw err;
                        console.log(err);
                    } else
                        console.log("1 document inserted");
                    resp.send([{
                        "status": 1,
                        "message": "User added successfully."
                    }]);
                });
            }
            db.close();
        });


    });

}


module.exports.signInUser = async function(req, resp) {

    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/";
    var request = req.body;
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("admin");
        let query = {
            emailid: request.emailid
        };


        dbo.collection("usermaster").find(query).toArray(async function(err, result) {
            if (err) throw err;
            console.log(result[0].password);
            console.log(request);
            if (result.length == 0) {
                resp.send([{
                    "status": 0,
                    "message": "EmailId does not exists"
                }]);
            } else if (await bcrypt.compare(request.password, result[0].password)) {
                // the username, password combination is successful
token = jwt.sign({
                     emailid: result[0].emailid
                }, constants.jwtKey, {
                    algorithm: 'HS256',
                    expiresIn:  constants.jwtKeyExpiryTime
                });
               

                

                resp.send([{
                    status: 'ok',
                    data: token
                }])
            } else {

                (result[0].password != request.password)
                resp.send([{
                    "status": 0,
                    "message": "Wrong password"
                }]);

            };

            db.close();
        });

    });
}

module.exports.getAllUsers = async function(req, resp) {
    const result = {};

    const page = req.query.page;
    const limit = req.query.limit;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;


    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/";
    var request = req.body;

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("admin");

        dbo.collection("usermaster").find({}).toArray(async function(err, data) {

            if (err) throw err;
         //   console.log(data);
            if (data.length == 0) {
                resp.send([{
                    "status": 0,
                    "message": "Users does not exists"
                }]);
            }
            var result = data;
            console.log(data.length)


            if (endIndex < result.length) {
                result.nextPage = {
                    page: parseInt(page) + 1,
                    limit: limit
                }
            }

            if (startIndex > 0) {
                result.previusPage = {
                    page: parseInt(page) - 1,
                    limit: limit
                }
            }

            data = result.slice(startIndex, endIndex);

            let PreviousPage = 0;
            let NextPage = 0;
            if (result.previousPage != undefined)
                PreviousPage = result.previousPage.page;

            if (result.nextPage != undefined)
                NextPage = result.nextPage.page;

            resp.send(data);
        });
    });
};

module.exports.updateUser = async function(req, resp) {

    var request = req.body;

    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/";



    MongoClient.connect(url, async function(err, db) {
        if (err) throw err;
        var dbo = db.db("admin");

        var firstname = request.firstname;
        var lastname = request.lastname;
        var emailid = request.emailid;
        var plainTextPassword = request.password;
        var mobileno = request.mobileno;
        var address = request.address;


        if (!plainTextPassword || typeof plainTextPassword !== 'string') {
            return resp.json({
                status: 'error',
                error: 'Invalid password'
            })
        }

        if (plainTextPassword.length < 5) {
            return resp.json({
                status: 'error',
                error: 'Password too small. Should be atleast 6 characters'
            })
        }

        const password = await bcrypt.hash(plainTextPassword, 10)

        
            let query = {
                "emailid": request.emailid
            }

        let newValue = {
            $set: {
                "firstname": firstname,
                "lastname": lastname,
                "password": password,
                "mobileno": mobileno,
                "address": address
            }
        }
        dbo.collection("usermaster").updateOne(query, newValue, function(err, result) {
            if (err) throw err;
            else
            {            resp.send([{
                            "status": 1,
                            "message": "User updated successfully."
                        }]);
                    }
                
            db.close();
        });


    });
}



module.exports.searchUsers = async function(req, resp) {
    const result = {};

    const page = req.query.page;
    const limit = req.query.limit;
    const search = req.query.search;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/";

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("admin");

        dbo.collection("usermaster").find({
            $or: [{
                    "firstname": search
                },
                {
                    "lastname": search
                },
                {
                    "emailid": search
                },
                {
                    "mobileno": search
                }
            ]
        }).toArray(function(err, result) {

            if (err) throw err;
            if (result.length == 0) {
                resp.send([{
                    "status": 0,
                    "message": "Users does not exists"
                }]);
            }
            if (endIndex < result.length) {
                result.nextPage = {
                    page: parseInt(page) + 1,
                    limit: limit
                }
            }
            if (startIndex > 0) {
                result.previusPage = {
                    page: parseInt(page) - 1,
                    limit: limit
                }
            }

            data = result.slice(startIndex, endIndex);
            let PreviousPage = 0;
            let NextPage = 0;
            if (result.previousPage != undefined)
                PreviousPage = result.previousPage.page;

            if (result.nextPage != undefined)
                NextPage = result.nextPage.page;

            resp.send(data);
        });

    });
}