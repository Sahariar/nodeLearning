/*
 * Title: Enviroment
 * Description: Application Routes
 * Author: Sahariar Kabir
 * Date: 03/16/2023
 *
 */

// module scafolding

const enviroment = {}

enviroment.staging = {
    port:5000,
    envName: 'staging',
    secretKey: "nadkhjasdjkhasdf",
    maxChecks: 5,
    twillo:{
        fromPhone: "+14752629950",
        accountSid:"",
        authToken:"",
    }
}
enviroment.production = {
    port:4000,
    envName: 'production',
    secretKey: "rqwiueryidflsakdfalskdhfasjdkhfa",
    maxChecks: 5,
    twillo:{
        fromPhone: "+14752629950",
        accountSid:"",
        authToken:"",
    }
}


// check the current enviroment
const currentEnviroment = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV : 'staging';

// exports corrsponding enviroment 
const enviromentToExport = typeof enviroment[currentEnviroment] === 'object' ? enviroment[currentEnviroment] : enviroment.staging;

module.exports = enviromentToExport;
