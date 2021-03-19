const filters = require('../utils/filters.json');
const { play } = require('../utils/play');

module.exports.callback = async ({ client, message, args }) => {
	// Check voice channel
	const channel = message.member.voice.channel;
	if (!channel) {
		return message.reply(
			'Please join a voice channel to use this command.',
		);
	}

	// Make sure the bot if in a voice channel
	if (!message.guild.me.voice.channel) {
		return message.reply('I am not currently playing music!');
	}

	// Make sure they are in the same voice channel
	if (channel.id !== message.guild.me.voice.channel.id) {
		return message.reply(
			'Please join the same voice channel as me to use this command.',
		);
	}

	// Get the server queue
	const serverQueue = client.queue.get(message.guild.id);
	if (!serverQueue) return message.reply('There is nothing playing.');

	// Check to see if argument is a filter
	if (!args[0] || !filters[args[0].toLowerCase()]) {
		return message.reply(
			`Support filters include: sway, nightcore, antinightcore, phaser, fade, subboost, and bassboost. \nActive Filters: ${serverQueue.filters.join(
				', ',
			)}`,
		);
	}

	// Toggle filter
	if (!serverQueue.filters[args[0].toLowerCase()]) {
		serverQueue.filters.push(args[0]);
		client.queue.set(message.guild.id, serverQueue);
		message.channel.send(
			`I have enabled the \`${args[0].toUpperCase()}\` filter!`,
		);
		play(serverQueue, true);
	} else {
		serverQueue.filters.splice(serverQueue.filters.indexOf(args[0]), 1);
		message.channel.send(
			`I have disabled the \`${args[0].toUpperCase()}\` filter!`,
		);
		play(serverQueue, true);
	}
};

module.exports.config = {
	name: 'filters',
	aliases: ['filter'],
	category: 'music',
};
