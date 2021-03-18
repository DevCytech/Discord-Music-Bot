const { existsSync } = require('fs');
const { SOUNDCLOUD_ID } = process.env;
const { client } = require('../index');
const scdl = require('soundcloud-downloader').default;
const { YouTubePlayer, ExternalPlayer } = require('./player');

const nightcore = 'aresample=48000,asetrate=48000*1.15';

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
	let streamType = 'opus';

	// Setup stream
	if (song.isFile) {
		// Manage Files
		if (!existsSync(song.file)) return;
		stream = song.file;
		streamType = 'unknown';
	} else if (song.url.includes('youtube.com')) {
		// Manage YouTube player
		stream = await YouTubePlayer(song.url, {
			quality: 'highestaudio',
			filter: 'audioonly',
			highWaterMark: 1 << 25,
			type: streamType,
			encoderArgs: ['-af', nightcore],
			seek: undefined,
			opusEncoded: true,
		});
		stream.on('error', (err) => {
			queue.songs.shift();
			this.play(queue);
			return queue.textChannel.send(
				`An unexpected error has occurred.\nPossible type \`${err}\``,
			);
		});
	} else if (song.url.includes('soundcloud.com')) {
		// Manage sound cloud player
		stream = ExternalPlayer(
			await scdl.downloadFormat(
				song.url,
				scdl.FORMATS.OPUS,
				SOUNDCLOUD_ID,
			),
			{
				opusEncoded: true,
				encoderArgs: ['-af', nightcore],
				seek: undefined,
			},
		);
	}

	// Delete queue on disconnection
	queue.connection.on('disconnect', () =>
		client.queue.delete(queue.textChannel.guild.id),
	);

	// Setup dispatcher
	const dispatcher = queue.connection
		.play(stream, { type: streamType })
		.on('finish', () => {
			setTimeout(() => {
				const shift = queue.songs.shift();
				if (queue.loop) queue.songs.push(shift);
				this.play(queue);
			}, 200);
		})
		.on('error', (err) => {
			queue.songs.shift();
			this.play(queue);
			return queue.textChannel.send(
				`An unexpected error has occurred.\nPossible type \`${err}\``,
			);
		});
	queue.dispatcher = dispatcher;

	// Set volume and send play message
	dispatcher.setVolumeLogarithmic(queue.volume / 100);
	queue.textChannel.send(
		`I am now playing \`${song.title}\`! *requested by ${song.req.username}*`,
	);
};
