// This is routes of all files.

// Dependancy 

const {simpleHandle} = require('./handlers/routeHandlers/simpleHandlers');
const {tokenHandle } = require('./handlers/routeHandlers/tokenAuth');
const {userHandle} = require('./handlers/routeHandlers/userHandler');
const {checkHandle} = require('./handlers/routeHandlers/checkHandle');

const routes = {
    simple:simpleHandle,
    user: userHandle,
    token:tokenHandle,
    check:checkHandle
}

module.exports = routes;