const Crawler = require('./crawler');

class BasicCrawler extends Crawler {
  transformInput(input) {
    return { FCODE: this.funds[input - 1].FCODE };
  }

  start(funds) {
    this.funds = funds;
    this.qsize = funds && funds.length || 0;

    return super.start();
  }
}

module.exports = new BasicCrawler({
  path: '/FundMApi/FundBasicInformation.ashx',
  dataFile: `fund_basic_${new Date().toLocaleDateString}.json`
});