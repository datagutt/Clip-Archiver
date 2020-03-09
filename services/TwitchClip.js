const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
module.exports.findTwitchClip = async (slug) => {
	const response = await fetch('https://gql.twitch.tv/gql', {
		method: 'POST',
		headers: { 'Client-Id': 'kimne78kx3ncx6brgo4mv6wki5h1ko' },
		body: JSON.stringify([{
			operationName: 'incrementClipViewCount',
			variables: { input: { slug: slug } },
			extensions: {
				persistedQuery: {
					version: 1,
					sha256Hash: '6b2f169f994f2b93ff68774f6928de66a1e8cdb70a42f4af3a5a1ecc68ee759b',
				},
			},
		}]),
	});
	const clipData = await response.json();
	if (clipData[0].errors) {
		return null;
	} else {
		return `${clipData[0].data.updateClipViewCount.clip.id}.mp4`;
	}
};
module.exports.saveTwitchClip = (name, post) => {
	const url = `https://clips-media-assets2.twitch.tv/AT-cm%7C${name}`;
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