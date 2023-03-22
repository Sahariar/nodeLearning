/*
 * Title: Notification libary
 * Description: Important Functions to Notify
 * Author: Sahariar Kabir
 * Date: 03/16/2023
 *
 */

// dependancy

const https = require("https");
const { twillo } = require("./enviroment");
const querystring = require('querystring');
const {parseJSON} = require('./../helpers/utilites');

// module scaffholding
const notifications = {};

// send sms notification using twillo api.
notifications.sendTwilloSms = (phone, mesg, callback) => {
	// input validate

	const userPhone = typeof phone === "string" && phone.trim().length === 11 ? phone : false;
	const userMsg = typeof mesg === "string" && mesg.trim().length > 0 && mesg.trim().length <= 1600 ? mesg.trim() : false;
    if (userPhone && userMsg) {
        // config payload
        let payload = {
            From: twillo.fromPhone,
            To: `+88${userPhone}`,
            Body: userMsg,
        }
    
        // stringfy payload
        let stringfyPayload = querystring.stringify(payload);;
    
        // configure the request details.
    
        let requestDetails = {
            hostname: 'api.twilio.com',
            method: 'POST',
            path: `/2010-04-01/Accounts/${twillo.accountSid}/Messages.json`,
            auth: `${twillo.accountSid}:${twillo.authToken}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
          };
    
          const req = https.request( requestDetails , (res) =>{
            const status = res.statusCode;
            if( status === 200 || status === 201){
                callback(`${false}`);
            }else{
            callback(`status code is ${status} `);
            }
          });
    
          req.on("err" , (e)=>{
            callback(e);
          })
          req.write(stringfyPayload);
          req.end()
    
    } else {
        callback(400, {
            error: "error in input",
        });
    }
};



// export module

module.exports = notifications;
