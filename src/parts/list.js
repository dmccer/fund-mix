const Crawler = require('./crawler');
const conf = require('./conf');

const PAGE_SIZE = 30;

class ListCrawler extends Crawler {
  constructor(opt) {
    super(opt);
    this.defaultParams = {
      pageIndex: 1,
      pageSize: PAGE_SIZE,
      FundType: 0,
      SortColumn: 'SYL_Y',
      Sort: 'desc',
      BUY: true,
      CompanyId: '',
      LevelOne: '',
      LevelTwo: '',
      ...conf.params
    }
  }

  transformInput(input) {
    return { pageIndex: input };
  }

  async getTotalPageCount() {
    let params = this.buildParams(1);
    const res = await this._fetch(params);
    const count = res.TotalCount;

    if (!count) {
      return 0;
    }

    return Math.ceil(count / PAGE_SIZE);
  }

  async start() {
    this.qsize = await this.getTotalPageCount();
    return super.start();
  }
}

module.exports = new ListCrawler({
  path: '/FundMApi/FundRankNewList.ashx',
  dataFile: `fund_list_${new Date().toLocaleDateString()}.json`
});