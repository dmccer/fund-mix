const fs = require('fs');
const path = require('path');
const conf = require('../parts/conf');
const logger = require('../lib/logger');

const getFilename = exports.getFilename = function() {
  return path.join(conf.transformedDataDir, `fund_basic_${new Date().toLocaleDateString()}.json`);
}

exports.transform = function(jsonFilename) {
  if (!fs.existsSync(jsonFilename)) {
    logger.warn(`没有找到需要转换的 json 文件: ${jsonFilename}`);
    return;
  }

  delete require.cache[jsonFilename];
  const funds = require(jsonFilename);

  const ret = funds.map(fund => {
    return {
      name: fund.SHORTNAME,
      fullname: null,
      code: fund.FCODE,
      type: fund.FTYPE,
      netDate: fund.FSRQ,
      net: fund.DWJZ,
      range: fund.RZDF,
      risk: fund.RISKLEVEL,
      size: fund.ENDNAV,
      estabSize: null,
      company: fund.JJGS,
      companyId: fund.JJGSID,
      manager: fund.JJJL,
      estabDate: fund.ESTABDATE,
      subject: fund.TTYPENAME,
      redeem: fund.ISSALES,
      redeemDesc: fund.SHZT,
      purchase: fund.ISBUY,
      purchaseDesc: fund.SGZT,
      sourceRate: fund.SOURCERATE,
      rate: fund.RATE,
      minPurchase: fund.MINSG,
      maxPurchase: fund.MAXSG,
      regular: fund.DTZT,
      minRegular: fund.MINDT,
      isNew: fund.ISNEW,
      profitWeek: fund.SYL_Z,
      profitMonth: fund.SYL_Y,
      profit3Month: fund.SYL_3Y,
      profit6Month: fund.SYL_6Y,
      profitYear: fund.SYL_1N,
      profit2Year: fund.SYL_2N,
      profit3Year: fund.SYL_3N,
      profitThisYear: fund.SYL_JN,
      profitEstablished: fund.SYL_LN,
    }
  });

  fs.writeFileSync(getFilename(), JSON.stringify(ret));
  logger.info('basic 转换成功');
}


