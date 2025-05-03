import api from './api';

export const redditService = {
    async getPosts(subreddit = 'all', limit = 25) {
        try {
            const response = await api.get(`/reddit/posts/${subreddit}`, {
                params: { limit }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching Reddit posts:', error);
            throw error;
        }
    }
}; 