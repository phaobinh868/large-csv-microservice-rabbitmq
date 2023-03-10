import amqp from "amqplib";

export async function connectRabbitMQ() {
    const amqpServer = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}`;
    return await amqp.connect(amqpServer);
}

export async function createRabbitMQChannel(connection, queueName) {
    const channel = await connection.createChannel();
    await channel.assertQueue(queueName);
    return channel;
}