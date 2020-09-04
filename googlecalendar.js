const fs = require('fs');
const readline = require('readline');
const {
  google
} = require('googleapis');
const axios = require('axios');
const stdin = process.openStdin();
const lodash = require('lodash');
const DateTime = require('datetime-converter-nodejs');

let auth;

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';
//addEvent();

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);

   const {
    client_secret,
    client_id,
    redirect_uris
  } = JSON.parse(content).installed;

  auth = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);
    getActionFromUser()
});

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(callback, userArgs = []) {
  const authUrl = auth.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    auth.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      auth.setCredentials(token);
      callback(auth, ...userArgs);
    });
  });
}


//test add - event using google docs
// add a addUserToCalendarMeetings (add email to local file)
//test recurring events
/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listEvents() {
  const calendar = google.calendar({
    version: 'v3',
    auth
  });
  calendar.events.list({
    calendarId: 'primary',
    timeMin: (new Date()).toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const events = res.data.items;
    if (events.length) {
      console.log('Upcoming 10 events:');
      events.map((event, i) => {
        const start = event.start.dateTime || event.start.date; //convert this time to just "10PM"
        console.log(`${start} - ${event.summary} - ${event.id} `);
      });
    } else {
      console.log('No upcoming events found.');
    }
  });
}


/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function addEvent() {
  var event = {
    'summary': 'Project-TBD: Meeting', //variable
    'location': 'Discord: Project-TBD Channel',
    'description': 'A Project TBD Meeting',
    'start': {
      'dateTime': '2020-09-05T02:00:00-05:00',
      'timeZone': 'America/New_York',
    },
    'end': {
      'dateTime': '2020-09-05T17:00:00-04:00',
      'timeZone': 'America/New_York',
    },
    // 'recurrence': [
    //   'RRULE:FREQ=WEEKLY;INTERVAL=1'
    // ],
    'attendees': [{
        'email': 'test@gmail.com'
      },
      {
        'email': 'sbrin@example.com'
      },
    ],
  };
  const calendar = google.calendar({
    version: 'v3',
    auth
  });
  calendar.events.insert({
    auth: auth,
    calendarId: 'primary',
    resource: event,
  }, function(err, event) {
    if (err) {
      console.log('There was an error contacting the Calendar service: ' + err);
      return;
    }
    console.log('Event created: %s', event.htmlLink);
  });
}

function deleteEvent(evId) {
  const calendar = google.calendar({
    version: 'v3',
    auth
  })
  console.log(evId)
  calendar.events.delete({
    calendarId: 'primary',
    eventId: evId
  }, (err, res) => {
    if (err) return console.log(err)
    if (res) {
      console.log('Event deleted!')
    }
  })
}

function updateEvent(evId, startTime, endTime) {
  const calendar = google.calendar({
    version: 'v3',
    auth
  })
  calendar.events.list({
    calendarId: 'primary',
    timeMin: (new Date()).toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const events = res.data.items;
    console.log(evId)
    var event;
    events.forEach((item, i) => {
      if (item.id === evId) {
        event = item;
      }
    });
    var timeZoneModifier = 'GMT-0400 (IST)';
    var startTimeFormatted =  'startTime' + ' ' + timeZoneModifier;
    var endTimeFormatted = 'Sat Sep 12 2020  17:00:00' + ' ' + timeZoneModifier;
    event.start.dateTime = DateTime.isoString(startTimeFormatted);
    event.end.dateTime = DateTime.isoString(endTimeFormatted);
  calendar.events.update({
    auth: auth,
    calendarId: 'primary',
    eventId: evId,
    resource: event,
  }, (err, res) => {
    if (err) return console.log(err)
    const event = res.data

    if (event) {
      console.log('Booked event:')
      return "Event updated";
      console.log(event)
    }
  })
  // console.log(DateTime.isoString(time1));
  // console.log(DateTime.isoString(time2));


  //     var event = lodash.map(events, function(x) {
  //     if (x.id == "nbn00vmlp8esb0jsavidudqj68_20200912T140000") return x;
  // });
  // event = lodash.without(event, undefined)


});
}

function getActionFromUser() {
  const numberOfListedEvents = 100
  console.log(`10 - Lists your ${numberOfListedEvents} first Google calendar events`)
  // console.log(`11 - Lists your ${numberOfListedEvents} first Google calendar events from Today`)
  console.log('20 - Inserts new event for tomorrow')
  console.log('30 - Delete an event by ID')
  console.log('40 - Update an event by ID')
  console.log('\n0 - Exit')
  console.log('\n')
  console.log('Choose an action:')

  stdin.addListener("data", function(d) {
    switch (Number(d)) {
      case 10:
        getAccessToken(listEvents)
        break
        // case 11:
        //   listEvents(auth, numberOfListedEvents)
        //   break
      case 20:
        getAccessToken(addEvent)
        break
      case 30:
        // console.log('Enter event id')
        // stdin.addListener("data", function(d) {
        //   console.log(d. + "ok")
        //       convertedId = (String(d))
      //  deleteEvent(auth, "nbn00vmlp8esb0jsavidudqj68_20200905T140000Z")  //delete single
        getAccessToken(deleteEvent, ["nbn00vmlp8esb0jsavidudqj68"]) //delete recurring
        // });
        break
      case 40:
        getAccessToken(updateEvent, ["ip4s5heeb3co0ipj9q97sttas0"])
        break
      case 0:
        process.exit()
        break
    }
  });
}


function calendarAPIController(userCmd, userArgs) {
  switch(userCmd) {
    case 'update':
    var eventId = userArgs[0];
    var startTime = userArgs[1];
    var endTime = userArgs[2];
    getAccessToken(updateEvent, userArgs);
    break;
  }
}

//check for events at every day...
// when new event is added, re-check events for reminders.. -> send out if happening that delayed
// same for editEvent
module.exports = {
  default: calendarAPIController,
}
