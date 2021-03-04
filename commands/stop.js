module.exports.callback = async ({ client, message }) => {
	// Check voice channel
	const channel = message.member.voice.channel;
	if (!channel) {
		return message.reply(
			'Please join a voice channel to use this command.',
		);
	}
	
	// Make sure they are in the same voice channel
	if (channel.id !== message.guild.me.voice.channel.id) {
		return message.reply(
			'Please join the same voice channel as me to use this command.',
		);	
	}

	// Get the server queue
	const serverQueue = client.queue.get(message.guild.id);

	// Check queue
	if (!serverQueue) return message.reply('There is nothing playing.');
	if (!serverQueue.connection) return;
	if (!serverQueue.connection.dispatcher) return;

	// Try to end dispatcher
	try {
		serverQueue.connection.dispatcher.end();
	} catch (err) {
		message.guild.me.voice.channel.leave();
		client.queue.delete(message.guild.id);
		return message.reply(
			'The music player has stopped and queue has been cleared.',
		);
	}

	// Delete the queue
	client.queue.delete(message.guild.id);
	serverQueue.songs = [];
	message.react('✅');
};

module.exports.config = {
	name: 'stop',
	aliases: [],
	category: 'music',
};
