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

$(function() {
  // document ready

  $("#calendar").fullCalendar({
    schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source',
    defaultView: "agendaDay",
    defaultDate: "2018-04-07",
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
    events: [
      {
        id: "1",
        resourceId: "a",
        start: "2018-04-07T14:00:00",
        end: "2018-04-07T16:00:00",
        title: "Click To Reserve",
        textColor: "#000000"
      },
      {
        id: "2",
        resourceId: "a",
        start: "2018-04-07T16:00:00",
        end: "2018-04-07T18:00:00",
        title: "Click To Reserve",
        textColor: "#000000"
      },
      {
        id: "3",
        resourceId: "a",
        start: "2018-04-07T18:00:00",
        end: "2018-04-07T20:00:00",
        title: "Click To Reserve",
        textColor: "#000000"
      },
      {
        id: "4",
        resourceId: "b",
        start: "2018-04-07T14:00:00",
        end: "2018-04-07T16:00:00",
        title: "Click To Reserve",
        textColor: "#000000"
      },
      {
        id: "5",
        resourceId: "b",
        start: "2018-04-07T16:00:00",
        end: "2018-04-07T18:00:00",
        title: "Click To Reserve",
        textColor: "#000000"
      },
      {
        id: "6",
        resourceId: "b",
        start: "2018-04-07T18:00:00",
        end: "2018-04-07T20:00:00",
        title: "Click To Reserve",
        textColor: "#000000"
      },
      {
        id: "7",
        resourceId: "c",
        start: "2018-04-07T14:00:00",
        end: "2018-04-07T17:00:00",
        title: "Click To Reserve",
        textColor: "#000000"
      },
      {
        id: "8",
        resourceId: "c",
        start: "2018-04-07T11:00:00",
        end: "2018-04-07T14:00:00",
        title: "Click To Reserve",
        textColor: "#000000"
      }
    ],
    eventClick: function(event, element) {
      event.title = window.prompt(
        "Enter your information to reserve the room:",
        "[name], [college], [year]"
      );
      event.backgroundColor = "gray";
      event.borderColor = "grey";

      $("#calendar").fullCalendar("updateEvent", event);
    }
  });
});


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

toHome();
