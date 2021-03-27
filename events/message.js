const prefix = '!';
const { client } = require('../index');

client.on('message', (message) => {
	// Make sure it starts with prefix, it is not a bot, or dm
	if (!message.content.startsWith(prefix)) return;
	if (message.channel.type === 'dm' || message.channel.bot) return;
	const [cmd, ...args] = message.content.slice(prefix.length).split(/\s+/g);

	// Remove spaces
	for (const arg of args) {
		if (arg === '') args.splice(args.indexOf(arg), 1);
	}

	// Get and run command
	const command = client.commands.get(cmd) || client.aliases.get(cmd);
	let serverQueue = null;

	if (command.config.isPlaying) {
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
		serverQueue = client.queue.get(message.guild.id);
		if (!serverQueue) return message.reply('There is nothing playing.');

		// Check if the bot is playing
		if (!serverQueue.playing) {
			return message.reply('Music is currently not playing.');
		}
	}

	if (command) command.callback({ client, message, args, serverQueue });
});
