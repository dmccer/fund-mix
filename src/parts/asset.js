const Crawler = require('./crawler');

class AssetCrawler extends Crawler {
  transformInput(input) {
    return { FCODE: this.funds[input - 1].code };
  }

  async fetch(input) {
    const params = this.buildParams(input);
    const res = await this._fetch(params);
    return this.transformRes(res.Expansion, this.funds[input - 1]);
  }

  transformRes(res, source) {
    return {
      ...source,
      valuation: res.GZ,
      valuationRange: res.GSZZL,
      valuationTime: res.GZTIME,
      valuationRangeAmount: res.GZZF
    };
  }

  start(funds) {
    this.funds = funds;
    this.qsize = funds && funds.length || 0;

    return super.start();
  }
}

module.exports = new AssetCrawler({
  path: '/FundMApi/FundVarietieValuationDetail.ashx',
  dataFile: `fund_asset_${new Date().toLocaleDateString()}.json`
});