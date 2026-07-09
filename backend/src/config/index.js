import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 4000,
  googleMapsServerKey: process.env.GOOGLE_MAPS_SERVER_KEY,
  twitterBearerToken: process.env.TWITTER_BEARER_TOKEN,
  facebookPageAccessToken: process.env.FACEBOOK_PAGE_ACCESS_TOKEN,
  radioRssUrl: process.env.RADIO_STATION_RSS_URL,
  radioNewsUrl: process.env.RADIO_STATION_NEWS_URL,
  govStatsSources: (process.env.GOV_STATS_SOURCES || '').split(',').filter(Boolean),
  slackWebhookUrl: process.env.SLACK_WEBHOOK_URL,
  alertEmailTo: process.env.ALERT_EMAIL_TO,
  hereApiKey: process.env.HERE_API_KEY,
};
