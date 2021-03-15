const ytpl = require('ytpl');
const yts = require('yt-search');
const { Util } = require('discord.js');
const { getData } = require('spotify-url-info');

async function manageQueue(client, message, channel, video) {
	const serverQueue = client.queue.get(message.guild.id);

	// Create queue track
	const track = {
		id: video.id ? video.id : video.videoId,
		title: Util.escapeMarkdown(video.title),
		views: video.views ? video.views : '-',
		ago: video.ago ? video.ago : '-',
		duration: video.duration,
		url: `https://www.youtube.com/watch?v=${
			video.id ? video.id : video.videoId
		}`,
		img: video.thumbnail,
		req: message.author,
	};

	// Check queue
	if (!serverQueue) {
		// Create queue
		const queueItem = {
			textChannel: message.channel,
			voiceChannel: channel,
			connection: null,
			dispatcher: null,
			songs: [track],
			volume: 50,
			playing: true,
			loop: false,
		};
		client.queue.set(message.guild.id, queueItem);

		// Play the song
		const { play } = require('../utils/play');
		const connection = await channel.join().catch((err) => {
			client.queue.delete(message.guild.id);
			message.reply(`I was unable to join the voice channel: ${err}`);
			return console.error(`Unable to join voice channel: ${err}`);
		});
		if (!connection) return await channel.leave();

		// Set queue
		queueItem.connection = connection;
		play(queueItem);
	} else {
		// Add song to queue
		serverQueue.songs.push(track);
	}

	return;
}

module.exports.callback = async ({ client, args, message }) => {
	// Check voice channel
	const channel = message.member.voice.channel;
	if (!channel) {
		return message.reply(
			'Please join a voice channel to use this command.',
		);
	}

	// Get server queue
	const serverQueue = client.queue.get(message.guild.id);

	// Check Permissions
	if (!serverQueue || !serverQueue.voiceChannel) {
		const permissions = channel.permissionsFor(message.client.user);
		if (!permissions.has('CONNECT')) {
			return message.reply(
				'I am unable to connect to your voice channel.',
			);
		}
		if (!permissions.has('SPEAK')) {
			return message.reply('I am unable to speak in your voice channel.');
		}
	}

	// Search and URL
	const search = args.join(' ');
	if (!search) {
		return message.reply('Please provide a song you would like to play');
	}
	const url = args[0] ? args[0].replace(/<(.+)>/g, '$1') : '';

	// Get Song
	if (/^.*(youtu.be\/|list=)([^#&?]*).*/gi.test(url)) {
		// Manage playlist links
		const playlist = await ytpl(
			url.split('list=')[1].split('&index=')[0],
		).catch();
		if (!playlist) {
			return message.reply('I could not find a playlist with that url');
		}

		// Get videos
		const videos = await playlist.items;

		// Add videos to queue
		for (const video of videos) {
			manageQueue(client, message, channel, video);
		}

		// Send confirmation
		return message.channel.send(
			`Successfully added ${videos[0].title} to queue!`,
		);
	} else if (
		url.match(
			/(?:https:\/\/open\.spotify\.com\/|spotify:)(?:.+)?(playlist)[/:]([A-Za-z0-9]+)/,
		)
	) {
		// Manage spotify playlists
		const playlist = await getData(url).catch();
		if (!playlist) {
			return message.reply(
				'I was unable to find the playlist with that link.',
			);
		}

		// Handle tracks
		const tracks = [];
		message.channel.send(
			`Searching for songs... This may take a moment. Expected time... ${playlist.tracks.items.length} seconds.`,
		);
		
		for (const song of playlist.tracks.items) {
			const results = await yts.search(
				`${song.track.artists[0].name} - ${song.track.name}`,
			);
			if (!results || results.length < 1) {
				continue;
			}
			tracks.push(results.all[0]);
		}

		for (const track of tracks) {
			await manageQueue(client, message, channel, track);
		}

		return message.channel.send(
			`Successfully added \`${playlist.name}\` with ${tracks.length} songs to the queue.`,
		);
	} else {
		// Search youtube playlists
		const found = await yts.search(search);
		if (found.playlists.length === 0) {
			return message.reply('I could not find and playlists on YouTube.');
		}

		// Get information
		const playlistInfo = found.playlists[0];
		const playlist = await ytpl(playlistInfo.listId);
		const videos = await playlist.items;

		// Add videos to queue
		for (const video of videos) {
			manageQueue(client, message, channel, video);
		}

		// Send confirmation
		return message.channel.send(
			`Successfully added ${playlistInfo.title} to the queue with ${playlistInfo.videoCount} tracks!`,
		);
	}
};

module.exports.config = {
	name: 'play-playlist',
	aliases: ['p-p', 'playlist'],
	category: 'music',
};
