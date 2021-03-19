const { existsSync } = require('fs');
const { SOUNDCLOUD_ID } = process.env;
const { client } = require('../index');
const scdl = require('soundcloud-downloader').default;
const { YouTubePlayer, ExternalPlayer } = require('./player');
const availableFilters = require('./filters.json');
const { createReadStream } = require('fs');

// Update is for filter updates
module.exports.play = async (queue, update) => {
	// Define filters and seek
	const seek = update ? queue.dispatcher.streamTime : null;
	const filters = [];
	for (const filter of queue.filters) {
		if (filters === []) {
			filters.push('-af');
		}
		filters.push(availableFilters[filter]);
	}

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
		stream = createReadStream(`./temp/${song.title}.mp3`);
		streamType = 'unknown';
	} else if (song.url.includes('youtube.com')) {
		// Manage YouTube player
		if (song.isLive) {
			stream = await YouTubePlayer(song.url, {
				quality: 'highestaudio',
				highWaterMark: 1 << 25,
				type: streamType,
				seek: undefined,
				opusEncoded: true,
			});
		} else {
			stream = await YouTubePlayer(song.url, {
				quality: 'highestaudio',
				filter: 'audioonly',
				highWaterMark: 1 << 25,
				type: streamType,
				encoderArgs: filters,
				seek: seek / 1000,
				opusEncoded: true,
			});
		}
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
				encoderArgs: filters,
				seek: seek / 1000,
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
