/*
 * Title: check hander
 * Description: user Defined work
 * Author: Sahariar Kabir
 * Date: 03/21/2023
 *
 */

// dependancy
const data = require("../../lib/data");
const { parseJSON, createRandomString } = require("../../helpers/utilites");
const tokenHandle = require("./tokenAuth");
const { maxChecks } = require("../../helpers/enviroment");

const handlers = {};

handlers.checkHandle = (requestPropertise, callback) => {
	const acceptedMethod = ["get", "put", "post", "delete"];

	if (acceptedMethod.indexOf(requestPropertise.method) > -1) {
		handlers._check[requestPropertise.method](requestPropertise, callback);
	} else {
		callback(405);
	}
};

handlers._check = {};

handlers._check.post = (requestPropertise, callback) => {
	//  validate input of user

	let protocol = typeof requestPropertise.body.protocol === "string" && ["http", "https"].indexOf(requestPropertise.body.protocol) > -1 ? requestPropertise.body.protocol : false;

	let url = typeof requestPropertise.body.url === "string" && requestPropertise.body.url.trim().length > 0 ? requestPropertise.body.url : false;

	let method = typeof requestPropertise.body.method === "string" && ["GET", "PUT", "POST", "DELETE"].indexOf(requestPropertise.body.method) > -1 ? requestPropertise.body.method : false;

	let successCodes = typeof requestPropertise.body.successCodes === "object" && requestPropertise.body.successCodes instanceof Array ? requestPropertise.body.successCodes : false;

	let timeoutSeconds = typeof requestPropertise.body.timeoutSeconds === "number" && requestPropertise.body.timeoutSeconds % 1 === 0 && requestPropertise.body.timeoutSeconds >= 1 && requestPropertise.body.timeoutSeconds <= 5 ? requestPropertise.body.timeoutSeconds : false ? requestPropertise.body.phone : false;

	if (protocol && url && method && successCodes && timeoutSeconds) {
		let token = typeof requestPropertise.headerObject.token === "string" ? requestPropertise.headerObject.token : false;

		data.read("tokens", token, (errRead, tokenData) => {
			if (!errRead && tokenData) {
				let userPhone = parseJSON(tokenData).phone;
				data.read("users", userPhone, (error2, userData) => {
					if (!error2 && userData) {
						tokenHandle._token.verify(token, userPhone, (tokenIsValid) => {
							if (tokenIsValid) {
								let userObject = parseJSON(userData);
								let userChecks = typeof userObject.checks === "object" && userObject.checks instanceof Array ? userObject.checks : [];

								if (userChecks.length < maxChecks) {
									let checkId = createRandomString(20);
									let checkObject = {
										id: checkId,
										userPhone,
										protocol,
										url,
										method,
										successCodes,
										timeoutSeconds,
									};
									// Save the Object
									data.create("checks", checkId, checkObject, (err3) => {
										if (!err3) {
											userObject.checks = userChecks;
											userObject.checks.push(checkId);
											data.update("users", userPhone, userObject, (err4) => {
												if (!err4) {
													callback(200, checkObject);
												} else {
													callback(500, {
														error: "There was a problem in the server side!",
													});
												}
											});
										} else {
											callback(500, {
												error: "There was a problem in the server side!",
											});
										}
									});
								}
							} else {
								callback(403, {
									error: "User Not Found",
								});
							}
						});
					}
				});
			} else {
				callback(403, {
					error: "User Not Found",
				});
			}
		});
	} else {
		callback(400, {
			error: "There is a problem in your Request",
		});
	}
};

handlers._check.get = (requestPropertise, callback) => {
  const id =
    typeof requestPropertise.queryStringObject.id === "string" &&
    requestPropertise.queryStringObject.id.trim().length === 20
      ? requestPropertise.queryStringObject.id
      : false;
  if (id) {
    data.read("checks", id, (err, checkData) => {
      const check = { ...parseJSON(checkData) };
      if (!err && check) {
        let token = typeof requestPropertise.headerObject.token === "string" ? requestPropertise.headerObject.token : false;
        tokenHandle._token.verify(token, check.userPhone, (tokenIsValid) => {
          if (tokenIsValid) {
            callback(200, check)
          } else {
            callback(500, {
              error: "Requested token Not Found"
            })
        }
      });
       
      } else {
        callback(500, {
          error: "Requested token Not Found",
        });
      }
    });
  } else {
    callback(404, {
      error: "Not Found Token",
    });
  }
};
handlers._check.put = (requestPropertise, callback) => {
  const id =
  typeof requestPropertise.body.id === "string" &&
  requestPropertise.body.id.trim().length === 20
    ? requestPropertise.body.id
    : false;
  //  validate input of user

	let protocol = typeof requestPropertise.body.protocol === "string" && ["http", "https"].indexOf(requestPropertise.body.protocol) > -1 ? requestPropertise.body.protocol : false;

	let url = typeof requestPropertise.body.url === "string" && requestPropertise.body.url.trim().length > 0 ? requestPropertise.body.url : false;

	let method = typeof requestPropertise.body.method === "string" && ["GET", "PUT", "POST", "DELETE"].indexOf(requestPropertise.body.method) > -1 ? requestPropertise.body.method : false;

	let successCodes = typeof requestPropertise.body.successCodes === "object" && requestPropertise.body.successCodes instanceof Array ? requestPropertise.body.successCodes : false;

	let timeoutSeconds = typeof requestPropertise.body.timeoutSeconds === "number" && requestPropertise.body.timeoutSeconds % 1 === 0 && requestPropertise.body.timeoutSeconds >= 1 && requestPropertise.body.timeoutSeconds <= 5 ? requestPropertise.body.timeoutSeconds : false ? requestPropertise.body.phone : false;

  if(id){
    if (protocol || url || method || successCodes || timeoutSeconds) {
      
      data.read("checks", id, (err, checkData) => {
        const check = { ...parseJSON(checkData) };
        if (!err && check) {
          let token = typeof requestPropertise.headerObject.token === "string" ? requestPropertise.headerObject.token : false;
         
          tokenHandle._token.verify(token, check.userPhone, (tokenIsValid) => {
            if (tokenIsValid) {
              if(protocol){
                check.protocol = protocol
              }
              if(url){
                check.url = url
              }
              if(method){
                check.method = method
              }
              if(successCodes){
                check.successCodes = successCodes
              }
              if(timeoutSeconds){
                check.timeoutSeconds = timeoutSeconds
              }
              data.update('checks' , id , check, (errUpdate)=>{
                if(!errUpdate){
                  callback(200 , check)
                }else{
                  callback(500, {
                    error: "There was a problem in Server side",
                  });
                }
              })
            } else {
              callback(403, {
                error: "Authtentication Error"
              })
          }
        });
         
        } else {
          callback(500, {
            error: "There was a problem in Server side",
          });
        }
      });
    } else {
      callback(400, {
        error: "You must provide at least one field to Update!",
      });
    }
  } else {
		callback(400, {
			error: "There is a problem in your Request",
		});
  }
};
handlers._check.delete = (requestPropertise, callback) => {
  const id =
  typeof requestPropertise.queryStringObject.id === "string" &&
  requestPropertise.queryStringObject.id.trim().length === 20
    ? requestPropertise.queryStringObject.id
    : false;
if (id) {
  data.read("checks", id, (err, checkData) => {
    const check = { ...parseJSON(checkData) };
    if (!err && check) {
      let token = typeof requestPropertise.headerObject.token === "string" ? requestPropertise.headerObject.token : false;
      tokenHandle._token.verify(token, check.userPhone, (tokenIsValid) => {
        if (tokenIsValid) {
          // delete the check data
          data.delete("checks" , id , (errDelete) =>{
            if(!errDelete){
              data.read('users' , check.userPhone , (errCheckRead , userData) =>{
                const userObject = { ...parseJSON(userData) };
                if(!errCheckRead){
                  let userChecks = typeof(userObject.checks) === "object" && userObject.checks instanceof Array ? userObject.checks : [];

                  let checkPosition = userChecks.indexOf(id);
                  if(checkPosition > -1){
                    userChecks.splice(checkPosition, 1);
                    // resave the user data.
                    userObject.checks = userChecks
                    data.update('users' , userObject.phone , userObject, (errUpdate , userData) =>{
                      const userObject = { ...parseJSON(userData) };
                      if(!errUpdate){
                        callback(200, userObject)
                      }else{
                        callback(500, {
                          error: "Error updating users data."
                        })
                      }
                    })
                  }else{
                    callback(500, {
                      error: "Error checking poistion in users data."
                    })
                  }
                }else{
                  callback(500, {
                    error: "Error Reading users data."
                  })
                }
              })
            }else{
              callback(500, {
                error: "Server side Error."
              })
            }
          })
        } else {
          callback(500, {
            error: "Requested token Not Found"
          })
      }
    });
     
    } else {
      callback(500, {
        error: "Requested token Not Found",
      });
    }
  });
} else {
  callback(404, {
    error: "Not Found Token",
  });
}

};

module.exports = handlers;
