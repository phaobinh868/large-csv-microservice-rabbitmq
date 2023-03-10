import express from "express";
const app = express();
const PORT = process.env.PORT || 3001;
import * as dotenv from 'dotenv'
dotenv.config()
import { channelConsume } from "./libs/consume.js";
import { readCSV } from "./libs/csv.js";
import connectDB from "./db/mongo.js";

async function bootstrap() {
  await connectDB();
  await readCSV(process.env.DATA_FILE || "./transactions.csv");
  await channelConsume();
  app.listen(PORT, () => {
    console.log(`Data service listening on port ${PORT}`);
  });
}

bootstrap();