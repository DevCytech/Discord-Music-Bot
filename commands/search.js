const yts = require('yt-search');
const { Util } = require('discord.js');

async function manageQueue(client, message, channel, serverQueue, song) {
	// Add song to queue if queue is set
	if (serverQueue) {
		serverQueue.songs.push(song);
		return message.reply(
			`\`${song.title}\` has been added to the queue. *Requested by ${song.req}*`,
		);
	}

	// Construct queue variable
	const queueItem = {
		textChannel: message.channel,
		voiceChannel: channel,
		connection: null,
		dispatcher: null,
		songs: [song],
		volume: 50,
		playing: false,
		loop: false,
		filters: [],
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
	await connection.voice.setSelfDeaf(true);

	// Set queue
	queueItem.connection = connection;
	play(queueItem);
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

	// Search
	const search = args.join(' ');
	if (!search) {
		return message.reply('Please provide a song you would like to play');
	}

	// Search for songs via YouTube if song was not a link.
	const searchResult = await yts.search(search).catch(console.error);
	if (!searchResult.videos.length) {
		return message.reply('I was unable to find the song on youtube');
	}

	// songs
	let i = 1;
	const songs = searchResult.videos.slice(0, 5);
	const tracks = songs.map((track) => `${i++}) ${track.title}`);
	await message.channel.send(
		`Songs found: \n\n${tracks.join(
			'\n',
		)} \n\nRespond with number or type cancel.`,
	);

	// Collect the message
	let response = null;
	try {
		response = await message.channel.awaitMessages(
			(m) => m.content > 0 && m.content < 6,
			{ max: 1, time: 20000, errors: ['time'] },
		);
	} catch (err) {
		return message.channel.send(
			'Nothing has been selected and the request has been canceled. If you typed a number less than 1 or bigger than 5 this error may also show.',
		);
	}

	// Get video
	const trackID = parseInt(response.first().content, 10);
	const track = await songs[trackID - 1];
	response.delete();

	// Display song
	const song = {
		id: track.videoId,
		title: Util.escapeMarkdown(track.title),
		views: String(track.views).padStart(10, ' '),
		url: track.url,
		ago: track.ago,
		duration: track.duration.toString(),
		img: track.image,
		req: message.author,
	};

	console.log(song);

	// Setup song
	await manageQueue(client, message, channel, serverQueue, song);
};

module.exports.config = {
	name: 'search',
	category: 'music',
};
