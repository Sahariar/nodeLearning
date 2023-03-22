// File Name : Handle Req and Res
// Dependency : 
const url = require('url');
const {StringDecoder} = require('string_decoder');
const routes = require('../routes');
const {notFoundHandelr} = require('./../handlers/routeHandlers/notFound');
const {parseJSON} = require('./../helpers/utilites');

// Module Scaffolding
const hanlder = {};

hanlder.handleReqRes = (req, res) => {

    const parseUrl = url.parse(req.url , true);
    const path = parseUrl.pathname;
    const trimedPath = path.replace(/^\/+|\/+$/g, '');
    const method = req.method.toLowerCase();
    const queryStringObject = parseUrl.query;
    const headerObject = req.headers

    const decoder = new StringDecoder('utf-8');
    let realData = "";

    const requestPropertise = {
        parseUrl,
        path,
        trimedPath,
        method,
        queryStringObject,
        headerObject
    }
    const chosenHandler = routes[trimedPath] ? routes[trimedPath] : notFoundHandelr;

    req.on('data' , (buffer) => {
        realData += decoder.write(buffer);
    })
    req.on('end' , () => {
        realData += decoder.end();

        requestPropertise.body = parseJSON(realData);

        chosenHandler(requestPropertise , (statuscode , payload)=> {
            statuscode = typeof(statuscode) === 'number' ? statuscode :  500;
            payload = typeof(payload) === 'object' ? payload : {};
    
           const payloadString = JSON.stringify(payload);
    
            //return the result
            res.setHeader('Content-Type' , 'application/json');
            res.writeHead(statuscode);
            res.end(payloadString);
        })
    }) 
}



module.exports = hanlder;