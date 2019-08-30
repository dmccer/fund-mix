const fs = require("fs");
const path = require("path");
const Big = require("big.js");
const BasicModel = require("./model/basic");
const conf = require("../parts/conf");

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
      profit: Big(fund.holdings)
        .times(Big(net))
        .minus(Big(fund.cost)),
      lastProfit: Big(fund.holdings)
        .times(Big(net))
        .times(Big(range))
        .div(100)
    };
  });

  fs.writeFileSync(
    path.join(conf.transformedDataDir, `fund_asset.json`),
    JSON.stringify(funds)
  );
};

exports.rangeWarn = function(funds) {
  return funds.map(
    ({
      name,
      code,
      net,
      profit,
      cost,
      holdings,
      valuation,
      valuationRange
    }) => {
      console.log(net, profit, cost, holdings, valuation, valuationRange);
      // 收益率
      const profitRatio = Big(profit).div(Big(cost));

      // 估算总收益率
      const valuationProfitRatio = Big(holdings)
        .times(Big(valuation))
        .minus(Big(cost))
        .div(Big(cost));

      let msg = "";
      const holdingProfitRatio = valuationProfitRatio.times(100).toFixed(2);
      const valuRangeNum = parseFloat(valuationRange);

      // 估算总收益超过 15%，建议清仓
      if (valuationProfitRatio.gte(0.149)) {
        msg = `总收益 ${holdingProfitRatio}% 达到预期收益，建议清仓`;
      } else if (valuRangeNum > 0 && valuRangeNum < 1) {
        msg = `暂时无须补仓，当日预期涨跌幅 ${valuRangeNum}%, 预期持仓总收益率 ${holdingProfitRatio}%`;
      } else if (valuRangeNum < -1) {
        const targetRange = 0.01;
        const deltaAmount = Big(holdings)
          .times(valuation)
          .minus(cost)
          .div(targetRange)
          .minus(cost);
        const deltaCount = deltaAmount.div(valuation).toFixed(2);
        const targetProfitRatio = valuationProfitRatio
          .div(
            Big(valuRangeNum)
              .div(100)
              .plus(1)
          )
          .times(1 - targetRange)
          .times(100)
          .toFixed(2);

        msg = `建议补仓 ${deltaCount} 份，约 ${deltaAmount.toFixed(
          2
        )} 元，补仓后总收益为 ${targetProfitRatio}%，不补仓总收益为 ${holdingProfitRatio}%`;
      }

      return {
        name,
        code,
        profit,
        cost,
        holdings,
        msg
      };
    }
  );
};
