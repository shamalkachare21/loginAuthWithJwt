
var jwt = require('jsonwebtoken');
var constants = require('../constants.js');
 


 module.exports.verifyjwt = async function(token) { 
  try{
    var js=true;
        
    var key = constants.jwtKey;
     jwt.verify(token,constants.jwtKey,function(err, payload) {
      console.log(err);
      if(err){
        console.log("err")
            js =  false;
        }else{
            js = true;
          }
      });

     return (js)
  }catch(e){
   // console.log(e);
    //throw e;
  }

} 

module.exports.validateToken=async function(req, res) {
  var head=req.headers;
      
      try {
        var url=req.originalUrl;
        url=url.toLowerCase();
        console.log(head.authorization);
        var verify = true;
        console.log(url);
        //
        if(url=='/api/user/registeruser' || url=='/api/user/signinuser')
          verify = true;
        else{
          verify=await this.verifyjwt(head.authorization);
        }
        

        console.log(verify);
        return(verify)
       
      } catch(err) {
        console.log(err);
      }

}








