/*
    Creates an array of slide html elements in order
*/
function createSlideShow(slides) {
    let slideshow = [];
    
    slides.forEach(function(slide) {
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
    let htmlString = '<div class="slide" style="background-color:#'+slide.content.bgcolor+';">';
    
    // Create Table and Headers
    htmlString += '<table class="table table-striped table-bordered"><thead><tr><th scope="col">Start Time</th><th scope="col">End Time</th>'+
                '<th scope="col">Session Type</th><th scope="col">Description</th><th scope="col">Speaker</th>'+
                '</tr></thead>';
    
    // Create Rows (Need to add logic)
    htmlString += '<tbody>';
    for(let i = 0; i < table.length; i++) {
        let row = table[i];
        htmlString +=   ''+  
        '<tr>'+
          '<td>'+row["start-time"]+'</td>'+
          '<td>'+row["end-time"]+'</td>'+
          '<td>'+row["session-type"]+'</td>'+
          '<td>'+row["description"]+'</td>'+
          '<td>'+row["speaker"]+'</td>'+
        '</tr>';
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