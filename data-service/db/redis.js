import { createClient } from 'redis';
import * as dotenv from 'dotenv'
dotenv.config()
console.log("danh")
const client = await createClient({
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
});
console.log("danh1")
await client.connect();
export default client
