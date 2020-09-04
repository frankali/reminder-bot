// require the discord.js module
const gCalendarAPI = require('./googlecalendar.js')

const {
  prefix,
  token
} = process.env;
// create a new Discord client
const client = new Discord.Client();


// when the client is ready, run this code
// this event will only trigger one time after logging in
client.once('ready', () => {
  console.log('Ready!');
});


//First, make sure to close the process in your console.
client.on('message', message => {
  console.log(message);
  if (!message.content.startsWith(prefix) || message.author.bot) return;
  const args = message.content.slice(prefix.length).trim().split(' ');
  console.log("ARGS" + args)
  const command = args.shift();
  console.log("CMD" + command)
  if (`${prefix}${command}` === `${prefix}calendarBot`) {
    message.channel.send('CalendarBot v1.0 for Project-Tbd!);
    message.channel.send('This bot is a simple way to create reminders for discord meetings');
    message.channel.send('Use !cb-help for more information!');
  } else if (`${prefix}${command}` == `${prefix}cb-help`) {
    message.channel.send('To schedule an event use the following format: ');
    message.channel.send('!update-event [event-id] [start time] [end time]');
    // message.channel.send(`[event-name]: Test-Meeting`);
    // message.channel.send(`[start time]: Sat Sep 12 2020  15:00:00`);
    // message.channel.send(`[end time]: Sat Sep 12 2020  17:00:00`);
    // message.channel.send(`[recurring type]: weekly, daily, monthly, null`
  } else if (`${prefix}${command}` === `${prefix}update-event`) {
    if (!args.length < 2 || args.length > 2) {
      return message.channel.send(`You didn't provide correct arguments, ${message.author}!`);
    } else {
			auth = gCalendarAPI.giveAuth();
			response = gCalendarAPI.calendarAPIController(command, args);
			console.log(response);
		}
		//message.channel.send(`Command name: ${command}\nArguments: ${args}`);
  }
})

// login to Discord with your app's token
client.login(token);

//single row
// recurring : date : time :(exception: 9/5...)
// single: 9/5 :..
//auto run
//loook into nodejs scheduelr
