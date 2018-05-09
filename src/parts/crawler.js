const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const axios = require('axios');

const Utils = require('../lib/utils');
const logger = require('../lib/logger');
const conf = require('./conf');

class Crawler {
  constructor(opt) {
    this.apiUrl = new URL(opt.path, conf.root).toString();
    this.dataFile = path.join(conf.dataDir, opt.dataFile);
    this.qsize = opt.qsize || 0;
    this.qopt = opt.qopt || { concurrent: 30 };
    this.defaultParams = { ...conf.params };
  }

  async _fetch(params) {
    const res = await axios.get(this.apiUrl, {
      params,
      headers: conf.headers
    });

    return res.data;
  }

  async fetch(input) {
    const params = this.buildParams(input);
    const res = await this._fetch(params);
    return res.Datas;
  }

  /**
   * 转换请求参数
   * @param {number} input 
   * @override
   */
  transformInput(input) {
    return {
      input
    };
  }

  /**
   * 构造请求参数
   * @param {number} input 队列顺序
   * @override
   */
  buildParams(input) {
    const extraParams = this.transformInput(input);

    return {
      ...this.defaultParams,
      ...extraParams
    };
  }

  async queue() {
    if (this.qsize === 0) {
      return;
    }

    return Utils.queueCrawl(this.fetch.bind(this), this.qsize, this.qopt);
  }

  storage(data) {
    fs.writeFileSync(this.dataFile, JSON.stringify(data));
  }

  /**
   * 开始抓取，并记录结果
   * @param {Array<Object>} funds 基金列表
   * @override
   */
  async start() {
    let result = await this.queue();
    this.storage(result);

    logger.info(`共抓取结果: ${result.length} 条`);

    return result;
  }
}

module.exports = Crawler;