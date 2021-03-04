const ytdl = require('ytdl-core');
const { client } = require('../index');

module.exports.play = async (queue) => {
	const song = queue.songs[0];

	// Make sure there is a song
	if (!song) {
		queue.textChannel.send(
			'Leaving the voice channel as queue looks a bit empty...',
		);
		queue.textChannel.guild.me.voice.channel.leave();
		return client.queue.delete(queue.textChannel.guild.id);
	}

	// Setup stream
	let stream = null;
	if (song.url.includes('youtube.com')) {
		stream = await ytdl(song.url);
		stream.on('error', (err) => {
			queue.songs.shift();
			this.play(queue);
			return queue.textChannel.send(
				`An unexpected error has occurred.\nPossible type \`${err}\``,
			);
		});
	}

	// Delete queue on disconnection
	queue.connection.on('disconnect', () =>
		client.queue.delete(queue.textChannel.guild.id),
	);

	// Setup dispatcher
	const dispatcher = queue.connection
		.play(
			ytdl(song.url, {
				quality: 'highestaudio',
				highWaterMark: 1 << 25,
				type: 'opus',
			}),
		)
		.on('finish', () => {
			const shift = queue.songs.shift();
			if (queue.loop) queue.songs.push(shift);
			this.play(queue);
		});

	// Set volume and send play message
	dispatcher.setVolumeLogarithmic(queue.volume / 100);
	queue.textChannel.send(
		`I am now playing \`${song.title}\`! *requested by ${song.req.username}*`,
	);
};
