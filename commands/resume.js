module.exports.callback = async ({ client, message }) => {
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

	// Check if the bot is playing
	if (serverQueue.playing) {
		return message.reply('Music is already playing.');
	}

	// Pause
	serverQueue.dispatcher.resume();
	serverQueue.playing = true;
	return message.reply('I have resumed your music.');
};

module.exports.config = {
	name: 'resume',
	category: 'music',
};
