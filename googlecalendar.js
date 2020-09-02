const fs = require('fs');
const readline = require('readline');
const {
  google
} = require('googleapis');
const axios = require('axios');
const stdin = process.openStdin();
const lodash = require('lodash');
const DateTime = require('datetime-converter-nodejs');


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
  // Authorize a client with credentials, then call the Google Calendar API.
  authorize(JSON.parse(content), getActionFromUser);
  //authorize(JSON.parse(content), addEvent);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {
    client_secret,
    client_id,
    redirect_uris
  } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
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
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
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
function listEvents(auth) {
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
function addEvent(auth) {
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

function deleteEvent(auth, evId) {
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

function updateEvent(auth, evId) {
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

    var time1 = 'Sat Sep 12 2020  15:00:00 GMT-0400 (IST)'
    var time2 = 'Sat Sep 12 2020  17:00:00 GMT-0400 (IST)'
    event.start.dateTime = DateTime.isoString(time1);
    event.end.dateTime = DateTime.isoString(time2);
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

// const calendar = google.calendar({
//   version: 'v3',
//   auth
// })
// console.log(evId)
// calendar.events.update({
//   calendarId: 'primary',
//   eventId: evId,
//   event: event
// }, (err, res) => {
//   if (err) return console.log(err)
//   if (res) {
//     console.log('Event updated!')
//   }
// })
}

function getActionFromUser(auth) {
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
        listEvents(auth)
        break
        // case 11:
        //   listEvents(auth, numberOfListedEvents)
        //   break
      case 20:
        addEvent(auth)
        break
      case 30:
        // console.log('Enter event id')
        // stdin.addListener("data", function(d) {
        //   console.log(d. + "ok")
        //       convertedId = (String(d))
      //  deleteEvent(auth, "nbn00vmlp8esb0jsavidudqj68_20200905T140000Z")  //delete single
      deleteEvent(auth, "nbn00vmlp8esb0jsavidudqj68") //delete recurring
        // });
        break
      case 40:
        updateEvent(auth, "ip4s5heeb3co0ipj9q97sttas0")
        break
      case 0:
        process.exit()
        break
    }
  });
}

//check for events at every day...
// when new event is added, re-check events for reminders.. -> send out if happening that delayed
// same for editEvent
