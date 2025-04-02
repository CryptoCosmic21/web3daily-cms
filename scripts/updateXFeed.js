/**
 * updateXFeed.js
 *
 * This script fetches the latest RSS post from each Nitter feed and posts the mapped data
 * to Strapi at:
 *   https://web3daily-cms-production.up.railway.app/api/xes
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
 * Field names must match exactly your Strapi content type.
 */
async function mapRssItemToStrapiFields(item) {
  return {
    Username: item.creator || 'Unknown',
    DisplayName: item.title || 'No display name',
    Avatar: '', // No avatar data provided by RSS
    TweetText: item.contentSnippet || 'No tweet content',
    DatePosted: item.isoDate || new Date().toISOString(),
    Likes: 0,
    Retweets: 0,
    TweetURL: item.link || '',
    // Setting publishedAt ensures the entry is published
    publishedAt: new Date().toISOString(),
    // For relational fields, we send empty arrays when no data is provided.
    Hashtag: [],
    Mentions: []
  };
}

/**
 * Fetch the latest tweet (first item) from each specified RSS feed.
 */
async function fetchLatestTweets() {
  const latestTweets = [];
  for (const feedUrl of NITTER_RSS_FEEDS) {
    try {
      console.log(`Fetching RSS from ${feedUrl}...`);
      const feed = await parser.parseURL(feedUrl);
      if (feed.items && feed.items.length > 0) {
        // Assuming the feed is sorted with the latest item first.
        latestTweets.push(feed.items[0]);
      } else {
        console.warn(`No items found for feed ${feedUrl}`);
      }
    } catch (err) {
      console.error(`Error fetching/parsing RSS from ${feedUrl}:`, err);
    }
  }
  return latestTweets;
}

/**
 * Post a single tweet's mapped data to Strapi.
 */
async function postTweetToStrapi(tweetData) {
  try {
    const res = await axios.post('https://web3daily-cms-production.up.railway.app/api/xes', {
      data: tweetData
    });
    console.log(`Posted tweet: ${tweetData.TweetURL} with ID: ${res.data.data?.id}`);
  } catch (err) {
    console.error(
      `Error posting tweet ${tweetData.TweetURL}:`,
      err.response ? err.response.data : err.message
    );
  }
}

/**
 * Main function to fetch the latest tweets and post them to Strapi.
 */
async function updateXFeed() {
  const tweets = await fetchLatestTweets();
  console.log(`Fetched ${tweets.length} latest tweets.`);
  for (const tweet of tweets) {
    const mappedData = await mapRssItemToStrapiFields(tweet);
    console.log('Mapped tweet data:', mappedData);
    await postTweetToStrapi(mappedData);
  }
}

updateXFeed()
  .then(() => console.log("X Feed update completed."))
  .catch((err) => console.error("Unexpected error:", err));

module.exports = { updateXFeed };
