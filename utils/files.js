// Variables
const { resolve } = require('path');
const { readdirSync, statSync } = require('fs');

// Get all files in a folder
module.exports.fetchFiles = (location, ptn) => {
	if (typeof location !== 'string' || typeof ptn !== 'string') {
		throw new Error(
			'Your path or pattern is an incorrect type. Please make sure you are sending a string.',
		);
	}

	// File only function
	function getFiles(path, pattern) {
		// Variables
		let results = [];
		const res = readdirSync(path);

		// Check each file
		for (const item of res) {
			const itm = resolve(path, item);
			const prop = statSync(itm);

			// Check directory
			if (prop.isDirectory()) {
				results = results.concat(getFiles(itm, pattern));
			}

			// Make sure file is a usable file
			if (prop.isFile() && itm.endsWith(pattern)) {
				if (!itm.includes('template')) results.push(itm);
			}
		}

		// Return data
		return results;
	}

	// Get giles and return
	try {
		const files = getFiles(location, ptn);
		return files;
	} catch (err) {
		throw new Error(
			`An error has occurred getting command files. Error: ${err}`,
		);
	}
};
