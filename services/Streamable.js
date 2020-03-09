const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
module.exports.findStreamable = async (shortcode) => {
	const response = await fetch(`https://api.streamable.com/videos/${shortcode}`);
	try{
        const clipData = await response.json();
		return `https:${clipData.files.mp4.url}`;
	}catch(e){
        return null;
    }
};
module.exports.saveStreamable = (url, post) => {
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