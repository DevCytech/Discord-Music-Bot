const { play } = require('../utils/play');
const filters = require('../utils/filters.json');

module.exports.callback = async ({ client, message, args, serverQueue }) => {
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
	isPlaying: true,
	category: 'music',
	aliases: ['filter'],
};
