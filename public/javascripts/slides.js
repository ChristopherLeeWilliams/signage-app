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
    return $("<h2> Schedule Slide Not finished <h2>");
}

function createVideoSlide(slide) {
    let $div = $(
        '<div class="slide">'+
        '<div class="force-center"><iframe width="560" height="315" src="https://www.youtube.com/embed/EHs7hBypdNU?autoplay=1&mute=1&controls=0" frameborder="0" picture-in-picture"></iframe></div>'+
        '</div>'
        );
    return $div;
}


function createDonorsSlide(slide) {
    return $("<h2> Donors Slide Not finished <h2>");
}