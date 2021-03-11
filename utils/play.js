const ytdl = require('ytdl-core');
const { client } = require('../index');
const { SOUNDCLOUD_ID } = process.env;
const scdl = require("soundcloud-downloader").default;

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
	let stream = null, streamType = 'opus';
	if (song.url.includes('youtube.com')) {
		// Manage YouTube player
		stream = await ytdl(song.url);
		stream.on('error', (err) => {
			queue.songs.shift();
			this.play(queue);
			return queue.textChannel.send(
				`An unexpected error has occurred.\nPossible type \`${err}\``,
			);
		});
	} else if (song.url.includes('soundcloud.com')) {
		// Manage sound cloud player	
		stream = await scdl.downloadFormat(song.url, scdl.FORMATS.OPUS, SOUNDCLOUD_ID).catch(console.error);
		if (!stream) {
			stream = scdl.downloadFormat(song.url, scdl.FORMATS.MP3, SOUNDCLOUD_ID).catch(console.error);
			streamType = 'unknown';
		}
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
				type: streamType,
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
