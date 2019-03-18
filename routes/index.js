var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');

var bodyParser = require("body-parser");
const fileUpload = require('express-fileupload'); // for file upload

const roomsPath = path.join(__dirname + '/../rooms/');

/*
    Initialize and populate array of roomsFileTracker
    Format: [
        "roomDayName.json":
        {
            "lastModified" : "dateTime",
            "date" : fileDate
        }
    ]
    Maintain this to avoid having to open a file on every check for update request
*/
let roomsFileTracker = [];
populateRoomsFileTracker();



/* GET home page. */
router.get('/', function(req, res, next) {
    // Read all contents of path
    fs.readdir(roomsPath, function(err, items) {
       if(err) { res.send("There was an error: " + err); } 
       else {
           // filter for folders only
           const filtered = items.filter(item => (fs.lstatSync(roomsPath+item)).isDirectory() );
           res.render('index', { rooms: filtered, layout: false } );
       }
    });
});


router.get('/admin', function(req, res, next) {
    // Read all contents of path
    fs.readdir(roomsPath, function(err, items) {
       if(err) { res.send("There was an error: " + err); } 
       else {
           // filter for folders only
           const filtered = items.filter(item => (fs.lstatSync(roomsPath+item)).isDirectory() );
           res.render('adminIndex', { rooms: filtered, layout: false } );
       }
    });
});

router.get('/admin/room/:name', function(req, res, next) {
    // Read all contents of path
    const roomName = req.params.name;
    console.log("Room Name: " + roomName);
    
    fs.readdir(roomsPath+"/"+roomName, function(err, items) {
       if(err) { res.send("There was an error: " + err); } 
       else {
           console.log(items);
           console.log("Length: " + items.length);
           let data = { "roomName": roomName, "dates": items, "layout": false };
           res.render('adminRoom',  data);
       }
    });
});


router.get('/admin/room/:name/:file', function(req, res, next) {
    // Read all contents of path
    const roomName = req.params.name;
    const fileName = req.params.file;
    const fullPath = roomsPath+"/"+roomName+"/"+fileName;
    
    console.log("Full Path: " + fullPath);
    fs.access(fullPath, fs.F_OK, err => {
        if(err) { res.send("Todays schedule has not been made"); return; } // file does not exist
        
        fs.readFile(fullPath, 'utf8', function read(err, data) {
            if (err) { res.send("Error reading file"); console.log(err); return; }
            
            data = JSON.parse(data);
            
            data = JSON.stringify(data);
            
            // Data has json file content, does it contain list of needed images to send links for?
            res.render('adminDate', { fileContent: data, roomName: roomName, fileName: fileName, layout: false } );
        });
    });
});

router.get('/room/:name', function(req, res, next) {
    // whenever a file request is made, check that tracker is up to date
    checkFileTrackerUpToDate();
    const roomName = req.params.name;
    const daySchedule = roomNameToDaySchedule(roomName);
    
    const fullPath = roomsPath + roomName + "/" + daySchedule; 
    
    fs.access(fullPath, fs.F_OK, err => {
        if(err) { res.send("Todays schedule has not been made"); return; } // file does not exist
        
        //res.send(fullPath + " exists!");
        fs.readFile(fullPath, 'utf8', function read(err, data) {
            if (err) { res.send("Todays schedule has not been made"); console.log(err); return; }
            
            data = JSON.parse(data);
            // check stuff here
            
            data = JSON.stringify(data);
            
            const date = new Date();
            const serverTime = date.getHours()+":"+date.getMinutes();
            

            
            // Data has json file content, does it contain list of needed images to send links for?
            res.render('room', { fileContent: data, serverTime: serverTime, layout: false } );
        });
    });
});

/*
    Given the room name, date of file, and last modified date of file
    Return:
    {
        valid: boolean (is up to date)
    }
*/
router.post('/isValid', function(req, res, next) {
    try {
        // Check that tracker is up to date
        if (!checkFileTrackerUpToDate()) { }
        const data = req.body;
        console.log("Data sent: %o", data);
        const fileName = roomNameToDaySchedule(data["roomname"]);
        
        const validData = roomsFileTracker[fileName];
        if(!validData) {res.send(false);}
        let valid = (data["lastModified"] === validData["lastModified"]);
        valid &= (data["fileDate"] === validData["fileDate"]);
        
        if(valid) {
            res.send(true);
        } else {
            res.send(false);
        }
    } catch (e) {
        res.send("Error: " + e);
    }
});

/* 
    Get a sample of the file tracker
    If the date of that sample was from a different day,
    Repopulate the file tracker to show only today's files 
*/ 
function checkFileTrackerUpToDate() {
    let sample = Object.keys(roomsFileTracker)[0];
    sample = roomsFileTracker[sample].date;
    
    let currentDate = getDate();
    if(currentDate !== sample) {
        populateRoomsFileTracker();
        return false;
    }
    return true;
}

// Get date in correct format
function getDate() {
    let date = new Date();
    let dateString = (date.getMonth()+1) + "."+date.getDate()+"."+date.getFullYear();
    return dateString;
}

/*
    (Re)populate the fileTracker array with all the most recent values
    When to call:
    - server time
*/
function populateRoomsFileTracker() {
    // Read all contents of path
    fs.readdir(roomsPath, function(err, items) {
        if(err) {  } 
        else {
            // filter for folders only
            const filtered = items.filter(item => (fs.lstatSync(roomsPath+item)).isDirectory() );
            
            // Empty the file tracker
            roomsFileTracker = {};
    
            filtered.forEach(function(room) {
                
                // Update the file tracker for each room
                let daySchedule = roomNameToDaySchedule(room);
                let fullPath = roomsPath + room + "/" + daySchedule;
                fs.readFile(fullPath, 'utf8', function read(err, data) {
                    if (err) { }// Does not exist 
                    else {
                        data = JSON.parse(data);
                        // check stuff here
                        updateRoomsFileTracker(daySchedule, data["last-modified"], data["date"]);
                    }
                });
            });
        }
    });
}

/* 
    Convert room name to file name of the rooms day schedule
    If date is supplied (String) it uses that, otherwise it grabs
    the current date.
    Ex: if current server date is 3.15.2019 (M.DD.YYYY)
    "blue room" -> blue_room_3.15.2019.json 
*/
function roomNameToDaySchedule(roomName, date=null) {
    // Replace any spaces with underscores, and add one underscore to the end
    let daySchedule = roomName.replace(" ","_")+"_";
    
    // Get date string
    //let dateString = getDate();
    if(!date) { date = getDate(); }
    
    // Append the date string and json extension
    daySchedule += date+".json";
    
    return daySchedule;
}

function updateRoomsFileTracker(dayScheduleFile, lastModified, fileDate) {
    let updated = {
      "lastModified":lastModified,
      "fileDate":fileDate
    };
    roomsFileTracker[dayScheduleFile] = updated;
}


router.post('/createRoom', function(req, res, next) {
    // Get room name and replace spaces with underscores
    
    createDir(req.body.roomname, function (success) {
        if (success) { res.send("Room Uploaded!"); } 
        else { res.send("There was an error: room might already exist"); }
    });
});

// Creates the base template JSON in the folder of the corresponding room
router.post('/createDate', function(req, res, next) {
    console.log("Uploading Date");
  // Get room name
  let name = req.body.roomName;
  // Get date and replace spaces with underscores
  let date = req.body.date.toString();
  // Replaces dashes with periods
  date = date.replace(/\-/g, ".");
  // Convert date to Date object
  date = new Date(date);
  // Formatting date (Convert to string)
  date = (date.getMonth() + 1) + "." + date.getDate() + "." + date.getFullYear();
  
  
  // Create date list
  let dateJsonList = JSON.stringify({
    roomName: name,
    update: true,
    date: date,
    lastModified: new Date(), //stringifying date converts it to string
    slides: []
  });
  
  console.log("%o", dateJsonList);
  
  let dateName = roomNameToDaySchedule(name, date);
  
  fs.writeFile(roomsPath +name+"/"+dateName, dateJsonList, function (err) {
    if (err) { res.send("Date Not Created"); } 
    else { res.send("Date Created"); }
  });
});

router.post('/uploadFullscreen', function(req, res, next) {
    try {
    let slideList = {};
    let contentList = {};
    
    let name = req.body.slidename;
    let orderNum = req.body.ordernum;
    
    let imgFileName = req.body.imageName;
    let filePath =  path.join(__dirname,"../public/images/",imgFileName);
    let logoFile = req.files.logo;
    
    slideList = {
        type : "fullscreen",
        order : orderNum,
        slideName : name
    };
    
    contentList = {
        img : filePath
    };
    
    slideList.content = contentList;
    
    // Transfer file to location
    logoFile.mv(filePath, function (err) {
        if (err) { res.send("Error:"+err);}
        
        // JSON version of slideList
        // let jsonList = JSON.stringify(slideList);
        
        // rooms path
        let roomDate = req.body.fileName;
        let roomName = req.body.roomName;
        let fullPath = roomsPath + "/" + roomName + "/" + roomDate;
        
        console.log("Fullpath: "+fullPath);
        fs.access(fullPath, fs.F_OK, err => {
            if(err) { res.send("File does not exist"); return; } // file does not exist
            
            //res.send(fullPath + " exists!");
            fs.readFile(fullPath, 'utf8', function read(err, data) {
                if (err) { res.send("Error"); console.log(err); return; }
                
                data = JSON.parse(data);
                data.slides.push(slideList);
                
                data = JSON.stringify(data);
                
                fs.writeFile(fullPath, data, function (err) {
                    if (err) {
                        res.send("Failed");
                        return;
                    } else {
                        res.send("FullScreen Slide Uploaded!");
                        return;
                    }
                });
            });
        });

    });
    
    } catch (e) {
        console.log(e);
        res.send("fail");
    }
});

//for uploading a new slide schedule
router.post('/uploadSchedule', function(req, res, next) {
    console.log("In upload schedule");
    // NEED TO HAVE ROOM NAME AND/OR the ROOM DATE    
    try {
          const typeKey = "type";
          const slideType = "schedule";
          const orderKey = "order"
          const tableKey = "table";
          const contentKey = "content";
          const slideKey = "slideName";
          const bgKey = "bgcolor";
          const logoKey = "logo";
          const orientationKey = "orientation";
          const nameKey = "slideName";
          
          let slideList = {};
          let slideContent = {};
          let slideName = req.body.slidename;
          let bgcolor = req.body.bgcolor;
          let orderNum = req.body.ordernum;
          let orientation = req.body.orientation;
        
          // Check if table contains multiple rows
          let multipleRows = Array.isArray(req.body.startTime);
          let rowCount = req.body.startTime.length;
          
          // Create array to hold rows
          let rowList = [];
          let tableList = {};
        
          // Only iterate through table if multiple rows
          if (multipleRows) {
            for (let i = 0; i < rowCount; i++) {
              // An array holding the information of the slides
              tableList = {
                startTime: req.body.startTime[i],
                endTime: req.body.endTime[i],
                sessionType: req.body.sessionType[i],
                description: req.body["description"][i], // description is a keyword
                speaker: req.body.speaker[i]
        
              };
        
              rowList.push(tableList);
        
            }
          } else {
            tableList = {
              startTime: req.body.startTime,
              endTime: req.body.endTime,
              sessionType: req.body.sessionType,
              description: req.body["description"],
              speaker: req.body.speaker
        
            };
        
            rowList.push(tableList);
        
          }
        
          //Construct the slide list
          slideContent[slideKey] = slideName;
          slideContent[bgKey] = bgcolor;
          slideContent[tableKey] = rowList;
          
        
          // CREATE ORDER
          // ------------
        
          // Get orientation
          // ------------
        
          // LOGO UPLOAD
        
        
          let fileName = req.body.imageName;
          
          // Use the mv() method to place the file somewhere on your server
          let filePath = '../public/images/' + fileName;
          
        
          let logoFile = req.files.logo;
        
        
          // Transfer file to location
          logoFile.mv(filePath, function (err) {
            if (err) { return res.status(500).send(err); }
        
            //Continued consturct slide list
            slideContent[logoKey] = filePath;
            slideList["type"] = "schedule";
            slideList["order"] = orderNum;
            slideList[nameKey] = slideName;
            slideList[orientationKey] = orientation;
            slideList[contentKey] = slideContent;
        
        
            // JSON version of slideList
            let jsonList = JSON.stringify(slideList);
            console.log("[uploading] json list : " + jsonList);
            
            
            // rooms path
            let roomDate = req.body.fileName;
            let roomName = req.body.fileName;
            let fullPath = roomsPath + "/" + roomName + "/" + roomDate;
            
            // Open the file
            // Store file data in var
            // Update variable
            // Rewrite the file
            
            
            
            fs.access(fullPath, fs.F_OK, err => {
                if(err) { res.send("File does not exist"); return; } // file does not exist
                
                //res.send(fullPath + " exists!");
                fs.readFile(fullPath, 'utf8', function read(err, data) {
                    if (err) { res.send("Error"); console.log(err); return; }
                    
                    data = JSON.parse(data);
                    
                    data.slides.push(jsonList);
                    
                    fs.writeFile(fullPath, data, function (err) {
                      if (err) {
                          res.send("Failed");
                        
                      } else {
                        res.send("Schedule Uploaded!");
                      }
                
                    });
                    
                });
            });
          });
    } catch (e) {
        console.log(e);
        res.send("Error: " + e);
    }
});

router.get('/createFullscreen/:roomName/:fileName', function(req, res, next) { 
    const roomName = req.params.roomName;
    const fileName = req.params.fileName;
    const data = {"room":roomName,"file":fileName};
    res.render('createFullscreen', data); 
});

router.get('/createVideo/:roomName/:fileName', function(req, res, next) {
    const roomName = req.params.roomName;
    const fileName = req.params.fileName;
    const data = {"room":roomName,"file":fileName};
    res.render('createVideo', data); 
});

router.get('/createCover/:roomName/:fileName', function(req, res, next) {
    const roomName = req.params.roomName;
    const fileName = req.params.fileName;
    const data = {"room":roomName,"file":fileName};
    res.render('createCover', data);
});

router.get('/createDate/:roomName',  function(req, res, next) {
    const roomName = req.params.roomName;
    const data = {"room":roomName};
    res.render('createDate', data);
});

router.get('/createSchedule/:roomName/:fileName', function(req, res, next) {
    const roomName = req.params.roomName;
    const fileName = req.params.fileName;
    const data = {"room":roomName,"file":fileName};
    res.render('createSchedule', data);
});

router.get('/createRoom/',  function(req, res, next) {
    res.render('createRoom');
});


// Creates a folder for a given room
function createDir(name, callback) {
    let dir = roomsPath + name;
    // Only create a directory if it doesn't already exist
    if (!fs.existsSync(dir)) {
        fs.mkdir(dir, function (err) {
            if (err) { console.log(err); callback(false); }
            callback(true); 
        });
    } else { callback(false); }
}

module.exports = router;
