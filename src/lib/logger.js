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
module.exports = log4js.getLogger();