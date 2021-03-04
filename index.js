// Setup environment
require('dotenv').config();

// Setup client
const { Client, Collection } = require('discord.js');
const client = new Client();
client.login(process.env.TOKEN);
module.exports.client = client;

// Setup music
client.queue = new Map();

// Setup commands
const { fetchFiles } = require('./utils/files');
const commandFiles = fetchFiles('./commands', '.js');
client.categories = new Collection();
client.commands = new Collection();
client.aliases = new Collection();
const categories = [];

for (const path of commandFiles) {
	// Get the file
	const file = require(path);

	// Check the command
	if (!file || !file.config || !file.callback) continue;

	// Destructuring the config
	const { name, aliases, category } = file.config;

	// Check the config
	if (!name) continue;

	// Set commands
	client.commands.set(name, file);
	if (name.includes('-')) client.aliases.set(name.replace(/-/g, ''), file);

	if (aliases) {
		// If there are multiple aliases in an array
		if (typeof aliases == 'object') {
			for (const alias of aliases) {
				client.aliases.set(alias, file);
				if (alias.includes('-')) {
					client.aliases.set(alias.replace(/-/g, ''), file);
				}
			}
		}
		// If it is a single alias in a string
		if (typeof aliases == 'string') {
			client.aliases.set(aliases, file);
			if (aliases.includes('-')) {
				client.aliases.set(aliases.replace(/-/g, ''), file);
			}
		}
	}

	// Store the category
	if (category && !categories.includes(category)) {
		categories.push(category);
		client.categories.set(name, category);
	}
}

// Setup events
const eventFiles = fetchFiles('./events', '.js');
for (const event of eventFiles) require(event);

// Log events and commands loaded
console.log(
	`${categories.length} categor${
		categories.length == 1 ? 'y has' : 'ies have'
	} been loaded.`,
);
console.log(
	`${client.commands.size} command${
		client.commands.size == 1 ? ' has' : 's have'
	} been loaded.`,
);
console.log(
	`${eventFiles.length} event${
		eventFiles.length == 1 ? ' has' : 's have'
	} loaded.`,
);
