/*
    Creates an array of slide where the content has been converted to html elements
*/
function createSlideShow(room, serverTime) {
    let slideshow = [];
    
    room.slides.forEach(function(slide) {
        let temp = slide;
        temp.content = createSlide(slide);
        slideshow.push(temp);
    });
    return slideshow;
}

/*
    Creates a slide as an html element
*/
function createSlide(slideJson) {
    switch (slideJson.type) {
        case 'cover':
            return createCoverSlide(slideJson);
        case 'schedule':
            return createScheduleSlide(slideJson);
        case 'video':
            return createVideoSlide(slideJson);
        case 'donors':
            return createDonorsSlide(slideJson);
        case 'fullscreen':
            return createFullscreenSlide(slideJson);
        default:
            return $('<h2>Unknown Slide Type<h2>');
    }
}


function createCoverSlide(slide) {
    let $div = $(
        '<div class="slide" style="background-color:#'+slide.content.bgcolor+';">'+
        '<p><img style="display: block; margin-left: auto; margin-right: auto;" src="'+slide.content["header-logo"]+'" alt=""/></p>'+
        '<h1 style="text-align: center;">'+slide.content.title+'</h1>'+
        '<h3 style="text-align: center;">'+slide.content.subtitle+'</h3>'+
        '<p><img style="display: block; margin-left: auto; margin-right: auto;" src="'+slide.content["footer-logo"]+'" alt=""/></p></div>'
        );
    return $div;
}

function createFullscreenSlide(slide) {
    let img = slide.content.img;
    img = img.substring(img.indexOf("/images/"));
    let $div = $( '<div class="fullscreen-slide"><img class="fullscreen-image" src="'+img+'"/></div>' );
    return $div;
}

function createScheduleSlide(slide) {
    /*
        {
      "type": "schedule",
      "order": 2,
      "orientation": "landscape",
      "content": {
        "slide-name": "name text",
        "bgcolor": "hex value",
        "logo": "img url",
        "date": "date text",
        "table": [
          {
            "start-time": "text",
            "end-time": "text",
            "session-type": "text",
            "description": "text",
            "speaker": "text"
          }
        ]
      }
    },
    */
    let table = slide.content.table;
    let htmlString = '<div class="slide table-slide" style="background-color:'+slide.content.bgcolor+'">';
    
    let img = slide.content.logo;
    img = img.substring(img.indexOf("/images/"));
    
    htmlString += '<div style="font-size: 60px; vertical-align: middle">'+slide["slideName"]+'<img class="table-logo" style="float: right; margin: 10px" src="'+img+'" width="400" height="200"/></div><br>';
    
    // Create Table and Headers
    htmlString += '<table class="table table-striped schedule-table" style="font-size: 20px">'+
                  '<thead class="thead-dark"><tr>'+
                      '<th class="th-s" scope="col">Start Time</th>'+
                      '<th class="th-s" scope="col">End Time</th>'+
                      '<th class="th-s" scope="col">Session Type</th>'+
                      '<th class="th-l" scope="col">Description</th>'+
                      '<th class="th-m" scope="col">Speaker</th>'+
                  '</tr></thead>';
    
    if(Array.isArray(table)) {
        // Create Rows (Need to add logic)
        htmlString += '<tbody>';
        for(let i = 0; i < table.length; i++) {
            if(typeof table[i]["startTime"] !== 'undefined') {
                let row = table[i];
                htmlString +=   ''+  
                '<tr>'+
                  '<td>'+row["startTime"]+'</td>'+
                  '<td>'+row["endTime"]+'</td>'+
                  '<td>'+row["sessionType"]+'</td>'+
                  '<td>'+row["description"]+'</td>'+
                  '<td>'+row["speaker"]+'</td>'+
                '</tr>';
            }
        }
    }
    // Close Table and div
    htmlString += '</tbody></table></div>';
    return $(htmlString);
    }

function createVideoSlide(slide) {
    
    // Convert normal youtube url to embed link
    let src = slide.content.link;
    src = src.replace("watch?v=","embed/");
    
    let $div = $(
        '<div class="slide" style="background-color:#'+slide.content.bgcolor+';"><div class="center">'+
        '<h1>'+slide.content.title+'</h1>'+
        '<iframe width="560" height="315" src="'+src+'?autoplay=1&mute=1&controls=0" frameborder="0" picture-in-picture"></iframe>'+
        '<h3>'+slide.content["description"]+'</h3>'+
        '</div></div>'
        );
    return $div;
}


function createDonorsSlide(slide) {
        let donors = slide.content.donors;
        let htmlString = '<div class="slide" style="background-color:#'+slide.content.bgcolor+';"><div class="donors">';
        for(let i = 0; i < donors.length; i++) {
            let donor = donors[i];
            htmlString += '<span class="donor"><img src="'+donor.img+'" alt="Img Not Found"></img>'+
            '<h2>'+donor.name+'</h2><h4>'+donor.description+'</h4></span>';
        }
        htmlString += '</div></div>';
        return $(htmlString);
}