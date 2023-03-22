/*
 * Title: Server File
 * Description: serverlication Routes
 * Author: Sahariar Kabir
 * Date: 03/16/2023
 *
 */
const http = require('http');
const {handleReqRes} = require('../helpers/handleReqRes')
const enviroment = require('../helpers/enviroment')

// server Object use
const server = {};

// configuration
server.config = {
    port: 3000,
};


// create server
server.createServer = () => {
    const createServerVariable = http.createServer(server.handleRequest);
    createServerVariable.listen(enviroment.port , () =>{
        console.log(`listen to port at ${enviroment.port}`);
    });
} 

// handle Request 

server.handleRequest = handleReqRes;

server.init = () => {
// Start server
server.createServer();
}

module.exports = server;


