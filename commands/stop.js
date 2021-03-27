module.exports.callback = async ({ client, message, serverQueue }) => {
	// Extra serverQueue checks
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
	const shift = serverQueue.songs.shift();
	serverQueue.songs = [shift];
	message.react('✅');
};

module.exports.config = {
	name: 'stop',
	isPlaying: true,
	category: 'music',
};
