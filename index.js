import yargs from "yargs";
import { hideBin } from 'yargs/helpers'
const argv = yargs(hideBin(process.argv)).argv;
import { connectRabbitMQ, createRabbitMQChannel } from "./libs/rmq.js";
import * as dotenv from 'dotenv'
dotenv.config()

async function main(mainQueue) {

    if(argv.date != undefined && ((new Date(argv.date) == "Invalid Date") || isNaN(new Date(argv.date)))) {
        console.log("Date format: YYYY-mm-dd");
        process.exit();
    }

    if(argv.token && argv.date){
        console.log("Given a date and a token, return the portfolio value of that token in USD on that date");
    } else if(argv.token){
        console.log("Given a token, return the latest portfolio value for that token in USD");
    } else if(argv.date){
        console.log("Given a date, return the portfolio value per token in USD on that date");
    } else {
        console.log("Given no parameters, return the latest portfolio value per token in USD");
    }

    mainQueue.sendToQueue(
        process.env.RABBITMQ_DATA_QUEUE_NAME,
        Buffer.from(JSON.stringify({token: argv.token, date: argv.date}))
    )

    mainQueue.consume(process.env.RABBITMQ_MAIN_QUEUE_NAME, async (data) => {
        
        const tokens = JSON.parse(data.content);
        if(tokens.importing === true) console.log(`Please wait, data are importing: ${tokens.time} seconds left`);
        else if(tokens.importing === false) console.log("Data didn't imported! Please make sure run 'npm run up'");
        else {
            tokens.forEach(token => {
                const date = new Date(token.date);
                console.log(`${token.token}[${date.getFullYear()}-${(date.getMonth()+1)}-${date.getDate()}]: ${token.balance}`);
            });
        }
        mainQueue.ack(data);
        setTimeout(() => {
            process.exit();
        })
    });
}

async function bootstrap() {
    const connection = await connectRabbitMQ();
    const mainQueue = await createRabbitMQChannel(connection, process.env.RABBITMQ_MAIN_QUEUE_NAME);
    return await main(mainQueue);
}

await bootstrap();