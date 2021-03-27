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
	if (
		!args[0] ||
		isNaN(args[0]) ||
		parseInt(args[0], 10) > 100 ||
		parseInt(args[0], 10) < 1
	) {
		return message.reply(
			`Volume can only be changed between 1 and 100. Current Volume: ${serverQueue.volume}%`,
		);
	}

	// Change volume
	serverQueue.volume = parseInt(args[0], 10);
	client.queue.set(message.guild.id, serverQueue);
	serverQueue.dispatcher.setVolumeLogarithmic(serverQueue.volume / 100);
	return message.channel.send(
		`Volume has been set to ${serverQueue.volume}%`,
	);
};

module.exports.config = {
	name: 'volume',
	aliases: ['vol'],
	category: 'music',
};
