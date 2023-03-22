/*
 * Title: Worker libary
 * Description: workerlication Routes
 * Author: Sahariar Kabir
 * Date: 03/16/2023
 *
 */

const url = require("url");
const http = require("http");
const https = require("https");
const { parseJSON } = require("../helpers/utilites");
const data = require("./data");
const {sendTwilloSms} = require('../helpers/notification');

// worker Object use
const worker = {};

worker.gatherAllChecks = () => {
	data.list("checks", (errList, checks) => {
		if (!errList && checks && checks.length > 0) {
			checks.forEach((check) => {
				data.read("checks", check, (errRead, ogCheckData) => {
					if (!errRead && ogCheckData) {
						worker.validateCheckData(parseJSON(ogCheckData));
					} else {
						console.log("error: Reading Error Data");
					}
				});
			});
		} else {
			console.log("Error : Couldnot find any process!");
		}
	});
};
worker.validateCheckData = (ogCheckData) => {
	let checkOgData = ogCheckData;
	if (checkOgData && checkOgData.id) {
		checkOgData.state = typeof checkOgData.state === "string" && ["up", "down"].indexOf(checkOgData.state) > -1 ? checkOgData.state : "down";

		checkOgData.lastChecked = typeof checkOgData.lastChecked === "number" && checkOgData.lastChecked > -1 ? checkOgData.lastChecked : false;

		worker.perfromCheck(checkOgData);
	} else {
		console.log("error: check was invalid or format isn't right");
	}
};
// perfromCheck
// protocol,url,method,successCodes,timeoutSeconds
worker.perfromCheck = (checkOgData) => {
	// pepear the intial check outcome
	let checkOutCome = {
		error: false,
		responseCode: false,
	};
	let outcomeSet = false;

	// parse the hostname and url form user input
	const parseUrl = url.parse(`${checkOgData.protocol}://${checkOgData.url}`, true);
	const hostname = parseUrl.hostname;
	const { path } = parseUrl;

	// construct the request;

	const requestDetails = {
		protocol: `${checkOgData.protocol}:`,
		hostname: hostname,
		method: checkOgData.method.toUpperCase(),
		path,
		timeout: checkOgData.timeoutSeconds * 1000,
	};
	const protocolToUse = checkOgData.protocol === "http" ? http : https;

	let req = protocolToUse.request(requestDetails, (res) => {
		const staus = res.statusCode;

		// update the check outcome and pass to next process.
		checkOutCome.responseCode = staus;
		if (!outcomeSet) {
			worker.processCheckOutcome(checkOgData, checkOutCome);
			outcomeSet = true;
		}
	});
	req.on("error", (e) => {
		checkOutCome = {
			error: true,
			value: e,
		};
		if (!outcomeSet) {
			worker.processCheckOutcome(checkOgData, checkOutCome);
			outcomeSet = true;
		}
	});
	req.on("timeout", (e) => {
		checkOutCome = {
			error: true,
			value: "timeout",
		};
		if (!outcomeSet) {
			worker.processCheckOutcome(checkOgData, checkOutCome);
			outcomeSet = true;
		}
	});
	req.end();
};
// outcome save and check mark

worker.processCheckOutcome = (checkOgData, checkOutCome) => {
	let state = !checkOutCome.error && checkOutCome.responseCode && checkOgData.successCodes.indexOf(checkOutCome.responseCode) > -1 ? "up" : "down";

	let alertWanted = !!(checkOgData.lastChecked && checkOgData.state !== state);
	// update the checkdata
	const newCheckData = checkOgData;

	newCheckData.state = state;
	newCheckData.lastChecked = Date.now();

	// update the check time to disk.

	data.update("checks", newCheckData.id, newCheckData, (err) => {
		if (!err) {
			if (alertWanted) {
				// send the checkdata to next process
				worker.alertUserToStatusChange(newCheckData);
			} else {
				console.log("Alert is not needed as there is no state change!");
			}
		} else {
			console.log("Error trying to save check data of one of the checks!");
		}
	});
};

// alertUser

worker.alertUserToStatusChange = (newCheckData) => {
	let msg = `Alert: you check for ${newCheckData.method.toUpperCase()} ${newCheckData.protocol}://${newCheckData.url} is currently ${newCheckData.state}`;
	sendTwilloSms(newCheckData.userPhone , msg , (err) => {
		if(!err){
			console.log(`User was alerted to a status change via SMS: ${msg}`);
		}else{
			console.log('There was a problem sending sms to one of the user!');
		}
	})
};

// run every one minute.
worker.loop = () => {
    setInterval(() => {
        worker.gatherAllChecks();
    }, 1000 * 60);
};

worker.init = () => {
	// Start worker
	worker.gatherAllChecks();
	worker.loop();
};

module.exports = worker;
