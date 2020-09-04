const fs = require('fs');
const readline = require('readline');
const {
  google
} = require('googleapis');
const axios = require('axios');
const stdin = process.openStdin();
const lodash = require('lodash');
const DateTime = require('datetime-converter-nodejs');
const chrono = require('chrono-node');
const moment = require('moment-timezone');

let auth;
let mapNumToEventId = {};

const timezone = 'America/New_York';

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

  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(null);
    auth.setCredentials(JSON.parse(token));
  });

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
    // approval_prompt: "force"
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
      console.log(123)
      console.log(token);
      auth.setCredentials(token);
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      if (callback)
        callback(...userArgs);
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
  //singleEvents -- boolean default false -> show al levents
  return new Promise((resolve, reject) => {
    let response = "";
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
      timeZone: timezone
    }, (err, res) => {
      if (err) reject('The API returned an error: ' + err);
      const events = res.data.items;

      if (events.length) {
        response += "Upcoming 10 events:\n";
        Promise.all(events.map((event,i) => {
          return new Promise((resolve, reject) => {
            const startTime = moment.tz(event.start.dateTime, timezone).format('L LT')
            const endTime = moment.tz(event.end.dateTime, timezone).format('L LT')

            mapNumToEventId[i+1] = event.id;
            //convert this time to just "10PM"
            resolve(`${i+1}: ${event.summary} -  ${startTime} - ${endTime} - ${event.id}`);
          });
        })).then(responses => resolve(responses.join('\n')));
      } else {
        resolve('No upcoming events found.');
      }
    });
  });
}


function parseEventToISO(startTime, duration) {
  console.log(startTime, duration)
  let parsedDate = chrono.parseDate(startTime);
  let offset = moment.tz(timezone).utcOffset();
  let adjusted_startTime = moment(parsedDate).subtract(offset, 'minutes').tz(timezone).toISOString();
  let adjusted_endTime = moment(adjusted_startTime).add(duration, 'minutes').tz(timezone).toISOString();
  console.log(adjusted_startTime + adjusted_endTime)
  return {adjusted_startTime, adjusted_endTime};
}

/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function addEvent(name, startTime, duration=60, recurrence=false) {
  //2020-09-05T02:00:00-05:00
  //2020-09-05T17:00:00-04:00
  return new Promise((resolve, reject) => {
    let {adjusted_startTime, adjusted_endTime} = parseEventToISO(startTime, duration);
    console.log(adjusted_startTime);
    console.log(adjusted_endTime);
    var event = {
      'summary': name, //variable
      'location': 'Discord: Project-TBD Channel',
      'description': name,
      'start': {
        'dateTime': adjusted_startTime,
        'timeZone': timezone,
      },
      'end': {
        'dateTime': adjusted_endTime,
        'timeZone': timezone,
      },
    };
    if (recurrence)
      event['recurrence'] = ['RRULE:FREQ=WEEKLY;INTERVAL=1'];

    const calendar = google.calendar({
      version: 'v3',
      auth
    });
    calendar.events.insert({
      auth: auth,
      calendarId: 'primary',
      resource: event,
    }, function(err, event) {
      console.log("in insert")
      if (err) {
        reject('There was an error contacting the Calendar service: ' + err);
      }
      response = 'Event created!';
      resolve(response);
    });
  });
}

function deleteEvent(id) {
  //recurringEventId - field of eventsId
   return new Promise((resolve, reject) => {
    const calendar = google.calendar({
      version: 'v3',
      auth
    })
    calendar.events.delete({
      calendarId: 'primary',
      eventId: mapNumToEventId[id]
    }, (err, res) => {
      if (err) reject(err)
      if (res) {
        response = "Event deleted";
        resolve(response)
      }
    })
  });
}

function updateEvent(evId, startTime, duration=60) {
   return new Promise((resolve, reject) => {
    const calendar = google.calendar({
      version: 'v3',
      auth
    })

    calendar.events.get({
      calendarId: 'primary',
      eventId: evId,
    }, (err, res) => {
      if (err) return console.log(err)
      const event = res.data;
      let {adjusted_startTime, adjusted_endTime} = parseEventToISO(startTime, duration);
      event.start.dateTime = adjusted_startTime;
      event.end.dateTime = adjusted_endTime;

      calendar.events.update({
        auth: auth,
        calendarId: 'primary',
        eventId: evId,
        resource: event,
      }, (err, res) => {
        if (err) reject(err)
        const event = res.data

        if (event) {
          let response = ('Event has been updated!')
          resolve(response);
        }
      });
    });
  });
}

function calendarAPIController(userCmd, userArgs) {
  switch(userCmd) {
    case 'list':
    console.log('list')
      return listEvents()
      break;
    case 'add':
      return addEvent(...userArgs) //id, start time, endtime
      break;
    case 'delete':
      return deleteEvent(...userArgs) //id, start time, endtime
      break;
    case 'update':
      return updateEvent(...userArgs) //id, start time, endtime
      break;

  }
}

//check for events at every day...
// when new event is added, re-check events for reminders.. -> send out if happening that delayed
// same for editEvent
module.exports = calendarAPIController;
