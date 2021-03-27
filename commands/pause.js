module.exports.callback = async ({ message, serverQueue }) => {
	// Check if the bot is playing
	if (!serverQueue.playing) {
		return message.reply('Music is currently not playing.');
	}

	// Pause
	serverQueue.dispatcher.pause();
	serverQueue.playing = false;
	return message.reply('I have paused your music.');
};

module.exports.config = {
	name: 'pause',
	isPlaying: true,
	category: 'music',
};
