/*
	--- Clip Archiver ---
	Saves clips (Twitch, Streamable, NeatClip) from a subreddit
	by datagutt
*/
	
const { SubmissionStream } = require('snoostorm');
const Snoowrap = require('snoowrap');
const credentials = require('./credentials.json');
const fs = require('fs');
const path = require('path');

const { findStreamable, saveStreamable } = require('./services/Streamable');

const { findTwitchClip, saveTwitchClip } = require('./services/TwitchClip');

const TWITCH_CLIP_REGEX = /https?:\/\/(?:clips\.twitch\.tv\/(?:embed\?.*?\bclip=|(?:[^/]+\/)*)|(?:www\.)?twitch\.tv\/[^/]+\/clip\/)([a-zA-Z]+)/;
const STREAMABLE_REGEX = /https?:\/\/streamable\.com\/([a-zA-Z0-9]+)/i;

// Check for videos dir
const dir = './videos';

if (!fs.existsSync(dir)) {
	fs.mkdirSync(dir);
}

const client = new Snoowrap(credentials);

const submissionStream = new SubmissionStream(
	client,
	{
		'subreddit': 'livestreamnorge',
		limit: 20,
		pollTime: 2000
	});

submissionStream.on('item', async (post) => {
	console.log(`New post! ${post.id}`);
	// If post has already been saved, ignore
	if(fs.existsSync(path.join(__dirname, 'videos', path.sep, `${post.title}_${post.id}.mp4`))){
		console.log(`Clip for ${post.id} already downloaded, skipping.`);
		return;
	}

	const twitchClipUrl = post.url.match(TWITCH_CLIP_REGEX);
	if (twitchClipUrl && twitchClipUrl[1]) {
		let clipName = await findTwitchClip(twitchClipUrl[1]);
		if (clipName) {
			console.log(`Clip for ${post.id} found, downloading ${clipName}`);
			saveTwitchClip(twitchClipUrl[1], clipName, post);
		} else {
			console.log(`Clip for ${post.id} not found, it might have been removed from Twitch.`);
		}
	}
	
	const streamableUrl = post.url.match(STREAMABLE_REGEX);
	if (streamableUrl && streamableUrl[1]) {
		let clipName = await findStreamable(streamableUrl[1]);
		if (clipName) {
			console.log(`Clip for ${post.id} found, downloading ${clipName}`);
			saveStreamable(clipName, post);
		} else {
			console.log(`Clip for ${post.id} not found, it might have been removed from Streamable.`);
		}
	}
});

process.on('SIGINT', function () {
	console.log('Shutting down, this will take a second...');
	submissionStream.end();
	setTimeout(() => {
		process.exit();
	}, 5000);
});
