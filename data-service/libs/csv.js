import fs from "fs";
import { parse } from "csv-parse";
import TransactionServices from "../transaction/services.js";
import client from "../db/redis.js";

export async function readCSV(filePath) {
    const transactionServices = new TransactionServices();
    // if(await transaction.isImportCompleted()) {
    //   console.log("Data already inported");
    //   return
    // }
    const startTime = new Date();
    console.log("Start import data");
    await client.flushAll();
    await client.set('startTime', startTime.toISOString());
    await transactionServices.removeAll();
    const tokenBalances = {};
    var rowDate = "";
    fs.createReadStream(filePath)
      .pipe(parse({ delimiter: ",", from_line: 2 }))
      .on("data", function (row) {
        if(row.length == 4) {
            row[3] = Number(row[3]);
            row[0] = new Date(Number(row[0]) * 1000);
            rowDate = `${row[0].getFullYear()}/${(row[0].getMonth()+1)}/${row[0].getDate()}`;

            if(tokenBalances[row[2]] === undefined) tokenBalances[row[2]] = {
              date: row[0],
              balance: 0,
              amount: 0,
              currentDate: rowDate
            };

            if(tokenBalances[row[2]].currentDate != rowDate) {
              transactionServices.insert({
                date: tokenBalances[row[2]].date,
                balance: tokenBalances[row[2]].balance,
                amount: tokenBalances[row[2]].amount,
                token: row[2]
              });
              tokenBalances[row[2]].currentDate = rowDate;
              tokenBalances[row[2]].date = row[0];
              tokenBalances[row[2]].amount = 0;
            }
            
            tokenBalances[row[2]].balance = row[1] == "DEPOSIT"?(tokenBalances[row[2]].balance + row[3]):(tokenBalances[row[2]].balance - row[3]);
            tokenBalances[row[2]].amount = row[1] == "DEPOSIT"?(tokenBalances[row[2]].amount + row[3]):(tokenBalances[row[2]].amount - row[3]);
          }
      }).on("end", async function () {
        Object.keys(tokenBalances).forEach((token) => {
          transactionServices.insert({
            date: tokenBalances[token].date,
            balance: tokenBalances[token].balance,
            token: token
          })
        })
        console.log(((new Date()) - startTime)/1000 + " seconds");
        console.log('Import completed');
        await client.set('tokenBalances', JSON.stringify(tokenBalances));
        await client.set('importCompleted', "1");
      }).on("error", function (error) {
        console.error(error.message);
      });
}