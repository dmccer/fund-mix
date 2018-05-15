const fs = require('fs');
const path = require('path');
const Big = require('big.js');
const BasicModel = require('./model/basic');
const conf = require('../parts/conf');

/**
 * 录入持仓
 * @param {Array<Object>} input 持仓列表
 */
exports.input = function(input) {
  const funds = input.map(fund => {
    const fundBasicInfo = BasicModel.findByCode(fund.code);

    if (!fundBasicInfo) {
      return { ...fund };
    }

    const { name, netDate, net, range, sourceRate, rate } = fundBasicInfo;
  
    return {
      ...fund,
      name,
      netDate,
      net,
      range,
      sourceRate,
      rate,
      profit: Big(fund.holdings).times(Big(net)).minus(Big(fund.cost)),
      lastProfit: Big(fund.holdings).times(Big(net)).times(Big(range)).div(100)
    };
  });

  fs.writeFileSync(path.join(conf.transformedDataDir, `fund_asset.json`), JSON.stringify(funds));
}

exports.rangeWarn = function(funds) {
  return funds.map(({ name, code, net, profit, cost, holdings, valuation, valuationRange }) => {
    console.log(net, profit, cost, holdings, valuation, valuationRange)
    const profitRatio = Big(profit).div(Big(cost));
    
    // 估算总收益
    const valuationProfitRatio = Big(holdings).times(Big(valuation)).minus(Big(cost)).div(Big(cost));
    // 估算总收益超过 15%，建议清仓
    if (valuationProfitRatio.gte(0.149)) {
      return {
        name, code, profit, cost, holdings,
        msg: `总收益 ${valuationProfitRatio} 达到预期收益，建议清仓`
      };
    }

    const ratio = Big(valuationRange).div(100).plus(1);
    const targetProfitRatio = Big(valuationRange).div(200).plus(profitRatio);
    // const delta = Big(net).times(ratio).minus(Big(cost).times(targetProfitRatio.plus(1))).div(Big(net).times(targetProfitRatio).times(ratio));
    const a = Big(holdings).times(valuation).minus(targetProfitRatio.plus(1).times(cost));
    const delta = a.div(Big(valuation).times(targetProfitRatio));

    return {
      name, code, profit, cost, holdings,
      msg: `建议补仓 ${delta} 份，约 ${delta.times(Big(valuation))} 元，补仓后总收益为 ${targetProfitRatio.times(100)}%，不补仓总收益为 ${profitRatio.plus(Big(valuationRange).div(100)).times(100)}%`
    };
  });
}