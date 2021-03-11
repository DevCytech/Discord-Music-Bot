const { MessageEmbed } = require('discord.js');

module.exports.callback = async ({ client, message }) => {
	const permissions = message.channel.permissionsFor(message.client.user);
	if (permissions.has(['MANAGE_MESSAGES', 'ADD_REACTIONS'])) {
		return message.reply(
			'I am missing permission to manage messages or add reactions.',
		);
	}

	// Get the server queue
	const serverQueue = client.queue.get(message.guild.id);
	if (!serverQueue) return message.reply('There is nothing playing.');
	let currentPage = 0,
		k = 10;

	const e = new MessageEmbed()
		.setTitle(`${message.guild.name} Queue`)
		.setColor('BLUE')
		.addField('Now Playing', serverQueue.textChannel, true)
		.addField('Text Channel', serverQueue.textChannel, true)
		.addField('Voice Channel', serverQueue.textChannel, true)
		.setFooter(`Current music volume is ${serverQueue.volume}`);

	const embeds = [];
	for (let i = 0; i < serverQueue.length; i += 10) {
		const current = serverQueue.slice(i, k);
		let j = 1;
		k += 10;

		const tracks = current
			.map(
				(track) =>
					`**\`${++j}\`** | [\`${track.title}\`](${track.url})`,
			)
			.join('\n');
		embeds.push(e.setDescription(tracks));
	}

	// Send embed
	const queueEmbed = await message.channel.send(
		`**\`${currentPage + 1}\`**/**${embeds.length}**`,
		embeds[currentPage],
	);

	try {
		await queueEmbed.react('⬅️');
		await queueEmbed.react('🛑');
		await queueEmbed.react('➡️');
	} catch (error) {
		console.error(error);
		message.channel.send(error.message).catch(console.error);
	}

	const filter = (reaction, user) =>
		['⬅️', '🛑', '➡️'].includes(reaction.emoji.name) &&
		message.author.id === user.id;
	const collector = queueEmbed.createReactionCollector(filter, {
		time: 60000,
	});

	collector.on('collect', async (reaction) => {
		try {
			if (reaction.emoji.name === '➡️') {
				if (currentPage < embeds.length - 1) {
					currentPage++;
					queueEmbed.edit(
						`**\`${currentPage + 1}\`**/**${embeds.length}**`,
						embeds[currentPage],
					);
				}
			} else if (reaction.emoji.name === '⬅️') {
				if (currentPage !== 0) {
					--currentPage;
					queueEmbed.edit(
						`**\`${currentPage + 1}\`**/**${embeds.length}**`,
						embeds[currentPage],
					);
				}
			} else {
				collector.stop();
				reaction.message.reactions.removeAll();
			}
			await reaction.users.remove(message.author.id);
		} catch (error) {
			console.error(error);
			return message.channel.send(error.message).catch(console.error);
		}
	});
};

module.exports.config = {
	name: 'queue',
	aliases: ['q', 'list', 'song-list'],
	category: 'music',
};
