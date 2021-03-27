module.exports.callback = async ({ message, serverQueue }) => {
	// Check if the bot is playing
	if (!serverQueue.playing) {
		return message.reply('Music is currently not playing.');
	}

	serverQueue.loop = !serverQueue.loop;
	return message.reply(
		`Loop has been **${serverQueue.loop ? 'enabled' : 'disabled'}**`,
	);
};

module.exports.config = {
	name: 'loop',
	isPlaying: true,
	category: 'music',
};
