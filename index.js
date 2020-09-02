// require the discord.js module
const Discord = require('discord.js');
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
  const command = args.shift().toLowerCase();
  if (command === `${prefix}ping`) {
    message.channel.send('Pong.');
  } else if (command === `${prefix}beep`) {
    message.channel.send('Boop.');
  } else if (command === `${prefix}test`) {
    if (!args.length) {
      return message.channel.send(`You didn't provide any arguments, ${message.author}!`);
    }
		message.channel.send(`Command name: ${command}\nArguments: ${args}`);
  }
})

// login to Discord with your app's token
client.login(token);

//single row
// recurring : date : time :(exception: 9/5...)
// single: 9/5 :..
//auto run
//loook into nodejs scheduelr
