const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
/*fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Calendar API.
  authorize(JSON.parse(content), listEvents);
});*/

let events_list = {};

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
async function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = await new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  await fs.readFile(TOKEN_PATH, async (err, token) => {
    if (err) return await getAccessToken(oAuth2Client, callback);
    await oAuth2Client.setCredentials(JSON.parse(token));
    await callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
async function getAccessToken(oAuth2Client, callback) {
  const authUrl = await oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = await readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', async (code) => {
    await rl.close();
    oAuth2Client.getToken(code, async (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      await oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      await fs.writeFile(TOKEN_PATH, JSON.stringify(token), async (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      await callback(oAuth2Client);
    });
  });
}

/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function listEvents(auth) {
  const calendar = google.calendar({version: 'v3', auth});
  await calendar.calendarList.list((err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const calendars = res.data.items;
    if (calendars.length) {
      calendars.map((calendar, i) => {
        console.log(calendar);
      });
    } else {
      console.log('No calendars found.');
    }
  });
  await calendar.events.list({
    calendarId: 'primary',
    timeMin: (new Date()).toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const events = res.data.items;
    if (events.length) {
      //console.log('Upcoming 10 events:');
      /*events.map((event, i) => {
        const start = event.start.dateTime || event.start.date;
        console.log(`${start} - ${event.summary}`);
      });*/
      events_list = events;
    } else {
      console.log('No upcoming events found.');
    }
  });
}
function jsonTreatment(json){
  var events = [];

  for(var i = 0; i < json.length; i++) {
      var event = {};
      event["name"] = json[i].summary;
      event["start"] = json[i].start.dateTime;
      event["end"] = json[i].end.dateTime;
      event["location"] = json[i].location;
      events.push(event);
  }
  return events;
}
async function getCalendar(){
  await fs.readFile('credentials.json', async (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Calendar API.
    await authorize(JSON.parse(content), await listEvents);
  });
  console.log(events_list);
  return jsonTreatment(events_list);
}

exports.getCalendar = getCalendar;