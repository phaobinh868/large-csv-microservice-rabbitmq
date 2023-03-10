import Transaction from "./model.js";
import client from "../db/redis.js";
import getPrice from "../libs/crypto-compare.js";

export default class TransactionServices {
    async insert(record) {
        return await (new Transaction(record)).save();
    }
    async removeAll() {
        await Transaction.deleteMany({});
    }

    async getTransaction(token, date) {
        var tokenBalances = await client.get("tokenBalances");
        var tokens = [];
        if(tokenBalances) {
            tokenBalances = JSON.parse(tokenBalances);
            if(token) tokens = [token];
            else tokens = Object.keys(tokenBalances);
            const query = {};
            if(date) query.date = {$lte: date}
            var results = await Promise.all(tokens.map(async (token) => {
                return await Transaction.findOne({...query, token: token}).sort({ date: -1 });
            }))
            const prices = await getPrice(tokens);
            results = results.filter(result => result != null);
            results = results.map(result => {
                return {
                    ...JSON.parse(JSON.stringify(result)),
                    balance: (tokenBalances[result.token].balance - result.balance + result.amount)*(prices[result.token]?.USD??1)
                }
            });
            return results
        } else return false;
    }
}