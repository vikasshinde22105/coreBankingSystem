/**
 * Copyright 2017 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License'); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

'use strict';
const crud = require('./crud');
var Request = require("request");

const dataServices = { 
 

  getAccountInfo: function(accountType,type ,category, callback) {
   
  console.log("categor",accountType ,type, category);

crud.readDoc(accountType,type ,category, function(err, data) {
	console.log("inside DATA SERVCICE code response",data);
	
	var x ="<p>1.interest rate is :"+data.docs[0].rate +"%" + "</p>";
	console.log('inter rate ',x);
	console.log("V",JSON.stringify(data.docs[0].benefits[0]));
	var count=2;
	for (var i in data.docs[0].benefits) {
    x +="<p>"+count+ ": "+ data.docs[0].benefits[i]+"</p>";
		console.log('value x',x);
		count=count+1;
}
var countForeligibility=1;
var eligibility="";
for (var i in data.docs[0].eligibility) {
    eligibility +="<p>"+countForeligibility+ ": "+ data.docs[0].eligibility[i]+"</p>";
		console.log('value x',eligibility);
		countForeligibility=countForeligibility+1;
}
	
	if(x)
	{
	  data.x=x+  '<br>  Are you Interested in this Services?  ';
	}
	if(eligibility)
	{
		data.y=eligibility +  '<br>  Are you Interested in this Services?   ';
	}
	//data.y=eligibility +"<p> To Know more click Here. </p>";
	
	
    callback(err, data);
});
  },
  
  /// second service 
   branch: function(ifsc,callback) {
	   var code=ifsc;
   
  console.log("ifsc",ifsc);

  Request.get("http://www.ifschub.in/devapi/?ifsc="+ifsc, (error, response, body) => {
    if(error) {
        return console.dir(error);
    }
	var s=JSON.parse(body);

	if(s.success)
	{
		
		
		var d= s.success;
	 
var data ='Below is the branch details:';
data = data+ '<p> Bank : '+d.bank + '</p>';
data = data + '<p> ifsc : '+d.ifsc + '</p>';
data = data + '<p> micr : '+d.micr + '</p>';
data = data + '<p> branch : '+d.branch + '</p>';
data = data + '<p> address : '+d.address + '</p>';
data = data + '<p> contact : '+d.contact + '</p>';
data = data + '<p> city : '+d.city + '</p>';
data = data + '<p> district : '+d.district + '</p>';
data = data + '<p> state : '+d.state + '</p>';

var val= 'Hope I have answered your Queries. Can i help you with any thing else. <br> <input type="submit"  class="btn-primary" onclick="accountType(\'Branch Details\')" value="Branch Details" /> <input type="submit"  class="btn-primary"  onclick="accountType(\'Accounts Details\')" value="Accounts" /> <input type="submit"  class="btn-primary"  onclick="accountType(\'Card Details\')" value="Card" /> <input type="submit"  class="btn-primary"  onclick="accountType(\'Loan Services information\')" value="Loan" /> ';

data = data +val;

console.log('output data <br>',data);
	
	
	
	console.log('json data ',data);
    console.dir(JSON.parse(body));
	callback(error,data);
		
	}
	else{
var val1= '<br> Can i help you with any thing else. <br> <input type="submit"  class="btn-primary" onclick="accountType(\'Branch Details\')" value="Branch Details" /> <input type="submit"  class="btn-primary"  onclick="accountType(\'Accounts Details\')" value="Accounts" /> <input type="submit"  class="btn-primary"  onclick="accountType(\'Card Details\')" value="Card" /> <input type="submit"  class="btn-primary"  onclick="accountType(\'Loan Services information\')" value="Loan" /> ';

		//var val= '<br> Hope I have answered your Queries. Can i help you with any thing else. <br> <input type="submit"  class="btn-primary" onclick="accountType('Branch Details')" value="Branch Details" /> <input type="submit"  class="btn-primary"  onclick="accountType('Accounts Details')" value="Accounts" /> <input type="submit"  class="btn-primary"  onclick="accountType('Card Details')" value="Card" /> <input type="submit"  class="btn-primary"  onclick="accountType('Insurance Related information')" value="Insurance" /> <input type="submit"  class="btn-primary"  onclick="accountType('Loan Services information')" value="Loan" /> ';
		//var p= s.error;
				 console.log("ifsc----",ifsc);
				var d='Sorry, we dont have any branch linked to '+ code +' IFSC code' + val1;
				console.log('not found',d);
				callback(error,d);
	}
	
	

});
  

  },
   

 ////
 
  createDocument: function(accountType,type ,category,email,contact, callback) {
   
  console.log("categor",accountType ,type, category,email,contact);

crud.createDocument(accountType,type ,category,email,contact, function(err, data) {
	console.log("inside DATA SERVCICE code response",data);
	
    callback(err, data);
});
  }
 

  
 

 
 
};

module.exports = dataServices;
