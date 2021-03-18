const ytdl = require('ytdl-core');
const { opus: Opus, FFmpeg } = require('prism-media');
const YTDLEvents = [
	'info',
	'progress',
	'abort',
	'request',
	'response',
	'error',
	'redirect',
	'retry',
	'reconnect',
];

// Create the YouTube player
const YouTubePlayer = (url, opts) => {
	// Define player opts
	if (!url || typeof url !== 'string') {
		throw new Error(`input URL must be a string. Received ${typeof url}!`);
	}

	// Define player options
	let FFmpegArgs = [
		'-analyzeduration',
		'0',
		'-loglevel',
		'0',
		'-f',
		`${
			opts && opts.fmt && typeof opts.fmt == 'string' ? opts.fmt : 's16le'
		}`,
		'-ar',
		'48000',
		'-ac',
		'2',
	];

	// Allow the stream to be moveable
	if (opts && opts.seek && !isNaN(opts.seek)) {
		FFmpegArgs.unshift('-ss', opts.seek.toString());
	}

	// Change the way the stream is encoded, *filters*
	if (opts && opts.encoderArgs && Array.isArray(opts.encoderArgs)) {
		FFmpegArgs = FFmpegArgs.concat(opts.encoderArgs);
	}

	// Create and control the stream
	const streamDispatcher = new FFmpeg({
		args: FFmpegArgs,
	});

	// Deal with the incoming stream
	const stream = ytdl(url, opts);
	const output = stream.pipe(streamDispatcher);

	// Manage FFMPEG
	if (opts && !opts.opusEncoded) {
		for (const event of YTDLEvents) {
			stream.on(event, (...args) => output.emit(event, ...args));
		}
		stream.on('error', () => streamDispatcher.destroy());
		output.on('close', () => streamDispatcher.destroy());
		return output;
	}

	// Manage OPUS streams below
	const opus = new Opus.Encoder({
		rate: 48000,
		channels: 2,
		frameSize: 960,
	});

	// Define output and pipe it out
	const outputStream = output.pipe(opus);

	// Setup events
	for (const event of YTDLEvents) {
		stream.on(event, (...args) => outputStream.emit(event, ...args));
	}

	// Manage errors
	outputStream.on('close', () => {
		streamDispatcher.destroy();
		opus.destroy();
	});
	return outputStream;
};

// Everywhere but YouTube
/* const ExternalPlayer = (stream, opts) => {
	if (!stream) {
		throw new Error('No stream source found.');
	}

	// Define player options
	let FFmpegArgs = [];
	if (typeof stream === 'string') {
		FFmpegArgs = [
			'-reconnect',
			'1',
			'-reconnect_streamed',
			'1',
			'-reconnect_delay_max',
			'5',
			'-i',
			stream,
			'-analyzeduration',
			'0',
			'-loglevel',
			'0',
			'-f',
			`${
				opts && opts.fmt && typeof opts.fmt == 'string'
					? opts.fmt
					: 's16le'
			}`,
			'-ar',
			'48000',
			'-ac',
			'2',
		];
	} else {
		FFmpegArgs = [
			'-analyzeduration',
			'0',
			'-loglevel',
			'0',
			'-f',
			`${
				opts && opts.fmt && typeof opts.fmt == 'string'
					? opts.fmt
					: 's16le'
			}`,
			'-ar',
			'48000',
			'-ac',
			'2',
		];
	}

	// Allow the stream to be moveable
	if (opts && opts.seek && !isNaN(opts.seek)) {
		FFmpegArgs.unshift('-ss', opts.seek.toString());
	}

	// Change the way the stream is encoded, *filters*
	if (opts && opts.encoderArgs && Array.isArray(opts.encoderArgs)) {
		FFmpegArgs = FFmpegArgs.concat(opts.encoderArgs);
	}

	// Create and control the stream
	let streamDispatcher = new FFmpeg({
		args: FFmpegArgs,
	});

	// Create Stream
	if (typeof stream !== 'string') {
		streamDispatcher = stream.pipe(streamDispatcher);
		stream.on('error', () => streamDispatcher.destroy());
	}

	// Manage FFmpeg
	if (opts && !opts.opusEncoded) {
		streamDispatcher.on('close', () => streamDispatcher.destroy());
		return streamDispatcher;
	}

	// Manage OPUS streams below
	const opus = new Opus.Encoder({
		rate: 48000,
		channels: 2,
		frameSize: 960,
	});

	// Define output and pipe it out
	const outputStream = streamDispatcher.pipe(opus);

	// Setup events
	for (const event of YTDLEvents) {
		stream.on(event, (...args) => outputStream.emit(event, ...args));
	}

	// Manage errors
	outputStream.on('close', () => {
		streamDispatcher.destroy();
		opus.destroy();
	});
	return outputStream;
};
*/

// Send players
module.exports.YouTubePlayer = YouTubePlayer;
// module.exports.ExternalPlayer = ExternalPlayer;
