// Simple handers.js

const handlers = {}


handlers.simpleHandle = (requestPropertise , callback) => {
    console.log("RequestP",requestPropertise);
    callback(200, {
        message: 'This is a sample url',
    });


};


module.exports = handlers;