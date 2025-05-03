# Creator Platform

A full-stack social content aggregation platform built with React, Node.js, and MongoDB that integrates with Reddit API and includes a credit-based reward system.

## Features

### User Features
- 🔐 Secure authentication with JWT
- 👤 Profile management with completion rewards
- 📱 Responsive design for all devices
- 📊 Personal dashboard with activity metrics
- 💰 Credit system with rewards for engagement
- 🔍 Content search and filtering
- 📑 Save and manage favorite posts
- 🚩 Report inappropriate content
- 🌓 Theme customization options
- 🔔 Notification preferences

### Content Features
- 🤖 Reddit integration for content aggregation
- 🔄 Real-time content updates
- 🏷️ Content categorization and tagging
- 📈 Engagement metrics (likes, shares, comments)
- 🔍 Advanced content search and filtering
- 📱 Mobile-optimized content display
- 🌐 Multi-language support

### Admin Features
- 👥 User management dashboard
- 📊 Analytics and reporting
- 🛠️ Content moderation tools
- 💳 Credit management system
- 📈 User engagement tracking
- 🚩 Report management system


## Running Locally

### Prerequisites
- Node.js 18 or higher
- MongoDB
- Reddit API credentials
- Git

### Backend Setup
1. Clone the repository
   ```bash
   git clone https://github.com/Coder-Madaan/creator-platform
   cd creator-platform/backend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create .env file in the backend directory
   ```env
   PORT=5000
   JWT_SECRET=your_jwt_secret
   MONGODB_URI=your_mongodb_uri
   REDDIT_CLIENT_ID=your_reddit_client_id
   REDDIT_CLIENT_SECRET=your_reddit_client_secret
   FRONTEND_URL=http://localhost:5173   //or whatever url frontend is running on.
   ```

4. Start the backend server
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to frontend directory
   ```bash
   cd ../frontend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- note: for first admin make the admin through the database in mongodb then you an view the admin dashboard. 

## Tech Stack

### Frontend
- React with Vite
- Chakra UI for components
- Framer Motion for animations
- React Router for navigation
- Axios for API requests
- React Icons
- Date-fns for date formatting
- JWT decode for authentication

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- Reddit API integration
- Express middleware for security
