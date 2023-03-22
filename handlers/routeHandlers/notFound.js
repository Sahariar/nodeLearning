 // Not Found Js

const handlers = {}


handlers.notFoundHandelr = (requestPropertise , callback) => {
console.log(requestPropertise);

callback(404 ,{
    message:"Not found url in the site"
})

};


module.exports = handlers;