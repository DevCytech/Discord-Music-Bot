module.exports.callback = async ({ client, message, args, serverQueue }) => {
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
	isPlaying: true,
	aliases: ['vol'],
	category: 'music',
};
