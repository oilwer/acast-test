const express = require('express')
const bodyParser = require('body-parser')
const Parser = require('rss-parser')
const crypto = require('crypto')
const request = require('request')
const app = express()

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

const port = 3000

let parser = new Parser();

fetchRssFeed = async (rssFeedUrl) => {
  return await parser.parseURL(rssFeedUrl);
}

createMp3Checksum = async (mp3Url) => {
  const createChecksum = new Promise((resolve, reject) => {
    request
    .get(mp3Url)
    .on('response', (response) => {
      var hash = crypto.createHash('md5');

      response.on('data', function (chunk) {
        hash.update(chunk, 'utf8')
      });
      response.on('end', function () {
        const checksum = hash.digest('hex')
        resolve(checksum);
      });
    });
  });

  return await createChecksum;
}

app.post('/rss/episodes', async (req, res) => {
  if(!req.body.rss_url) {
    res.status(400);
    res.json({error: "No RSS Url recieved"});
  }

	const rssUrl = req.body.rss_url
	const episodeLimit = req.body.limit

  // TODO: Create skip-option.

  // Fetches RSS Feed
  const rssFeed = await fetchRssFeed(rssUrl);

  let episodes = rssFeed.items;

  // If we have a Episode Limit -> Change length of response. Default: 10
  if(episodeLimit) episodes.length = episodeLimit;
  else episodes.length = 10;

  let result = [];

  // Loop through all episodes and generate a checksum of each Mp3 file
  for (let i = 0; i < episodes.length; i++) {
    const episode = episodes[i];
    const mp3 = episode.enclosure;

    const checksum = await createMp3Checksum(mp3.url);
    const { link, pubDate, content, contentSnippet, guid, itunes, isoDate, enclosure, ...strippedEpisode } = episode;

    strippedEpisode["checksum"] = checksum;
    strippedEpisode["url"] = mp3.url;
    result.push(strippedEpisode);
  };

  // If result is populated send 200 and result
  if(result.length > 0) {
    res.status(200);
    res.json(result);
  }
  else {
    res.status(400);
    res.json("Unexpected error");
  }
})

app.listen(port, () => console.log(`Acast @ ${port}`))

module.exports = {
  fetchRssFeed,
  createMp3Checksum
}
