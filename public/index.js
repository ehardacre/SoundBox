
/**
  Prompts the user and adds a new event to the database
*/
function addEvent(){
  if (window.admin){
    var firebaseRef = firebase.database().ref();
    window.ref = firebaseRef;
    window.ref.once('value').then(function(snapshot){
      //collect all of the events
      events = snapshot.val()['events'];
      var counter = snapshot.val()['counter'];
      console.log("counter: " + counter);

      document.getElementById('reservePage');

      var buttons = document.getElementsByClassName('btn-group')[0].getElementsByTagName("button");
      var selectedButtons = [];
      for(el in buttons){
        if(buttons[el].classList != undefined){
          if(buttons[el].classList.contains("selected")){
          
           selectedButtons.push(buttons[el].id);
          }
        }
      }

      // parse date range
      var range = $('#dateRange').val();

      // this splits the input of the date range into 3 elements, the middle element at index 1 is just a dash --> "-"
      var dateList = range.split(" ");

      var beginning = new Date(dateList[0]);
      var ending = new Date(dateList[2]);

      while(beginning <= ending){
        var curDate = beginning.yyyymmdd();
        // errors with date format, check built in methods for Date type to see if we can reformat it
        // var curDate = beginning.toString().split("/");

        var formattedDate = curDate[0] + "-" + curDate[1] + "-" + curDate[2];
        console.log("start: " + formattedDate);
        // now convert start time to 24hr and append it to the end of start
        var sTime = convertTo24($('#timeStart').val());
        var finalStartTime = formattedDate + sTime;

        var endTime = convertTo24($('#timeEnd').val());
        finalEndTime = formattedDate + endTime;

        if(sTime == "error" || endTime == "error"){
          alert("Error in time format");
          break;
        }

        console.log(selectedButtons);

        for(resource in selectedButtons){
          if(selectedButtons[resource]!=undefined){
              var event = {
              end: finalEndTime,
              id: counter,
              resourceId: selectedButtons[resource],
              start: finalStartTime,
              textColor: "#000000",
              title: "Click to Reserve"
              }
            console.log(event);
            counter = counter + 1;
            events.push(event);
            }
        }
        var newDate = beginning.setDate(beginning.getDate() + 1);
        beginning = new Date(newDate);
          

      }
      window.ref.child("events").set(events);
      window.ref.child("counter").set(counter);
      setCalendar();

    });

  }
}

Date.prototype.yyyymmdd = function() {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();

  return [this.getFullYear(),
          (mm>9 ? '' : '0') + mm,
          (dd>9 ? '' : '0') + dd
         ];
};


function convertTo24(time){
  var time = time.toLowerCase();

  if(time.includes("am")){
      var timeNumber = time.split("a")[0].trim().split(":");

      var hour = parseInt(timeNumber[0]);
      var min = timeNumber[1];

      if(hour == 12){
        hour = 0;
        finalTime = hour.toString();
      }
      else if(hour < 10){
        finalTime = "0" + hour.toString();
      }

      finalTime = "T" + finalTime + ":" + min + ":00";
      return finalTime;
  }
  else if(time.includes("pm")){
      var timeNumber = time.split("p")[0].trim()
      var hour = parseInt(timeNumber[0]);
      var min = timeNumber[1];

      if(hour != 12){
        hour = hour + 12;
      }

      finalTime = "T" + hour.toString() + ":" + min + ":00";
      return finalTime;
  }
  else{
    return "error";
  }
}
/**
  Handles the user clicking on an event
*/
function eventClicked(e){
  //if the event is a reserved event then the user is admin
  if (e.title.includes('RESERVED')){
    //ALLOW ADMIN TO REMOVE RESERVATION and send confirmation email ****
    //get the firebase reference
    var firebaseRef = firebase.database().ref();
    window.ref = firebaseRef;
    window.ref.once('value').then(function(snapshot){
      //a snapshot of the reservations section of the database
      reservations = snapshot.val()['reservations'];
      //read through the reservations and find the reservation for the event clicked
      for (r in reservations){
        if (reservations[r]['id'] == e.id){
          //gather all information about the reservation
          var name = reservations[r]['name'];
          var school = reservations[r]['school'];
          var email = reservations[r]['email'];
          var str = `${name} from ${school} reserved this time slot and can be reached at ${email}`;
          //present the user with reservation data
          setCalendar();
          window.alert(str);

        }
      }
    });
  //if the event is not reserved
  }else{
    //if the user is admin then allow them the opportunity to remove the event
    if (window.admin){
      //prompts the user
      if (confirm("Delete this open reservation time?")){
        //if confirms remove the event from firebase
        var firebaseRef = firebase.database().ref();
        window.ref = firebaseRef;
        window.ref.once('value').then(function(snapshot){
          events = snapshot.val()['events'];
          var newEvents = [];
          for (n in events){
            if (!(events[n]['id'] == e.id)){
              newEvents.push(events[n]);
            }
          }
          window.ref.child('events').set(newEvents);
          //reset the calendar
          setCalendar();
          window.alert("Event removed.");
        });
      }
    //if the user is not an admin allow them to reserve the spot
    }else{
      //collect all the info and stop if cancelled
      var name = window.prompt("Please enter your name:","");
      if (!name == ""){
        var email = window.prompt("Please enter your email:","");
        if (!email == ""){
          var school = window.prompt("What school do you go to?","");
          if (!school == ""){
            //update the firebase
            var firebaseRef = firebase.database().ref();
            window.ref = firebaseRef;
            window.ref.once('value').then(function(snapshot){
              //update reservations
              reservations = snapshot.val()['reservations'];
              r = {
                name: name,
                school: school,
                email: email,
                id: e.id
              };
              reservations.push(r)
              window.ref.child('reservations').set(reservations);
              //update the events
              events = snapshot.val()['events'];
              for (n in events){
                if(events[n]['id'] == e.id){
                  events[n]['title'] = "RESERVED: Click to view";
                }
              }
              window.ref.child('events').set(events);
            });
            //update the calendar
            setCalendar();
            window.alert("Your reservation has been logged. If you have any questions please email eli.cohen@pomona.edu");
          }
        }
      }
    }
  }
}

/**
  Sets the calendar to whatever data is held in firebase
*/
function setCalendar(){
  //collect firebase data
  var firebaseRef = firebase.database().ref();
  window.ref = firebaseRef;
  window.ref.once('value').then(function(snapshot){
    //collect all of the events
    events = snapshot.val()['events'];
    //just slots that can be reserved
    open = [];
    //all time slots (reserved and not)
    all = [];
    //determine which events are visible to all users vs. only admin
    for (e in events){
      var full = events[e];
      if (!full['title'].includes('RESERVED')){
        open.push(full);
      }
      all.push(full);
    }
    //reset full calendar with new events from firebase
    $("#calendar").fullCalendar('destroy');
    if (window.admin) {
      $("#calendar").fullCalendar({
        schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source',
        defaultView: "agendaDay",
        defaultDate: $('#calendar').fullCalendar('today'),
        allDaySlot: false,
        height: 550,
        header: {
          left: "title",
          center: "none",
          right: "prev,next today"
        },
        views: {
          agendaTwoDay: {
            type: "vertical resource"
          }
        },
        minTime: "09:00:00",
        maxTime: "22:00:00",
        resources: [
          { id: "a", title: "Toolbox", eventColor: "#f9edde" },
          { id: "b", title: "Soundbox", eventColor: "#f9edde" },
          { id: "c", title: "Print Lab", eventColor: "#f9edde" }
        ],
        events: all,
        eventClick: function(event, element) {
          eventClicked(event);
        }
      });
    }else{
      $("#calendar").fullCalendar({
        schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source',
        defaultView: "agendaDay",
        defaultDate: $('#calendar').fullCalendar('today'),
        allDaySlot: false,
        height: 550,
        header: {
          left: "title",
          center: "none",
          right: "prev,next today"
        },
        views: {
          agendaTwoDay: {
            type: "vertical resource"
          }
        },
        minTime: "09:00:00",
        maxTime: "22:00:00",
        resources: [
          { id: "a", title: "Toolbox", eventColor: "#f9edde" },
          { id: "b", title: "Soundbox", eventColor: "#f9edde" },
          { id: "c", title: "Print Lab", eventColor: "#f9edde" }
        ],
        events: open,
        eventClick: function(event, element) {
          eventClicked(event);
        }
      });
    }
  });
}

/**
 Changes the button that is selected in the sidenav
*/
function changeSender(sender){
  resetNav();
  sender.style.color = "#f1f1f1";
}

//on document start set calendar
$(function() {
  // document ready
  setCalendar();

  var pages = document.getElementsByClassName('page');
  var prevPage = 0
  var pageOn = 0
  document.getElementById('main').onscroll = function(event){
    var scroll = document.getElementById('main').scrollTop;
    for (var i = 0; i < pages.length; i++){
      if (scroll > pages[i].offsetTop - 50){
        pageOn = i;
      }
    }
    if(pageOn != prevPage){
      prevPage = pageOn;
      var button = document.getElementsByClassName('sidenav-button')[pageOn];
      changeSender(button);
    }
  };
});

/**
  Resets all navbar buttons so that the color can change on click
*/
function resetNav(){
  var navbar = document.getElementsByClassName('sidenav')[0];
  var buttons = navbar.getElementsByTagName('button');
  for (var i = 0; i < buttons.length; i++){
    buttons[i].style.color = "#818181";
  }
}

/**
  scrolls to the givin page
*/
function scrollToPage(page){
  var topScroll = page.offsetTop;
  var main = document.getElementById('main');
  main.scrollTo({
    top: topScroll - 50,
    behavior: "smooth"
  })
}

/**
  These functions handle the events for onclick by each sidenav button
*/
function toHome(){
  changeSender(document.getElementById('homeButton'));
  scrollToPage(document.getElementById('homePage'));
}
function toReserve(){
  changeSender(document.getElementById('reserveButton'));
  scrollToPage(document.getElementById('reservePage'));
}
function toPortfolio(){
  changeSender(document.getElementById('portfolioButton'));
  scrollToPage(document.getElementById('portfolioPage'));
}
function toTutorials(){
  changeSender(document.getElementById('tutorialButton'));
  scrollToPage(document.getElementById('tutorialsPage'));
}

var slideIndex = 1;
showSlides(slideIndex);

// Next/previous controls
function plusSlides(n) {
  showSlides(slideIndex += n);
}

// Thumbnail image controls
function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  var i;
  var slides = document.getElementsByClassName("mySlides");
  var dots = document.getElementsByClassName("dot");
  if (n > slides.length) {slideIndex = 1}
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
      dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex-1].style.display = "block";
  dots[slideIndex-1].className += " active";
}

//runs on doc start
//not admin
window.admin = false;
//check admin password based on firebase password
var input = document.getElementById('pass');
input.onkeypress = function(event){
  var firebaseRef = firebase.database().ref();
  window.ref = firebaseRef;
  //if user presses Return in the textfield
  if (event.which == 13){
    window.ref.once('value').then(function(snapshot){
      var password = snapshot.val()['admin-password'];
      //check if the password is correct
      if (input.value == password){
        window.alert("You are logged in as an admin.");
        window.admin = true;
        document.getElementById('addEvent').style.opacity = "1.0";
        input.blur();
        input.placeholder = "Log out";
        setCalendar();
        $('#adminForm').show();
      }else{
        window.alert("wrong admin password");
        window.admin = false;
      }
      input.value = "";
    });
  }
};


//change the input button to logout if admin is logged in
input.onfocus = function(){
  if (window.admin) {
    input.blur();
    document.getElementById('addEvent').style.opacity = "0.0";
    input.placeholder = "Admin Login"
    window.admin = false;
    setCalendar();
    $('#adminForm').hide();
  }
}

//sets the initial page to home
toHome();

// //dummy events to load into firebase
//  e = [
// {
//   end: "2018-08-16T16:00:00",
//   id: "1",
//   resourceId: "b",
//   start: "2018-08-16T14:00:00",
//   textColor: "#000000",
//   title: "RESERVED: Click to view"
// },
// {
//   end: "2018-08-16T16:00:00",
//   id: "2",
//   resourceId: "a",
//   start: "2018-08-16T14:00:00",
//   textColor: "#000000",
//   title: "Click to Reserve"
// }];

// // //dummy reservations to load into firebase
//  r = [
//   {
//     name: "Ethan Hardacre",
//     email: "hardacre.ethan@gmail.com",
//     school: "Pomona",
//     id: "1"
//   }
//  ];

// //load dummy data into firebase
// var firebaseRef = firebase.database().ref();
// window.ref = firebaseRef;
// window.ref.child('events').set(e);
// window.ref.child('reservations').set(r);

$('input[name="dateRange"]').daterangepicker({
  "opens": "center",
  "drops": "up"
}, function(start, end, label) {
  console.log("A new date selection was made: " + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD'));
});

$('.timepicker').timepicker({
  timeFormat: 'h:mm p',
  interval: 30,
  minTime: '9:00am',
  maxTime: '9:00pm',
  defaultTime: '11',
  startTime: '9:00am',
  dynamic: false,
  dropdown: true,
  scrollbar: true
});

window.selected = [];
function showAdmin(){


  //$("#adminForm").append('<label for = "dateRange">Date Range: </label>');
  //$("#adminForm").append('<input id = "dateRange" name ="dateRange" type="text"/>');

  //$("#adminForm").append('<label for = "timeStart">Start Time: </label>');
  //$("#adminForm").append('<input id = "timeStart" name ="timeStart" type="text" class="timepicker"/>');

}



function remove_selection(btn){
  if(btn.classList.contains("selected")){
    btn.classList.remove("selected");
  }else{
    btn.classList.add("selected");
  }
}

function sel_a(){
  var btn = document.getElementById('a');
  remove_selection(btn);
}

function sel_b(){
  var btn = document.getElementById('b');
  remove_selection(btn);
}

function sel_c(){
  var btn = document.getElementById('c');
  remove_selection(btn);
}
