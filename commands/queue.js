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
	const next = serverQueue.songs.slice(1, 11);
	const playingNext = [];

	// Sort out tracks
	let i = 1;
	for (const track of next) {
		playingNext.push(`\`${i++})\` ${track.title}`);
	}

	// Create queue message
	const queue = `**Now Playing**: ${nowPlaying.title} \n**Playing Next**: *(${
		next.length
	}/${serverQueue.songs.length - 1})*\n${playingNext.join('\n')}`;

	return message.channel.send(queue);
};

module.exports.config = {
	name: 'queue',
	aliases: ['q'],
	category: 'music',
};
