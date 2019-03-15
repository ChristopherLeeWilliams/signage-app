var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
const roomsPath = path.join(__dirname + '/../rooms/');


/* GET home page. */
router.get('/', function(req, res, next) {
    const roomsPath = path.join(__dirname + '/../rooms/');
    
    fs.readdir(roomsPath, function(error, items) {
        if(error) {
            console.log("Error: "+error);
            res.send("Error");
        } else {
            let filtered = [];
            items.forEach(function(item) {
               let index = item.indexOf(".json");
               if(index !== -1) { filtered.push(item.substring(0, index)); }
            });
            res.render('index', { rooms: filtered, layout: false } );
        }
    });
});

router.get('/room/:name', function(req, res, next) {
    const roomsPath = path.join(__dirname + '/../rooms/');
    const roomName = req.params.name;
    const fullPath = roomsPath + roomName + ".json";
    
    fs.access(fullPath, fs.F_OK, err => {
        if(err) { res.send(fullPath + " does not exist!"); return; } // file does not exist
        
        //res.send(fullPath + " exists!");
        fs.readFile(fullPath, 'utf8', function read(err, data) {
            if (err) { res.send("There was an error reading the file"); console.log(err); return; }
            
            data = JSON.parse(data);
            // check stuff here
            
            data = JSON.stringify(data);
            
            // Data has json file content, does it contain list of needed images to send links for?
            res.render('room', { fileContent: data, layout: false } );
        });
    });
});

router.post('/upload', function(req, res, next) {
    // An array holding the information of the slides
    let tableList = {
            time : req.body.time,
            type : req.body.type,
            subject : req.body.description,
            speaker : req.body.speaker
          
        };

    var slideName = req.body.slidename;
    var slideList = {};
    slideList[slideName] = tableList;

    // JSON version of slideList
    var jsonList = objToJson(slideList);

    storeAsJson(jsonList, function(success){
      if(success){
        res.send("Slide Uploaded!");
      }else{
        res.send("Failed");
      }

    });
});

// Add a slide to the JSON list of slides
function addSlide(key,val){
    var data = readJson();
    data.key = val;
    storeAsJson(data);
}

// Converts Array to JSON
function objToJson(arr) { return JSON.stringify(arr); }

// Converts JSON to Array
function jsonToArray(jsonStr) { return Array.from(jsonStr); }

// Store JSON
function storeAsJson(arr, callback){
    fs.writeFile(roomsPath+"text.json", arr , function(err) {
    if(err) { console.log(err); return; }
    callback(true);
    });
}

// Read JSON RENAME TO READROOM OR READ JSON
function readJson(){
    var data = fs.readFileSync(roomsPath+"text.json", function read(err,data) {
        if(err) { console.log(err); return; }
    });
    return JSON.parse(data);
}


module.exports = router;
