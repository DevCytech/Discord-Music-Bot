const { existsSync } = require('fs');
const { SOUNDCLOUD_ID } = process.env;
const { client } = require('../index');
const scdl = require('soundcloud-downloader').default;
const { YouTubePlayer, ExternalPlayer } = require('./player');
const availableFilters = require('./filters.json');
const { createReadStream } = require('fs');

// Play module
module.exports.play = async (queue, update, refresh) => {
	// Get settings
	const seek = update ? queue.dispatcher.streamTime : null;
	const filters = [];
	for (const filter of queue.filters) {
		if (filters === []) {
			filters.push('-af');
		}
		filters.push(availableFilters[filter]);
	}
	const encoder = filters.length ? ['-af', filters.join(',')] : [];

	// Get song
	const song = queue.songs[0];
	if (update && !refresh) {
		await queue.dispatcher.end();
		queue.update = true;
		return;
	} else if (update && refresh) {
		queue.update = false;
	}

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
				encoderArgs: encoder,
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
				encoderArgs: encoder,
				seek: seek / 1000,
			},
		);
	}

	// Attempting to solve FFmpeg error
	if (queue.dispatcher) {
		await queue.dispatcher.destroy();
	}

	// Delete queue on disconnection
	queue.connection.on('disconnect', () =>
		client.queue.delete(queue.textChannel.guild.id),
	);

	setTimeout(async () => {
		// Setup dispatcher
		const dispatcher = queue.connection
			.play(stream, { type: streamType })
			.on('finish', () => {
				setTimeout(() => {
					if (queue.update) {
						this.play(queue, true, true);
					} else {
						const shift = queue.songs.shift();
						if (queue.loop) queue.songs.push(shift);
						this.play(queue);
					}
				}, 200);
			})
			.on('error', (err) => {
				queue.songs.shift();
				queue.textChannel.send(
					`An unexpected error has occurred.\nPossible type \`${err}\``,
				);
				return this.play(queue);
			});
		queue.dispatcher = dispatcher;
		queue.playing = true;

		// Set volume and send play message
		dispatcher.setVolumeLogarithmic(queue.volume / 100);
		queue.textChannel.send(
			`I am now playing \`${song.title}\`! *requested by ${song.req.username}*`,
		);
	}, 1000);
};
