
## Solution
- Develop data-service to handle CSV file, calculating and store data to mongoDB. Use redis to cache some variations(importing status, the last tokens data, cache lastest prices from ctyprocompare).
- Using RabbitMQ to communication command line app and data-service.
## Setup
```
git clone https://github.com/phaobinh868/propine_q1.git
cd propine_q1
npm install or yarn install
```
Run data service to handle CSV and import data (It'll take 40 minutes)
- With Docker
```
num run up or yarn up
```
- Or you can run it with mpn/yarn. Make sure RabbitMQ and redis are running, and all variations in .env are correct with your connections
```
cd data-service
npm install or yarn install
npm run start or yarn start
```
## Command line program 
After data-service running success
```
cd propine_q1
```
Given no parameters, return the latest portfolio value per token in USD
```
node index.js
```
Given a token, return the latest portfolio value for that token in USD
```
node index.js --token=BTC
```
Given a date, return the portfolio value per token in USD on that date
```
node index.js --date=2019-10-02
```
Given a date and a token, return the portfolio value of that token in USD on that date
```
node index.js --date=2019-10-02 --token=BTC
```