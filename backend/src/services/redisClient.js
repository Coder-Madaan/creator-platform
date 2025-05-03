// import { createClient } from 'redis';
// import dotenv from 'dotenv';
// dotenv.config();

// const redisClient = createClient({
//   url: "redis-14508.crce179.ap-south-1-1.ec2.redns.redis-cloud.com:14508",
// });

// redisClient.on('error', (err) => {
//   console.error('❌ Redis connection error:', err);
// });

// (async () => {
//   try {
//     await redisClient.connect();
//     console.log('✅ Connected to Redis');
//   } catch (err) {
//     console.error('❌ Redis connection failed:', err);
//   }
// })();

// export default redisClient;
