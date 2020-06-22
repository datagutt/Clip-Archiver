const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
module.exports.findTwitchClip = async (slug) => {
	const response = await fetch('https://gql.twitch.tv/gql', {
		method: 'POST',
		headers: { 'Client-Id': 'kimne78kx3ncx6brgo4mv6wki5h1ko' },
		body: JSON.stringify([{
			operationName: 'VideoAccessToken_Clip',
			variables: { slug: slug },
			extensions: {
				persistedQuery: {
					version: 1,
					sha256Hash: '9bfcc0177bffc730bd5a5a89005869d2773480cf1738c592143b5173634b7d15',
				},
			},
		}]),
	});
	const clipData = await response.json();
	if (clipData[0].errors) {
		return null;
	} else {
		return `${clipData[0].data.clip.videoQualities[0].sourceURL}`;
	}
};
module.exports.saveTwitchClip = (url, post) => {
	fetch(url)
		.then(res => new Promise((resolve, reject) => {
			const dest = fs.createWriteStream(path.join(__dirname, `..`, path.sep, 'videos', path.sep, `${post.title}_${post.id}.mp4`));
			res.body.pipe(dest);
			dest.on('close', () => {
				console.log(`Clip for ${post.id} has been downloaded.`)
				resolve()
			});
			dest.on('error', reject);
		}));
};