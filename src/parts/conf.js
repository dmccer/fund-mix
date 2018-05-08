const path = require('path');
const fs = require('fs');

const params = exports.params = {
  deviceid: 'ABCD79AA-5645-48C8-A31F-C37B3178DF12',
  plat: 'Iphone',
  version: '5.2.0',
  product: 'EFund'
};

exports.root = 'https://fundmobapi.eastmoney.com';
exports.headers = {
  'User-Agent': `app-iphone-client-iPhone9,1-${params.deviceid}`
};
const dataDir = exports.dataDir = path.join(process.cwd(), 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}