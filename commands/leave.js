module.exports.callback = async ({ message }) => {
	// Make bot leave voice channel
	try {
		await message.guild.me.voice.channel.leave();
	} catch (error) {
		await message.guild.me.voice.kick(message.guild.me.id);
		return message.reply('Trying To Leave The Voice Channel...');
	}

	return message.reply('I have left the voice channel.');
};

module.exports.config = {
	name: 'leave',
	isPlaying: true,
	category: 'music',
	aliases: ['disconnect', 'go-away'],
};
