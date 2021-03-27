module.exports.callback = async ({ message, serverQueue }) => {
	// Skip song
	serverQueue.dispatcher.end();
	message.reply('I have skipped to the next song!');
};

module.exports.config = {
	name: 'skip',
	isPlaying: true,
	aliases: ['next'],
	category: 'music',
};
