$(document).ready(function () {
  $('main').scroll(function (event) {
      console.log("scrolling");
      var scroll = document.getElementById('main').scrollTop();
      var pages = document.getElementsByClassName('page');
      var pageOn = pages[0];
      for (var i = 0; i < pages.length; i++){
        if (scroll > pages[i].offsetTop){
          pageOn = pages[i];
        }
      }
      changeSender(pageOn);
  });
});

function bookEvent(e){

}

function eventClicked(e){
  if (e.title.includes('RESERVED')){
    var firebaseRef = firebase.database().ref();
    window.ref = firebaseRef;
    window.ref.once('value').then(function(snapshot){
      reservations = snapshot.val()['reservations'];
      for (r in reservations){
        if (reservations[r]['id'] == e.id){
          var name = reservations[r]['name'];
          var school = reservations[r]['school'];
          var email = reservations[r]['email'];
          var str = `${name} from ${school} reserved this time slot and can be reached at ${email}`;
          window.alert(str);
        }
      }
    });
  }else{
    if (window.admin){
      if (confirm("Delete this open reservation time?")){
        var firebaseRef = firebase.database().ref();
        window.ref = firebaseRef;
        window.ref.once('value').then(function(snapshot){
          events = snapshot.val()['events'];
          var newEvents = [];
          for (n in events){
            if (!(events[n]['id'] == e.id)){
              newEvents.push(events[n]);
            }
            console.log(newEvents);
          }
          console.log(newEvents);
          window.ref.child('events').set(newEvents);
          setCalendar();
          window.alert("Event removed.");
        });
      }
    }else{
      var name = window.prompt("Please enter your name:","");
      if (!name == ""){
        var email = window.prompt("Please enter your email:","");
        if (!email == ""){
          var school = window.prompt("What school do you go to?","");
          if (!school == ""){
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
            setCalendar();
            window.alert("Your reservation has been logged. If you have any questions please email eli.cohen@pomona.edu");
          }
        }
      }
    }
  }
}

function setCalendar(){
  var firebaseRef = firebase.database().ref();
  window.ref = firebaseRef;
  window.ref.once('value').then(function(snapshot){
    events = snapshot.val()['events'];
    open = [];
    all = [];
    for (e in events){
      var full = events[e];
      if (!full['title'].includes('RESERVED')){
        open.push(full);
      }
      all.push(full);
    }
    $("#calendar").fullCalendar('destroy');
    if (window.admin) {
      $("#calendar").fullCalendar({
        schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source',
        defaultView: "agendaDay",
        defaultDate: $('#calendar').fullCalendar('today'),
        height: 600,
        // editable: true,
        // selectable: true,
        allDaySlot: false,
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
        height: 600,
        // editable: true,
        // selectable: true,
        allDaySlot: false,
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

$(function() {
  // document ready
  setCalendar();
});

function addEvent(){

}

function resetNav(){
  var navbar = document.getElementsByClassName('sidenav')[0];
  var buttons = navbar.getElementsByTagName('button');
  for (var i = 0; i < buttons.length; i++){
    buttons[i].style.color = "#818181";
  }
}

function changeSender(sender){
  resetNav();
  sender.style.color = "#f1f1f1";
}

function scrollToPage(page){
  var topScroll = page.offsetTop;
  var main = document.getElementById('main');
  main.scrollTo({
    top: topScroll - 50,
    behavior: "smooth"
  })
}

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

window.admin = false;
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
      }else{
        window.alert("wrong admin password");
        window.admin = false;
      }
      input.value = "";
    });
  }
};

input.onfocus = function(){
  if (window.admin) {
    input.blur();
    document.getElementById('addEvent').style.opacity = "0.0";
    input.placeholder = "Admin Login"
    window.admin = false;
    setCalendar();
  }
}

toHome();

//dummy events
e = [
{
  end: "2018-08-16T16:00:00",
  id: "1",
  resourceId: "b",
  start: "2018-08-16T14:00:00",
  textColor: "#000000",
  title: "RESERVED: Click to view"
},
{
  end: "2018-08-16T16:00:00",
  id: "2",
  resourceId: "a",
  start: "2018-08-16T14:00:00",
  textColor: "#000000",
  title: "Click to Reserve"
}];

r = [
  {
    name: "Ethan Hardacre",
    email: "hardacre.ethan@gmail.com",
    school: "Pomona",
    id: "1"
  }
]

var firebaseRef = firebase.database().ref();
window.ref = firebaseRef;
window.ref.child('events').set(e);
window.ref.child('reservations').set(r);
