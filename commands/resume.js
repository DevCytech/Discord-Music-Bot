module.exports.callback = async ({ message, serverQueue }) => {
	// Pause
	serverQueue.dispatcher.resume();
	serverQueue.playing = true;
	return message.reply('I have resumed your music.');
};

module.exports.config = {
	name: 'resume',
	isPlaying: true,
	category: 'music',
};
