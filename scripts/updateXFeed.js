/**
 * updateXFeed.js
 *
 * This script fetches RSS feeds from Nitter for the specified users and
 * posts the mapped data to Strapi at:
 *   https://web3daily-cms.onrender.com/api/xes
 *
 * Make sure you have installed axios and rss-parser:
 *   npm install axios rss-parser
 */

const axios = require('axios');
const Parser = require('rss-parser');
const parser = new Parser();

// List of Nitter RSS feeds for the Twitter users you follow.
const NITTER_RSS_FEEDS = [
  'https://nitter.poast.org/orionas_cosmos/rss',
  'https://nitter.poast.org/tonyler_/rss'
];

/**
 * Map an RSS feed item to the payload expected by your Strapi "X" collection.
 * 
 * Note: For Strapi repeatable components (Hashtag and Mentions), we send an array
 * of objects. Here they are empty but can be filled after parsing tweet text.
 */
function mapRssItemToStrapiFields(item) {
  return {
    Username: item.creator || 'Unknown',
    DisplayName: item.title || 'No display name',
    Avatar: '', // No avatar data from RSS; later you might upload a default image.
    TweetText: item.contentSnippet || 'No tweet content',
    DatePosted: item.isoDate || new Date().toISOString(),
    Likes: 0,
    Retweets: 0,
    Hashtag: [], // Expecting an array of objects, e.g. [{ hashtag: "#example" }]
    TweetURL: item.link || '',
    Mentions: [] // Expecting an array of objects, e.g. [{ handle: "@example" }]
  };
}

/**
 * Fetch all tweets from the specified RSS feeds.
 */
async function fetchTweets() {
  const allTweets = [];
  for (const feedUrl of NITTER_RSS_FEEDS) {
    try {
      console.log(`Fetching RSS from ${feedUrl}...`);
      const feed = await parser.parseURL(feedUrl);
      allTweets.push(...feed.items);
    } catch (err) {
      console.error(`Error fetching/parsing RSS from ${feedUrl}:`, err);
    }
  }
  return allTweets;
}

/**
 * Post a single tweet's mapped data to Strapi.
 */
async function postTweetToStrapi(tweetData) {
  try {
    const res = await axios.post('https://web3daily-cms.onrender.com/api/xes', {
      data: tweetData
    });
    console.log(`Posted tweet: ${tweetData.TweetURL} with ID: ${res.data.data?.id}`);
  } catch (err) {
    console.error(`Error posting tweet ${tweetData.TweetURL}:`, err.response ? err.response.data : err.message);
  }
}

/**
 * Main function to fetch tweets and post them to Strapi.
 */
async function updateXFeed() {
  const tweets = await fetchTweets();
  console.log(`Fetched ${tweets.length} tweets.`);
  for (const tweet of tweets) {
    const mappedData = mapRssItemToStrapiFields(tweet);
    console.log('Mapped tweet data:', mappedData);
    await postTweetToStrapi(mappedData);
  }
}

updateXFeed()
  .then(() => console.log("X Feed update completed."))
  .catch((err) => console.error("Unexpected error:", err));

module.exports = { updateXFeed };
