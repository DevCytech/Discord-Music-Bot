module.exports.callback = async ({ client, message }) => {
	// Get the server queue
	const serverQueue = client.queue.get(message.guild.id);

	// Make sure the bot if in a voice channel
	if (!message.guild.me.voice.channel) {
		return message.reply('I am not currently playing music!');
	}

	// Check queue
	if (!serverQueue) return message.reply('There is nothing playing.');

	// Place tracks
	const nowPlaying = serverQueue.songs[0];

	const queue = `**Now Playing**: ${nowPlaying.title}`;

	return message.channel.send(queue);
};

module.exports.config = {
	name: 'now-playing',
	aliases: ['n-p'],
	category: 'music',
};
