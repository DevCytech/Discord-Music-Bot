const { client } = require('../index');
const prefix = '!';

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
	if (command) command.callback({ client, message, args });
});
