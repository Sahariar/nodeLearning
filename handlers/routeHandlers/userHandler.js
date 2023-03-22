// user Handelersjs

// dependancy

const data = require("../../lib/data");
const { hash } = require("../../helpers/utilites");
const { parseJSON } = require("../../helpers/utilites");
const tokenHandle = require("./tokenAuth");

const handlers = {};

handlers.userHandle = (requestPropertise, callback) => {
  const acceptedMethod = ["get", "put", "post", "delete"];

  if (acceptedMethod.indexOf(requestPropertise.method) > -1) {
    handlers._user[requestPropertise.method](requestPropertise, callback);
  } else {
    callback(405);
  }
};

handlers._user = {};

handlers._user.get = (requestPropertise, callback) => {
  const phone =
    typeof requestPropertise.queryStringObject.phone === "string" &&
      requestPropertise.queryStringObject.phone.trim().length === 11
      ? requestPropertise.queryStringObject.phone
      : false;

  if (phone) {
    // verify token
    let token =
      typeof requestPropertise.headerObject.token === "string"
        ? requestPropertise.headerObject.token
        : false;
    tokenHandle._token.verify(token, phone, (tokenId) => {
      if (tokenId) {
        data.read("users", phone, (err, u) => {
          const user = { ...parseJSON(u) };
          if (!err && user) {
            delete user.password;
            callback(200, {
              message: user,
            });
          } else {
            callback(400, {
              error: "User Not Found",
            });
          }
        });
      } else {
        callback(403, {
          error: "Authentication Failed.",
        });
      }
    });
  } else {
    callback(404, {
      error: "User Not Found",
    });
  }
};

handlers._user.post = (requestPropertise, callback) => {
  const firstName =
    typeof requestPropertise.body.firstName === "string" &&
      requestPropertise.body.firstName.trim().length > 0
      ? requestPropertise.body.firstName
      : false;
  const lastName =
    typeof requestPropertise.body.lastName === "string" &&
      requestPropertise.body.lastName.trim().length > 0
      ? requestPropertise.body.lastName
      : false;
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
  const tosAgreement =
    typeof requestPropertise.body.tosAgreement === "boolean"
      ? requestPropertise.body.tosAgreement
      : false;

  if (firstName && lastName && phone && password && tosAgreement) {
    data.read("users", phone, (err, user) => {
      console.log("error was", err, user);

      if (err) {
        let userObject = {
          firstName,
          lastName,
          phone,
          password: hash(password),
          tosAgreement,
        };

        data.create("users", phone, userObject, (err2) => {
          if (!err2) {
            callback(200, { message: "user created successfully" });
          } else {
            callback(500, { error: "Could not Create user" });
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
      error: "There is a problem in your form",
    });
  }
};

handlers._user.put = (requestPropertise, callback) => {
  const firstName =
    typeof requestPropertise.body.firstName === "string" &&
      requestPropertise.body.firstName.trim().length > 0
      ? requestPropertise.body.firstName
      : false;
  const lastName =
    typeof requestPropertise.body.lastName === "string" &&
      requestPropertise.body.lastName.trim().length > 0
      ? requestPropertise.body.lastName
      : false;
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

  let userObject = {
    firstName,
    lastName,
    password,
  };

  if (phone) {
    if (firstName || lastName || password) {
      let token =
        typeof requestPropertise.headerObject.token === "string"
          ? requestPropertise.headerObject.token
          : false;
      tokenHandle._token.verify(token, phone, (tokenId) => {
        if (tokenId) {
          data.read("users", phone, (error, u) => {
            const userData = { ...parseJSON(u) };
            if (!error && userData) {
              if (firstName) {
                userData.firstName = firstName;
              }
              if (lastName) {
                userData.lastName = lastName;
              }
              if (password) {
                userData.password = hash(password);
              }
              data.update("users", phone, userData, (err) => {
                if (!err) {
                  callback(200, {
                    message: "User Update successfully.",
                  });
                } else {
                  callback(500, {
                    error: "Server Side internal issue.",
                  });
                }
              });
            }
          });
        } else {
          callback(403, {
            error: "Authentication Failed.",
          });
        }
      });
    } else {
      callback(405, {
        message: "you have problem in your Request",
      });
    }
  } else {
    callback(404, {
      error: "User Not Found",
    });
  }
};
handlers._user.delete = (requestPropertise, callback) => {
  const phone =
    typeof requestPropertise.queryStringObject.phone === "string" &&
      requestPropertise.queryStringObject.phone.trim().length === 11
      ? requestPropertise.queryStringObject.phone
      : false;

  if (phone) {
    let token =
      typeof requestPropertise.headerObject.token === "string"
        ? requestPropertise.headerObject.token
        : false;
    tokenHandle._token.verify(token, phone, (tokenId) => {
      if (tokenId) {
        data.delete("users", phone, (err) => {
          if (!err) {
            callback(200, {
              message: "user Successfully deleted",
            });
          } else {
            callback(405, {
              error: err,
            });
          }
        });
      } else {
        callback(403, {
          error: "Authentication Failed.",
        });
      }
    });
  } else {
    callback(404, {
      error: "User Not Found",
    });
  }
};

module.exports = handlers;
