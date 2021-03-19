module.exports.callback = async ({ client, message, args }) => {
	// Check voice channel
	const channel = message.member.voice.channel;
	if (!channel) {
		return message.reply(
			'Please join a voice channel to use this command.',
		);
	}

	// Make sure the bot if in a voice channel
	if (!message.guild.me.voice.channel) {
		return message.reply('I am not currently playing music!');
	}

	// Make sure they are in the same voice channel
	if (channel.id !== message.guild.me.voice.channel.id) {
		return message.reply(
			'Please join the same voice channel as me to use this command.',
		);
	}

	// Get the server queue
	const serverQueue = client.queue.get(message.guild.id);
	if (!serverQueue) return message.reply('There is nothing playing.');

	// Check to see if argument is a filter
	if (!serverQueue.dispatcher || serverQueue.playing) {
		return message.reply('Music is already playing.');
	}

	// Pause
  	serverQueue.playing = true;
  	client.queue.set(message.guild.id, serverQueue);
	  serverQueue.dispatcher.resume();
  	return message.channel.send('Music has been resumed!');
};

module.exports.config = {
	name: 'resume',
	category: 'music',
};
