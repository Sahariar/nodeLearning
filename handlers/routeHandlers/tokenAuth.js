// user Token Auth js

// dependancy

const data = require("../../lib/data");
const { hash } = require("../../helpers/utilites");
const { createRandomString } = require("../../helpers/utilites");
const { parseJSON } = require("../../helpers/utilites");

const handlers = {};

handlers.tokenHandle = (requestPropertise, callback) => {
  const acceptedMethod = ["get", "put", "post", "delete"];

  if (acceptedMethod.indexOf(requestPropertise.method) > -1) {
    handlers._token[requestPropertise.method](requestPropertise, callback);
  } else {
    callback(405);
  }
};

handlers._token = {};

handlers._token.post = (requestPropertise, callback) => {
  const phone =
    typeof requestPropertise.body.phone === "string" &&
    requestPropertise.body.phone.trim().length === 11
      ? requestPropertise.body.phone
      : false;
  const password =
    typeof requestPropertise.body.password === "string" &&
    requestPropertise.body.password.trim().length > 0
      ? requestPropertise.body.password
      : false;

  if (phone && password) {
    data.read("users", phone, (errPass, userData) => {
      let hashPassword = hash(password);
      if (hashPassword === parseJSON(userData).password) {
        let tokenId = createRandomString(18);
        console.log(tokenId);
        let expires = Date.now() + 60 * 60 * 1000;
        let tokenObject = {
          phone,
          id: tokenId,
          expires,
        };

        data.create("tokens", tokenId, tokenObject, (errorCreate) => {
          if (!errorCreate) {
            callback(200, {
              message: tokenObject,
            });
          } else {
            callback(500, {
              error: "Unable to create TokenObject",
            });
          }
        });
      } else {
        callback(400, {
          error: "You have a Problem in your password",
        });
      }
    });
  } else {
    callback(400, {
      error: "You have a Problem in your request",
    });
  }
};
handlers._token.get = (requestPropertise, callback) => {
  const id =
    typeof requestPropertise.queryStringObject.id === "string" &&
    requestPropertise.queryStringObject.id.trim().length === 18
      ? requestPropertise.queryStringObject.id
      : false;
  if (id) {
    data.read("tokens", id, (err, tokenData) => {
      const token = { ...parseJSON(tokenData) };
      if (!err && token) {
        callback(200, {
          message: token,
        });
      } else {
        callback(400, {
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
// @todo : Authentication

handlers._token.put = (requestPropertise, callback) => {
  const id =
    typeof requestPropertise.body.id === "string" &&
    requestPropertise.body.id.trim().length === 18
      ? requestPropertise.body.id
      : false;
  const extend =
    typeof requestPropertise.body.extend === "boolean" &&
    requestPropertise.body.extend === true
      ? requestPropertise.body.extend
      : false;

  if (id && extend) {
    data.read("tokens", id, (errRead, tokenData) => {
      let tokenObject = parseJSON(tokenData);
      if (tokenObject.expires > Date.now()) {
        tokenObject.expires = Date.now() + 60 * 60 * 1000;
        // store the updated expires data
        data.update("tokens", id, tokenObject, (errUpdate) => {
          if (!errUpdate) {
            callback(200, {
              message: "Update TokenObject Successfully",
            });
          } else {
            callback(500, {
              error: "Server Side error.",
            });
          }
        });
      } else {
        callback(400, {
          error: "Token Already Expired.",
        });
      }
    });
  } else {
    callback(400, {
      error: "There was a Problem in your request",
    });
  }
};
handlers._token.delete = (requestPropertise, callback) => {
  const id =
    typeof requestPropertise.body.id === "string" &&
    requestPropertise.body.id.trim().length === 18
      ? requestPropertise.body.id
      : false;

  if (id) {
    data.read("tokens", id, (errRead, tokenData) => {
      if (!errRead && tokenData) {
        data.delete("tokens", id, (err) => {
          if (!err) {
            callback(200, {
              message: "Token Successfully deleted",
            });
          } else {
            callback(405, {
              error: err,
            });
          }
        });
      } else {
        callback(404, {
          error: "Token Not Found",
        });
      }
    });
  } else {
    callback(404, {
      error: "Token Not Found",
    });
  }
};

handlers._token.verify = (id ,phone , callback) =>{
  data.read("tokens", id , (err , tokenData) => {
    if(!err && tokenData){
      if(parseJSON(tokenData).phone === phone && parseJSON(tokenData).expires > Date.now()){
        callback(true);
      }
    }else{
      callback(false);
    }
  })
}


module.exports = handlers;
