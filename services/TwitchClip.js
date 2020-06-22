const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
module.exports.findTwitchClip = findTwitchClip = async (slug) => {
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
// If using second url format, we need different information
module.exports.findTwitchClip2 = findTwitchClip2 = async (slug) => {
	const response = await fetch('https://gql.twitch.tv/gql', {
		method: 'POST',
		headers: {'Client-Id': 'kimne78kx3ncx6brgo4mv6wki5h1ko'},
		body: JSON.stringify([{
			operationName: 'ChannelClipCore',
			variables: {clipSlug: slug},
			extensions: {
				persistedQuery: {
					version: 1,
					sha256Hash: '9db7fcdea95b00a598aac2d05baa73a513370bac4bd9a192214578ff70fe480b',
				},
			},
		}]),
	});
	const clipData = await response.json();
	if (clipData[0].errors) {
		return null;
	} else {
		return `${clip2Data.id}-offset-${clip2Data.videoOffsetSeconds}.mp4`;
	}
};

module.exports.download = download = (res, post) => {
	const dest = fs.createWriteStream(path.join(__dirname, `..`, path.sep, 'videos', path.sep, `${post.title}_${post.id}.mp4`));
	res.body.pipe(dest);
	dest.on('close', () => {
		console.log(`Clip for ${post.id} has been downloaded.`)
		resolve()
	});
	dest.on('error', reject);
};

module.exports.saveTwitchClip = (slug, name, post) => {
	const url = `https://clips-media-assets2.twitch.tv/AT-cm%7C${name}`;
	fetch(url)
		.then(res => new Promise((resolve, reject) => {
			// If this is an invalid clip url, try fetching it in a different way
			// It might be expecting an offset
			if(res.statusCode === 403){
				const clip2Name = findTwitchClip2(slug);
				const url2 = `https://clips-media-assets2.twitch.tv/${clip2Name}`;
				fetch(url2)
				.then(res => new Promise((resolve, reject) => {
					download(res, post)
				}));
			}else{
				download(res, post);
			}
		}));
};