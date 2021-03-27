const { KSoftClient } = require('@ksoft/api');

module.exports.callback = async ({ client, message, args }) => {
	// Search for the song
	let search = args.slice(0).join(' ');
	if (!search) {
		const queue = client.queue.get(message.guild.id);

		if (!queue || !queue.playing || !queue.songs.length) {
			return message.reply(
				'Please provide a song you would like me to get the lyrics for.\nBeing Descriptive with the author is very helpful aswell.',
			);
		} else {
			search = queue.songs[0].title;
		}
	}

	// Get lyrics
	const route = new KSoftClient(process.env.KSOFT_KEY);
	if (!route) throw new Error('No KSoft API found.');
	const response = await route.lyrics.get(search);

	// Make sure there are lyrics
	if (!response) {
		return message.reply(
			'I could not find that song mate. Maybe try specifying the artist.',
		);
	}

	// Get song properties
	const { lyrics, name: title, artist } = response;
	const splitLyrics = [
		lyrics.slice(0, 1800),
		lyrics.slice(1800, 3600),
		lyrics.slice(3600, 5200),
		lyrics.slice(5200, 7000),
		lyrics.slice(7000, 8800),
	];

	// Build lyrics
	if (lyrics.length < 1800) {
		return message.channel.send(
			`**${title}** by **${artist.name}**\n\n${lyrics} \n\nPowered by Ksoft.si`,
		);
	} else {
		// Send message
		const msg = await message.channel.send(
			`**${title}** by **${artist.name}**\n\n${splitLyrics[0]} \n\nPowered by Ksoft.si`,
		);

		// React to the message
		await msg.react('◀');
		await msg.react('▶');

		// Collector filters
		const filter = (reaction, user) => {
			return (
				(reaction.emoji.name === '▶' &&
					user.id === message.author.id) ||
				(reaction.emoji.name === '◀' && user.id === message.author.id)
			);
		};

		// Create the collector
		let page = 0;
		const pages = splitLyrics.filter((l) => l !== '').length - 1;
		const collector = msg.createReactionCollector(filter, { time: 120000 });
		collector.on('collect', async (reaction) => {
			if (page === pages) {
				if (reaction.emoji.name === '▶') {
					msg.edit('There are no more lyrics..');
					msg.reactions.resolve('▶').users.remove(message.author.id);
				} else if (reaction.emoji.name === '◀') {
					msg.edit(
						`**${title}** by **${artist.name}**\n\n${
							splitLyrics[--page]
						} \n\nPowered by Ksoft.si`,
					);
					msg.reactions.resolve('◀').users.remove(message.author.id);
				} else {
					return;
				}
			} else if (reaction.emoji.name === '▶') {
				msg.edit(
					`**${title}** by **${artist.name}**\n\n${
						splitLyrics[++page]
					} \n\nPowered by Ksoft.si`,
				);
				msg.reactions.resolve('▶').users.remove(message.author.id);
			} else if (reaction.emoji.name === '◀') {
				msg.edit(
					`**${title}** by **${artist.name}**\n\n${
						splitLyrics[--page]
					} \n\nPowered by Ksoft.si`,
				);
				msg.reactions.resolve('◀').users.remove(message.author.id);
			} else {
				return;
			}
		});
	}
};

module.exports.config = {
	name: 'lyrics',
	category: 'music',
};
