const evn = [
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
const ytdl = require('ytdl-core');
const { opus: Opus, FFmpeg } = require('prism-media');

// Create the YouTube player
const YouTubePlayer = (url, opts) => {
	if (!url) {
		throw new Error('No input url provided');
	}
	if (typeof url !== 'string') {
		throw new SyntaxError(
			`input URL must be a string. Received ${typeof url}!`,
		);
	}

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

	if (opts && opts.seek && !isNaN(opts.seek)) {
		FFmpegArgs.unshift('-ss', opts.seek.toString());
	}

	if (opts && opts.encoderArgs && Array.isArray(opts.encoderArgs)) {
		FFmpegArgs = FFmpegArgs.concat(opts.encoderArgs);
	}

	const dispatcher = new FFmpeg({
		args: FFmpegArgs,
	});

	const originalStream = ytdl(url, opts);
	const stream = originalStream.pipe(dispatcher);
	if (opts && !opts.opusEncoded) {
		for (const event of evn) {
			originalStream.on(event, (...args) => stream.emit(event, ...args));
		}
		originalStream.on('error', () => dispatcher.destroy());
		stream.on('close', () => dispatcher.destroy());
		return stream;
	}

	const opus = new Opus.Encoder({
		rate: 48000,
		channels: 2,
		frameSize: 960,
	});

	const streamStream = stream.pipe(opus);

	for (const event of evn) {
		originalStream.on(event, (...args) =>
			streamStream.emit(event, ...args),
		);
	}

	streamStream.on('close', () => {
		dispatcher.destroy();
		opus.destroy();
	});
	return streamStream;
};

// Everywhere but YouTube
const ExternalPlayer = (stream, opts) => {
	if (!stream) {
		throw new Error('No stream source found.');
	}

	// Define player opts
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

	// Define stream and pipe it out
	const streamStream = streamDispatcher.pipe(opus);

	// Setup events
	for (const event of evn) {
		stream.on(event, (...args) => streamStream.emit(event, ...args));
	}

	// Manage errors
	streamStream.on('close', () => {
		streamDispatcher.destroy();
		opus.destroy();
	});
	return streamStream;
};

// Send players
module.exports.YouTubePlayer = YouTubePlayer;
module.exports.ExternalPlayer = ExternalPlayer;
