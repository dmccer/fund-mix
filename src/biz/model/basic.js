const fs = require('fs');
const path = require('path');
const conf = require('../../parts/conf');
const logger = require('../../lib/logger');
const basicTransform = require('../../transform/basic');

exports.findByCode = function(code) {
  const jsonFilename = basicTransform.getFilename();
  if (!fs.existsSync(jsonFilename)) {
    logger.warn(`没有找到json 数据文件: ${jsonFilename}`);
    return;
  }

  // delete require.cache[jsonFilename];
  const funds = require(jsonFilename);

  return funds.find(fund => fund.code === code);
}