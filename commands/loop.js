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

	// Check queue and toggle loop
	if (!serverQueue) return message.reply('There is nothing playing.');
	serverQueue.loop = !serverQueue.loop;

	return message.reply(
		`Loop has been **${serverQueue.loop ? 'enabled' : 'disabled'}**`,
	);
};

module.exports.config = {
	name: 'loop',
	aliases: [],
	category: 'music',
};
