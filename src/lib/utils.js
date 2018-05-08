const Queue = require('better-queue');
const logger = require('./logger');

/**
 * 队列式抓取
 * @param {function} crawl 抓取函数，返回 promise，resolve 结果数据
 * @param {number} count job 总数
 * @param {function} transformInput 每次抓取输入参数转换,返回转换后的参数
 * @param {Object} options 队列配置项
 */
exports.queueCrawl = function(crawl, count, options = { concurrent: 30 }) {
  if (count === 0) {
    return;
  }

  let result = [];

  function handler(input, cb) {
    crawl(input)
      .then(res => {
        [].push.apply(result, Array.isArray(res) ? res : [res]);
        cb(null, res);
      }).catch(err => {
        cb(err);
      });
  }

  return new Promise(function (resolve, reject) {
    const q = new Queue(handler, options);
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
    while(i <= count) {
      q.push(i);
      i++;
    }
  });
}