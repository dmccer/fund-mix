const fs = require("fs");
const path = require("path");

const logger = require("./lib/logger");
const listCrawler = require("./parts/list");
const basicCrawler = require("./parts/basic");
const assetCrawler = require("./parts/asset");
const basicTransform = require("./transform/basic");
const Asset = require("./biz/asset");
const conf = require("./parts/conf");

/**
 * 交易日每天更新
 */
async function crawlFundBasicInfo() {
  const list = await listCrawler.start();
  await basicCrawler.start(list);

  basicTransform.transform(basicCrawler.dataFile);
}

/**
 * 录入持仓，交易日每天更新
 */
function inputPosition() {
  const input = [
    {
      code: "161631",
      holdings: 1000,
      cost: 1000
    }
  ];

  Asset.input(input);
}

/**
 * 涨跌预警，交易日收盘前10分钟，5分钟更新
 */
async function fundAssetRangeWarn() {
  const fundAssetsFile = path.join(conf.transformedDataDir, `fund_asset.json`);

  delete require.cache[fundAssetsFile];
  const fundAssets = require(fundAssetsFile);

  const fundsWithValuation = await assetCrawler.start(fundAssets);

  const result = Asset.rangeWarn(fundsWithValuation);
  console.log(result);
}

async function start() {
  // await crawlFundBasicInfo();
  inputPosition();
  await fundAssetRangeWarn();
}

start();
