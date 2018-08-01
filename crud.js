// Copyright © 2015, 2017 IBM Corp. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
'use strict';

/*if (!process.env.CLOUDANT_URL) {
  console.error("Please put the URL of your Cloudant instance in an environment variable 'CLOUDANT_URL'");
  process.exit(1);
}
*/
var async = require('async');
var Cloudant = require('@cloudant/cloudant');
var cloudant = Cloudant({url: 'https://4bc0432b-2141-4d0d-bccc-0886a178fc42-bluemix:3195f45f9cbec91be8f5c020db1c7860a6fac712e3e247578dea4f7d3220354a@4bc0432b-2141-4d0d-bccc-0886a178fc42-bluemix.cloudant.com'});

var dbname = 'faq';
var dbuser='userdetails';
//var dbname = 'crud';
var db = null;
var doc = null;


var docuser = null;

 db = cloudant.db.use(dbname);
 docuser=cloudant.db.use(dbuser);

const crud =
{


/*


// read a document
 readDocument : function(customerId, accountType,callback) {
  console.log("Reading document 'mydoc'",accountType);
  db.get('1', function(err, data) {
    console.log('Error:', err);
    console.log('Data response :', data);
    // keep a copy of the doc so we know its revision token
    doc = data;
   callback(null, doc);
  });
   
}

*/




// read a document
/*
 readDoc : function(accountType,type,category,callback) {
  console.log("Reading document 'mydoc'");
  
  console.log("crud insside ",accountType ,type, category);
   var xt = {
  "selector": {
          "account_type" : accountType,
		  "type" : type
  }};
  
  db.find(xt, function(err, data) {
    console.log('Error:', err);
    console.log('Data:', data);
    // keep a copy of the doc so we know its revision token
    doc = data;
    callback(err, data);
  });
}


};
*/





 readDoc : function(accountType,type,category,callback) {
  console.log("Reading document 'mydoc'");
  
  console.log("crud insside ",accountType ,type, category);
   var xt = {
  "selector": {
          "account_type" : accountType,
		  "type" : type
  }};
  
/*db.find(xt, function(err, data) {
    console.log('Error:', err);
    console.log('Data:', data);
    // keep a copy of the doc so we know its revision token
    doc = data;
    callback(err, data);
  });
*/
  
  return new Promise(function (resolve, reject) {

   db.find(xt, function (error, result) {

    if (error) {

      console.log(error);

      reject(error);

    }

    else {

       var  object = result;

       callback(null, object)

     }

  });

});
  
  
  
  },
  
 createDocument : function(accountType,type,category,emailTo,contact,callback) {
  console.log("Creating document 'mydoc'");
  
  var  insertQuery ={
  
  "contactno":contact,
  "email":emailTo,
  "account_type":accountType,
  "type": type
  
};
  
  // we are specifying the id of the document so we can update and delete it later
  docuser.insert(insertQuery, function(err, data) {
    console.log('Error:', err);
    console.log('Data:', data);
    callback(err, data);
  });
}
  


};


module.exports = crud;