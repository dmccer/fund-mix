const fs = require('fs');
const path = require('path');
const axios = require('axios');
const Queue = require('better-queue');
const log4js = require('log4js');

const LOG_CAT = 'crawl_eastmoney';
let appenders = [ 'out', 'app' ];
if (process.env.NODE_ENV === 'production') {
  appenders.shift();
}
log4js.configure({
  appenders: {
    app: {
      type: 'dateFile',
      filename: `logs/${LOG_CAT}.log`,
      maxLogSize: 20480,
      backups: 10,
    },
    out: {
      type: 'console',
    },
  },
  categories: {
    default: { appenders, level: 'debug' },
  },
});
const logger = log4js.getLogger();

const url = 'https://fundmobapi.eastmoney.com/FundMApi/FundRankNewList.ashx';
const PAGE_SIZE = 30;
const defaultParams = {
  pageIndex: 1,
  pageSize: PAGE_SIZE,
  FundType: 0,
  SortColumn: 'SYL_Y',
  Sort: 'desc',
  BUY: true,
  product: 'EFund',
  CompanyId: '',
  LevelOne: '',
  LevelTwo: '',
  deviceid: 'ABCD79AA-5645-48C8-A31F-C37B3178DF12',
  plat: 'Iphone',
  version: '5.2.0'
};

/**
 * 请求一页数据
 * @param {number} page 页码，从 1 开始
 */
async function fetchFundOfPage(page) {
  let params = { ...defaultParams };
  if (page) {
    params.pageIndex = page;
  }
  const res = await axios.get(url, {
    params,
    headers: {
      'User-Agent': 'app-iphone-client-iPhone9,1-ABCD79AA-5645-48C8-A31F-C37B3178DF12'
    }
  })

  return res.data;
}

// 获取记录总数
async function getTotalPageCount() {
  const firstPage = await fetchFundOfPage(1);
  const count = firstPage.TotalCount;

  if (!count) {
    return 0;
  }
  return Math.ceil(count / PAGE_SIZE);
}

// 队列式抓取，同时 30 个请求
async function crawl() {
  const totalPageCount = await getTotalPageCount();

  if (totalPageCount === 0) {
    return;
  }

  let result = [];

  function handler(input, cb) {
    fetchFundOfPage(input)
      .then((res) => {
        [].push.apply(result, res.Datas);
        cb(null, res.Datas);
      });
  }

  return new Promise(function (resolve, reject) {
    const q = new Queue(handler, { concurrent: 30 });
    q.on('task_finish', function(taskId) {
      logger.info(`job-${taskId} 成功`);
    });

    q.on('task_failed', function(taskId, err) {
      logger.error(`job-${taskId} 出错, ${err.message}`);
    });

    q.on('drain', function() {
      resolve(result);
    });

    let i = 1;
    while(i <= totalPageCount) {
      q.push(i);
      i++;
    }
  });
}

async function start() {
  const result = await crawl();

  logger.info(`共抓取结果: ${result.length} 条`);
  fs.writeFileSync(path.join(__dirname, 'fund.json'), JSON.stringify(result));
}

start();

