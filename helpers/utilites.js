/*
 * Title: Enviroment
 * Description: Application Routes
 * Author: Sahariar Kabir
 * Date: 03/19/2023
 *
 */

// module scafolding
const enviroment = require("./../helpers/enviroment");
const crypto = require("crypto");
const utilites = {};

utilites.parseJSON = (jsonString) => {
  let output;

  try {
    output = JSON.parse(jsonString);
  } catch (error) {
    output = {};
  }

  return output;
};
// hash String
utilites.hash = (string) => {
  if (typeof string === "string" && string.length > 0) {
    let hash = crypto
      .createHmac("sha256", enviroment.secretKey)
      .update(string)
      .digest("hex");
    return hash;
  } else {
    false;
  }
};

// Create Random String
utilites.createRandomString = (strLength) => {
  let length = strLength;
  length =
    typeof strLength === "number" && strLength > 0
      ? strLength
      : false;
  if (length) {
    let availableCharectar = "abcdefghijklmnopqrstuvwxyz1234567890";
    let output = "";

    for (let i = 0; i < length; i++) {
      let useCharectar = availableCharectar.charAt(
        Math.floor(Math.random() * availableCharectar.length)
      );
      output += useCharectar;
    }
    return output;
  } else {
    false;
  }
};

module.exports = utilites;
