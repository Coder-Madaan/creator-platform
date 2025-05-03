import axios from 'axios';
import { config } from '../config/config.js';
// import redisClient from './redisClient.js';

class RedditService {
    constructor() {
        this.accessToken = null;
        this.tokenExpiration = null;
    }

    async getAccessToken() {
        if (this.accessToken && this.tokenExpiration && Date.now() < this.tokenExpiration) {
            return this.accessToken;
        }

        try {
            const response = await axios.post(
                `${config.reddit.baseUrl}/access_token`,
                'grant_type=client_credentials',
                {
                    auth: {
                        username: config.reddit.clientId,
                        password: config.reddit.clientSecret
                    },
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            this.accessToken = response.data.access_token;
            this.tokenExpiration = Date.now() + (response.data.expires_in * 1000);
            return this.accessToken;
        } catch (error) {
            console.error('Error getting Reddit access token:', error);
            throw new Error('Failed to authenticate with Reddit');
        }
    }

    async getPosts(subreddit, limit = 25) {
        try {
            const token = await this.getAccessToken();
            const response = await axios.get(
                `${config.reddit.apiUrl}/r/${subreddit}/hot.json?limit=${limit}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'User-Agent': 'CreatorPlatform/1.0.0'
                    }
                }
            );

            return response.data.data.children.map(post => ({
                id: post.data.id,
                title: post.data.title,
                author: post.data.author,
                score: post.data.score,
                url: post.data.url,
                created_utc: post.data.created_utc,
                subreddit: post.data.subreddit,
                permalink: `https://reddit.com${post.data.permalink}`,
                thumbnail: post.data.thumbnail,
                num_comments: post.data.num_comments
            }));
        } catch (error) {
            console.error('Error fetching Reddit posts:', error);
            throw new Error('Failed to fetch Reddit posts');
        }
    }
}

export const redditService = new RedditService(); 