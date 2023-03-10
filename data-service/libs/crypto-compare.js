import axios from 'axios';
import client from "../db/redis.js";

export default async function getPrice(tokens) {
    const url = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${tokens.join(",")}&tsyms=USD&api_key=${process.env.CRYPTO_COMPARE_KEY}`;
    var oldPrices = await client.get("lastPrices");
    if(oldPrices) oldPrices = JSON.parse(oldPrices);
    else oldPrices = {};
    try {
        const prices = await axios.get(url);
        await client.set("lastPrices", JSON.stringify({...oldPrices, ...prices}))
        return prices;
    } catch (error) {
        return oldPrices;
    }
}