// require the discord.js module
const Discord = require('discord.js');

const { prefix, token } = process.env;
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
	if (message.content === `${prefix}ping`) {
		message.channel.send('Pong.');
	} else if (message.content === `${prefix}beep`) {
		message.channel.send('Boop.');
	}
})

// login to Discord with your app's token
client.login(token);

//single row
// recurring : date : time :(exception: 9/5...)
// single: 9/5 :..
//auto run
//loook into nodejs scheduelr
