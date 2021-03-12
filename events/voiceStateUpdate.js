const { client } = require('../client');

client.on('voiceStateUpdate', (oldMember, newMember) => {
	const queue = client.queue.get(newMember.guild.id);
		
	// If bot has moved channels
	if (newMember.user.id === client.user.id && newMember.voice.channel !== queue.voiceChannel) {
		queue.voiceChannel = newMeber.voice.channel;
		client.queue.set(newMember.guild.id, queue);
	}
}
