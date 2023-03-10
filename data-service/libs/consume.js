import { connectRabbitMQ, createRabbitMQChannel } from "./rmq.js";
import TransactionServices from "../transaction/services.js";
import client from "../db/redis.js";

export async function channelConsume() {
    const transactionServices = new TransactionServices();
    const connection = await connectRabbitMQ();
    const dataServiceQueue = await createRabbitMQChannel(connection, process.env.RABBITMQ_DATA_QUEUE_NAME);
    dataServiceQueue.consume(process.env.RABBITMQ_DATA_QUEUE_NAME, async (data) => {
      dataServiceQueue.ack(data);
      if(!await client.get("importCompleted")){
        const startTime = await client.get("startTime");
        dataServiceQueue.sendToQueue(
          process.env.RABBITMQ_MAIN_QUEUE_NAME,
          Buffer.from(JSON.stringify({importing: startTime?true:false, time: startTime?(53 - (((new Date()) - (new Date(startTime)))/1000).toFixed(0)):undefined}))
        );
      } else {
        const { token, date } = JSON.parse(data.content);
        dataServiceQueue.sendToQueue(
          process.env.RABBITMQ_MAIN_QUEUE_NAME,
          Buffer.from(JSON.stringify(await transactionServices.getTransaction(token, date?(new Date(date)).setUTCHours(23, 59, 59, 999):undefined)))
        );
      }
    });
}
  