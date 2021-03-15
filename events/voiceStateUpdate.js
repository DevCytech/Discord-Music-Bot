const { client } = require('../index');

client.on('voiceStateUpdate', (oldMember, newMember) => {
	// Check if there is a queue
	const queue = client.queue.get(newMember.guild.id);
	if (!queue) {
		if (newMember.guild.me.voice.channelID) {
			return newMember.guild.me.voice.channel.leave();
		} else {
			return null;
		}
	}

	// Create channel variables
	const channel = newMember.channelID
		? newMember.guild.channels.cache.get(newMember.channelID)
		: newMember.guild.channels.cache.get(oldMember.channelID)
		? newMember.guild.channels.cache.get(oldMember.channelID)
		: null;

	// Make sure these are events to do with the bot
	if (newMember.id == client.user.id) {
		// Check if bot was disconnected
		if (!newMember.channelID) {
			queue.textChannel.send(
				'It seems I have been disconnected. I will now stop playing...',
			);
			newMember.guild.me.voice.channel.leave();
			return client.queue.delete(newMember.guild.id);
		}

		// Check if bot moved channels
		if (newMember.channelID !== queue.voiceChannel.id) {
			queue.voiceChannel = channel;
		}
	}

	// Check if bot was left alone
	if (channel.members.size <= 1 && queue.textChannel.guild.me.voice.channel) {
		queue.textChannel.send(
			'It seems there are no people listening. I will now stop playing...',
		);
		queue.textChannel.guild.me.voice.channel.leave();
		return client.queue.delete(queue.textChannel.guild.id);
	}
});
