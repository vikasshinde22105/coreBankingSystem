'use strict';

require('dotenv').config({
  silent: true
});

var express = require('express'); // app server
var bodyParser = require('body-parser'); // parser for post requests
var watson = require('watson-developer-cloud'); // watson sdk
var AssistantV1 = require('watson-developer-cloud/assistant/v1');

var Cloudant  = require('@cloudant/cloudant');

var LOOKUP_NEWBENEFICIARY = 'newbeneficiary';
var LOOKUP_SENTOTP = 'sendotp';
var LOOKUP_TRANSFERMONEY = 'transfermoney';
var LOOKUP_PAYEE = 'payee';
var LOOKUP_BILLER = 'billpayment';
var LOOKUP_NEWBILLER = 'newbillpayment';
var LOOKUP_SENDBILLEROTP = 'sendbillerotp';
var LOOKUP_TRANSFERBILLPAYMENT = 'transferbillpayment';

var customerData;

var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
 service: 'gmail',
 auth: {
        user: 'bankbot33@gmail.com',
        pass: 'Bot@1234'
    }
});

const app = express();

// Bootstrap application settings
app.use(express.static('./public')); // load UI from public folder
app.use(bodyParser.json());

// setupError will be set to an error message if we cannot recover from service setup or init error.
let setupError = '';

var cloudant = Cloudant({url: 'https://b351c732-7555-4817-bd11-0f8218b1dbba-bluemix:0eba437dd54be9a990113d8b5f4183001e4619acd7c43f881b976b61fa7fea9e@b351c732-7555-4817-bd11-0f8218b1dbba-bluemix.cloudant.com'});
var dbname = 'banking_app';
var db = null;
var doc = null;
db = cloudant.db.use(dbname);


var AssistantV1 = require('watson-developer-cloud/assistant/v1');

var assistant = new AssistantV1({
  username: process.env.CONVERSATION_USERNAME,
  password: process.env.CONVERSATION_PASSWORD,
  url: 'https://gateway.watsonplatform.net/assistant/api/',
  version: '2018-02-16'
});
var workspaceID = process.env.WORKSPACE_ID;

var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');

var toneAnalyzer = new ToneAnalyzerV3({
  username: process.env.TONE_ANALYZER_USERNAME,
  password: process.env.TONE_ANALYZER_PASSWORD,
  version: '2016-05-19',
  url: 'https://gateway.watsonplatform.net/tone-analyzer/api/'
});


//customer Detail API
app.post('/api/customer_detail', function (req, res) {
  db.find({selector:{doc_type:'customer'}}, function(error, result) {
  //db.get('cust_1', function(error, result) {
    console.log(req.body.username);
    console.log(req.body.password);

    if (error){
      res.json({"error" : true});
      //console.log(error);
    }
    else{
      //res.json(result);
      var result;
      var validUsers = result.docs;
      var flag =false;
      //console.log(validUsers);
      for ( var i in validUsers ) {
            console.log('----'+validUsers[i].cust_username);
            console.log('----'+validUsers[i].cust_password);
            if(req.body.username == validUsers[i].cust_username && req.body.password == validUsers[i].cust_password){
                flag = true;
				
                customerData = validUsers[i];
                break;
                //$window.location.href = '/index.html';
              }
              else{
                flag = false;
                //$('#errorblock').css('display','block');
              }
      }
      if(flag == true){
       
        result={"success" : true};
        console.log("Login");
        console.log(customerData);
        // $scope.showError = false;
        // $window.location.href = '/index.html';
      }
      else{
        
        result={"success" : false};
        console.log("Failed");
        console.log(result);
        // $scope.showError = true;
        //$('#errorblock').css('display','block');
      } 
      
    res.json(result);
    }
  });
});

app.get('/api/customer_personal_detail', function (req, res) {
		db.get(customerData._id, function(error, result) {
		if (error){
		res.json({"error" : true});
		console.log(error);
		}
		else{
		console.log(result);
		res.json(result);
		}
		}); 
   
});

app.get('/api/logout', function (req, res) {
  var result={"success" : true};
  customerData = null;
  res.json(result);
});


// Endpoint to be called from the client side
app.post('/api/message', function(req, res) {
  if (setupError) {
    return res.json({ output: { text: 'The app failed to initialize properly. Setup and restart needed.' + setupError } });
  }

  if (!workspaceID) {
    return res.json({
      output: {
        text: 'Assistant initialization in progress. Please try again.'
      }
    });
  }
  
  db.find({selector:{_id:customerData._id,}}, function(er, result) {
			  if (er) {
					throw er;
					}
					console.log('Adding customer id to context');
				const payload = {
				  workspace_id: workspaceID,
				  context: {
					customer_id: result.docs['0']._id,
					customer_email: result.docs['0'].cust_email,
					customer_balance: result.docs['0'].account_balance,
					tone_anger_threshold: 0.60000,
				  },
				  input: {}
				};

	 // common regex patterns
    const regpan = /^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/;
    // const regadhaar = /^\d{12}$/;
    // const regmobile = /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[789]\d{9}$/;
    if (req.body) {
      if (req.body.input) {
        let inputstring = req.body.input.text;
        console.log('input string ', inputstring);
        const words = inputstring.split(' ');
        console.log('words ', words);
        inputstring = '';
        for (let i = 0; i < words.length; i++) {
          if (regpan.test(words[i]) === true) {
            // const value = words[i];
            words[i] = '1111111111';
          }
          inputstring += words[i] + ' ';
        }
        // words.join(' ');
        inputstring = inputstring.trim();
        console.log('After inputstring ', inputstring);
        // payload.input = req.body.input;
        payload.input.text = inputstring;
      }
      if (req.body.context) {
        // The client must maintain context/state
        payload.context = req.body.context;
      }
    }			
	callconversation(payload);
	});
	
	
  

  /**
   * Send the input to the conversation service.
   * @param payload
   */
  function callconversation(payload) {
    const queryInput = JSON.stringify(payload.input);
    // const context_input = JSON.stringify(payload.context);

    toneAnalyzer.tone(
      {
        text: queryInput,
        tones: 'emotion'
      },
      function(err, tone) {
        let toneAngerScore = '';
        if (err) {
          console.log('Error occurred while invoking Tone analyzer. ::', err);
          // return res.status(err.code || 500).json(err);
        } else {
          const emotionTones = tone.document_tone.tone_categories[0].tones;

          const len = emotionTones.length;
          for (let i = 0; i < len; i++) {
            if (emotionTones[i].tone_id === 'anger') {
              console.log('Input = ', queryInput);
              console.log('emotion_anger score = ', 'Emotion_anger', emotionTones[i].score);
              toneAngerScore = emotionTones[i].score;
              break;
            }
          }
        }

        payload.context['tone_anger_score'] = toneAngerScore;

          assistant.message(payload, function(err, data) {
            if (err) {
              return res.status(err.code || 500).json(err);
            } else {
				console.log('assistant.message :: ', JSON.stringify(data));
				console.log('assistant.input.message :: ', JSON.stringify(data.input.text));
			    console.log('assistant.output.message :: ', JSON.stringify(data.output.text));
			//saveConversation(data);
            checkForLookupRequests(data, function(err, data) {
                  if (err) {
                    return res.status(err.code || 500).json(err);
                  } else {
                    return res.json(data);
                  }
                });				
				if(!data.input.text){
                  audioConverter(data.output);
				}

            }
          });
        
      }
    );
  }
});

function saveConversation(data){
	var doc = {
				  "_id": "conversation_1",
				  "cust_id": data.context.customer_id,
				  "doc_type": "conversation data",
				  "user_input": data.input.text,
				  "watson_response": data.output.text
				}
		db.insert(doc, function (er, result) {
			  if (er) {
				throw er;
			  }

		console.log('Created conversation data');
		
		});
}

/**
 * Looks for actions requested by assistant service and provides the requested data.
 */
function checkForLookupRequests(data, callback) {
  console.log('checkForLookupRequests');

  if (data.context && data.context.action && data.context.action.lookup && data.context.action.lookup != 'complete') {
    const payload = {
      workspace_id: workspaceID,
      context: data.context,
      input: data.input
    };

    // assistant requests a data lookup action
	if (data.context.action.lookup === LOOKUP_PAYEE){
		console.log('Payee lookup');
		
			  
			  db.find({selector:{cust_id:data.context.customer_id, doc_type:'benificiary',}}, function(er, result) {
			if (er) {
					throw er;
			}

		console.log('Found documents with name cust1', result.docs);
 
  
  for (var i = 0; i < result.docs.length; i++) {
    console.log('  Doc id: %s', result.docs[i]._id);
  }
  payload.context['list_payee'] = result.docs;
  payload.context['list_payee_counter'] = result.docs.length;
  
  payload.context.action = {};
  assistant.message(payload, function(err, data) {
              if (err) {
                console.log('Error while calling assistant.message with lookup result', err);
                callback(err, null);
              } else {
                
                callback(null, data);
              }
            });
	});

		data.context.action = {};
	} else if (data.context.action.lookup === LOOKUP_NEWBENEFICIARY){
		console.log('LOOKUP_NEWBENEFICIARY');
		payload.context['add_beneficiary'] = 'true'
		payload.context.action = {};
		db.find({selector:{cust_id:data.context.customer_id, doc_type:'benificiary',}}, function(er, result) {
			  if (er) {
					throw er;
					}
					
					var doc_count=result.docs.length + 1;
					var doc_id = "benf_"
					doc_id += doc_count;
				
		
			var doc = {
				  "_id": doc_id,
				  "cust_id": data.context.customer_id,
				  "doc_type": "benificiary",
				  "benificiary_name": data.context.benf_name,
				  "benf_account_no": data.context.benf_actno
				}
		db.insert(doc, function (er, result) {
			  if (er) {
				throw er;
			  }

		console.log('Created benificiary');
		
		});
	});
		 assistant.message(payload, function(err, data) {
              if (err) {
                console.log('Error while calling assistant.message with lookup result', err);
                callback(err, null);
              } else {
                //console.log('checkForLookupRequests assistant.message :: ', JSON.stringify(data));
                callback(null, data);
              }
            });
		data.context.action = {};
	} else if (data.context.action.lookup === LOOKUP_SENTOTP){
		console.log('LOOKUP_SENTOTP');
		payload.context['send_otp'] = 'true';
		
		var otp=Math.floor(Math.random()*90000) + 10000;
		
		payload.context['otp'] = otp;
		
		const mailOptions = {
			from: 'bankbot33@gmail.com', // sender address
			to: data.context.customer_email, // list of receivers
			subject: 'OTP for transaction', // Subject line
			html: '<p>Hello Sir<br/> Your OTP is '+ otp +'</b></p>'// plain text body
		};
		transporter.sendMail(mailOptions, function (err, info) {
		   if(err)
			 console.log(err)
		   else
			 console.log(info);
		});
		data.context.action = {};
		assistant.message(payload, function(err, data) {
              if (err) {
                console.log('Error while calling assistant.message with lookup result', err);
                callback(err, null);
              } else {
                //console.log('checkForLookupRequests assistant.message :: ', JSON.stringify(data));
                callback(null, data);
              }
            });
			
		
		
		
		
	} else if (data.context.action.lookup === LOOKUP_TRANSFERMONEY){
		
		console.log('LOOKUP_TRANSFERMONEY');
		payload.context['transfer_money'] = 'true';
		var trans_id=Math.floor(Math.random()*9000000000) + 1000000000;
		payload.context['transaction_id'] = trans_id;
		db.find({selector:{cust_id:data.context.customer_id, doc_type:'transaction',}}, function(er, result) {
			  if (er) {
					throw er;
					}
					var doc_count=result.docs.length + 1;
					var doc_id = "transaction_"
					doc_id += doc_count;
				
		
			var doc = {
				  "_id": doc_id,
				  "cust_id": data.context.customer_id,
				  "doc_type": "transaction",
				  "benificiary_name": data.context.benf_name,
				  "benf_account_no": data.context.benf_actno,
				  "transfer_money": data.context.transfermoney,
				  "transaction_id": trans_id
				}
		db.insert(doc, function (er, result) {
			  if (er) {
				throw er;
			  }
			  else{
	
		console.log('Created transaction ');
		db.get(data.context.customer_id, { revs_info: true }, function(err, doc1) {

		if (err) {throw err;}
	    doc1.account_balance=doc1.account_balance-data.context.transfermoney;
		payload.context['customer_balance'] = doc1.account_balance;
        db.insert(doc1, doc1.id, function(err, doc1) {
				if(err) {
						console.log('Error inserting data\n'+err);
						return 500;
					}else{
						console.log('doc1', doc1);
		const mailOptions = {
			from: 'bankbot33@gmail.com', // sender address
			to: data.context.customer_email, // list of receivers
			subject: 'Transaction Completed', // Subject line
			html: '<p>Hello Sir<br/> Your transaction for transfer of <b>Rs.&nbsp;'+ data.context.transfermoney+'</b> to <b>'+data.context.benf_name +'</b> has been completed,<br/> Your transaction ID is:<b>'+trans_id+'</p>'// plain text body
		};
		transporter.sendMail(mailOptions, function (err, info) {
		   if(err)
			 console.log(err)
		   else
			 console.log(info);
		});								
			return 200;
					}
		});
	 data.context.action={};
		
	});
	}
	});
	});		
	assistant.message(payload, function(err, data) {
              if (err) {
                console.log('Error while calling assistant.message with lookup result', err);
                callback(err, null);
              } else {
                //console.log('checkForLookupRequests assistant.message :: ', JSON.stringify(data));
                callback(null, data);
              }
        });	
	}	else if (data.context.action.lookup === LOOKUP_BILLER){
		console.log('Biller Lookup');
		 
			  db.find({selector:{cust_id:data.context.customer_id, doc_type:'biller',}}, function(er, result) {
			if (er) {
					throw er;
			}

			console.log('Found billers', result.docs);
 
  
			  for (var i = 0; i < result.docs.length; i++) {
				console.log('  Doc id: %s', result.docs[i]._id);
			  }
			  payload.context['list_biller'] = result.docs;
			  payload.context['list_biller_count'] = result.docs.length;
			  
			  payload.context.action = {};
			  assistant.message(payload, function(err, data) {
              if (err) {
                console.log('Error while calling assistant.message with lookup result', err);
                callback(err, null);
              } else {
                
                callback(null, data);
              }
            });
	});

		data.context.action = {};
		
	}else if (data.context.action.lookup === LOOKUP_NEWBILLER){
		console.log('NEW Biller');
		payload.context['add_biller'] = 'true'
		payload.context.action = {};
		db.find({selector:{cust_id:data.context.customer_id, doc_type:'biller',}}, function(er, result) {
			  if (er) {
					throw er;
					}
					var bdoc_count=result.docs.length + 1;
					var bdoc_id = "biller_"
					bdoc_id += bdoc_count;
				
		
			var doc = {
				  "_id": bdoc_id,
				  "cust_id": data.context.customer_id,
				  "doc_type": "biller",
				  "biller_name": data.context.biller_name,
				  "biller_account_no": data.context.biller_actno
				}
		db.insert(doc, function (er, result) {
			  if (er) {
				throw er;
			  }

		console.log('Created Biller');
		
		});
	});
		 assistant.message(payload, function(err, data) {
              if (err) {
                console.log('Error while calling assistant.message with lookup result', err);
                callback(err, null);
              } else {
                //console.log('checkForLookupRequests assistant.message :: ', JSON.stringify(data));
                callback(null, data);
              }
            });
		data.context.action = {};
		
		
	} else if(data.context.action.lookup === LOOKUP_SENDBILLEROTP){
		console.log('SEND Biller OTP');
		
		payload.context['sendbiller_otp'] = 'true';
		
		var otp=Math.floor(Math.random()*90000) + 10000;
		
		payload.context['biller_otp'] = otp;
		
		const mailOptions = {
			from: 'bankbot33@gmail.com', // sender address
			to: data.context.customer_email, // list of receivers
			subject: 'OTP for transaction', // Subject line
			html: '<p>Hello Sir<br/> Your OTP is '+ otp +'</b></p>'// plain text body
		};
		transporter.sendMail(mailOptions, function (err, info) {
		   if(err)
			 console.log(err)
		   else
			 console.log(info);
		});
		data.context.action = {};
		assistant.message(payload, function(err, data) {
              if (err) {
                console.log('Error while calling assistant.message with lookup result', err);
                callback(err, null);
              } else {
                //console.log('checkForLookupRequests assistant.message :: ', JSON.stringify(data));
                callback(null, data);
              }
            });	
	} else if(data.context.action.lookup === LOOKUP_TRANSFERBILLPAYMENT){
		console.log('transferbillpayment Lookup');
		payload.context['transfer_billpayment'] = 'true';
		var btrans_id=Math.floor(Math.random()*9000000000) + 1000000000;
		payload.context['billtransaction_id'] = btrans_id;
		db.find({selector:{cust_id:data.context.customer_id, doc_type:'billtransaction',}}, function(er, result) {
			  if (er) {
					throw er;
					}
					var doc_count=result.docs.length + 1;
					var doc_id = "billtransaction_"
					doc_id += doc_count;
				
		
			var doc = {
				  "_id": doc_id,
				  "cust_id": data.context.customer_id,
				  "doc_type": "billtransaction",
				  "biller_name": data.context.biller_name,
				  "biller_account_no": data.context.biller_actno,
				  "transfer_billmoney": data.context.billermoney ,
				  "transaction_id": btrans_id
				}
		db.insert(doc, function (er, result) {
			  if (er) {
				throw er;
			  }
			  else{
	
		console.log('Created transaction ');
		db.get(data.context.customer_id, { revs_info: true }, function(err, doc1) {

		if (err) {throw err;}
	    doc1.account_balance=doc1.account_balance-data.context.billermoney;
        db.insert(doc1, doc1.id, function(err, doc1) {
				if(err) {
						console.log('Error inserting data\n'+err);
						return 500;
					}else{
						console.log('doc1', doc1);
		const mailOptions = {
			from: 'bankbot33@gmail.com', // sender address
			to: data.context.customer_email, // list of receivers
			subject: 'Transaction Completed', // Subject line
			html: '<p>Hello Sir<br/> Your transaction for transfer of <b>Rs.&nbsp;'+ data.context.billermoney+'</b> to <b>'+data.context.biller_name +'</b> has been completed,<br/> Your transaction ID is:<b>'+btrans_id+'</p>'// plain text body
		};
		transporter.sendMail(mailOptions, function (err, info) {
		   if(err)
			 console.log(err)
		   else
			 console.log(info);
		});								
			return 200;
					}
		});
	 data.context.action={};
		
	});
	}
	});
	});		
	assistant.message(payload, function(err, data) {
              if (err) {
                console.log('Error while calling assistant.message with lookup result', err);
                callback(err, null);
              } else {
                //console.log('checkForLookupRequests assistant.message :: ', JSON.stringify(data));
                callback(null, data);
              }
        });	
	}
  } else {
    callback(null, data);
    return;
  }
}

function audioConverter(req) {
    console.log(req.text[0]);
    var TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');
    var fs = require('fs');
    var text=req.text[0].replace(/<(?:.|\n)*?>/gm, ''); 
    console.log(text);

    var textToSpeech = new TextToSpeechV1({
        username: '5b5e33a1-034b-4a09-8073-c038d8823071',
        password: 'xaOpeoUQqiUr'
    });

    var synthesizeParams = {
        text:text,
        accept: 'audio/wav',
        voice: 'en-US_AllisonVoice'
    };
    // Pipe the synthesized text to a file.
    textToSpeech.synthesize(synthesizeParams).on('error', function(error) {
        console.log(error);
    }).pipe(fs.createWriteStream('./public/js/audioFile4.wav'));
}


/**
 * Handle setup errors by logging and appending to the global error text.
 * @param {String} reason - The error message for the setup error.
 */
function handleSetupError(reason) {
  setupError += ' ' + reason;
  console.error('The app failed to initialize properly. Setup and restart needed.' + setupError);
  // We could allow our chatbot to run. It would just report the above error.
  // Or we can add the following 2 lines to abort on a setup error allowing Bluemix to restart it.
  console.error('\nAborting due to setup error!');
  process.exit(1);
}

module.exports = app;
