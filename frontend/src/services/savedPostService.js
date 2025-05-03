import api from './api';

export const savedPostService = {
    async savePost(post) {
        try {
            const response = await api.post('/saved-posts', post);
            return response.data;
        } catch (error) {
            console.error('Error saving post:', error);
            throw error;
        }
    },

    async getSavedPosts() {
        try {
            const response = await api.get('/saved-posts');
            return response.data;
        } catch (error) {
            console.error('Error fetching saved posts:', error);
            throw error;
        }
    },

    async deleteSavedPost(postId) {
        try {
            const response = await api.delete(`/saved-posts/${postId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting saved post:', error);
            throw error;
        }
    }
}; 