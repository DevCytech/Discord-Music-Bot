module.exports.callback = async ({ client, message }) => {
	// Check voice channel
	const channel = message.member.voice.channel;
	if (!channel) {
		return message.reply(
			'Please join a voice channel to use this command.',
		);
	}
	
	// Make sure bot is in a voice channel
	if (!message.guild.me.voice.channel) {
		return message.reply(
			'I am not currently playing any music.',
		)
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
	
	// Make bot leave voice channel
	try {
            await message.guild.me.voice.channel.leave();
        } catch (error) {
            await message.guild.me.voice.kick(message.guild.me.id);
            return message.reply("Trying To Leave The Voice Channel...");
        }

	return message.reply(
		'I have left the voice channel.',
	);
};

module.exports.config = {
	name: 'leave',
	aliases: ['disconnect', 'go-away'],
	category: 'music',
};
