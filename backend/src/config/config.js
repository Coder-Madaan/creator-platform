import dotenv from 'dotenv';

dotenv.config();

export const config = {
    reddit: {
        clientId: process.env.REDDIT_CLIENT_ID,
        clientSecret: process.env.REDDIT_CLIENT_SECRET,
        baseUrl: 'https://www.reddit.com/api/v1',
        apiUrl: 'https://oauth.reddit.com'
    }
}; 