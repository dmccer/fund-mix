const fs = require('fs');
const path = require('path');

const logger = require('./lib/logger');
const listCrawler = require('./parts/list');
const basicCrawler = require('./parts/basic');

async function start() {
  const list = await listCrawler.start();
  await basicCrawler.start(list);
}

start();