/*
 * Title: Uptime Project
 * Description: Application Routes
 * Author: Sahariar Kabir
 * Date: 03/16/2023
 *
 */
const server = require('./lib/server')
const worker = require('./lib/worker')

// app Object use
const app = {};

app.init = () =>{
    server.init()
    worker.init()
}

app.init();

module.exports = app;