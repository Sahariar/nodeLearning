/*
 * Title: Data
 * Description: Application Routes
 * Author: Sahariar Kabir
 * Date: 03/16/2023
 *
 */

// dependancy
const fs = require("fs");
const path = require("path");

const lib = {};
// base dirtory of data folder
lib.basedir = path.join(__dirname, "../.data/");

lib.create = function (dir, file, data, callback) {
  // open file for writing
  fs.open(
    `${lib.basedir + dir}/${file}.json`,
    "wx",
    function (err, fileDescriptor) {
      if (!err && fileDescriptor) {
        //Convert data to string
        const stringData = JSON.stringify(data);
        // write data to file and close;
        fs.writeFile(fileDescriptor, stringData, (err2) => {
          if (!err2) {
            fs.close(fileDescriptor, (err3) => {
              if (!err3) {
                callback(false);
              } else {
                callback("error closing the new file");
              }
            });
          } else {
            callback("error writing to new file");
          }
        });
      } else {
        callback("Could not Create new file, it may already exists!", err);
      }
    }
  );
};

// Read data form file

lib.read = (dir, file, callback) => {
  fs.readFile(`${lib.basedir + dir}/${file}.json`, "utf8", (err4, data) => {
    callback(err4, data);
  });
};

// update data from file
lib.update = (dir, file, data, callback) => {
  fs.open(
    `${lib.basedir + dir}/${file}.json`,
    "r+",
    (errRead, fileDescriptor) => {
      if (!errRead && fileDescriptor) {
        const stringData = JSON.stringify(data);
        fs.ftruncate(fileDescriptor, (errTruncate) => {
          if (!errTruncate) {
            // write data to file and close;
            fs.writeFile(fileDescriptor, stringData, (err2) => {
              if (!err2) {
                fs.close(fileDescriptor, (err3) => {
                  if (!err3) {
                    callback(false);
                  } else {
                    callback("error closing the new file");
                  }
                });
              } else {
                callback("error writing to new file");
              }
            });
          } else {
            callback("err truncating");
          }
        });
      } else {
        console.log("error Updating. File may no exits");
      }
    }
  );
};

lib.delete = (dir, file, callback) => {
    // unlink file
    fs.unlink(`${lib.basedir + dir}/${file}.json`, (err) =>{
        if(!err) {
            callback(false);
        }else{
            callback('error deleting file', err);
        }
    })
}
// list all item in the directory

lib.list = (dir , callback) => {
  fs.readdir(`${lib.basedir + dir}/`, (err, fileNames) =>{
    if(!err && fileNames && fileNames.length > 0 ){
      let trimmedFileNames = []
      fileNames.forEach((fileNames => {
        trimmedFileNames.push(fileNames.replace('.json' , ''));
      }))
      callback(false , trimmedFileNames);
    }else{
      callback(404,{
        message: "No File Found"
      })
    }
  })
}

module.exports = lib;
