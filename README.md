# fund-mix
基金聚合

## 功能
1. 聚合各平台自选基金，消除基金的平台独占性
* 收集所有平台基金信息、费率，需反应实时估值
* 创建用户体系
* 记录用户自选基金、平台
* 查询基金平台差异
* 用户查询自选基金估值、净值、历史净值、走势
* 用户输入和查询持仓(买入及卖出点)、收益状况
2. 涨、跌等预警
3. 补仓建议

## 设计

### 功能 - 1
* 平台，暂时支持天天基金，须可扩展

## 天天基金平台 API 研究
> https://fundmobapi.eastmoney.com

1. 基金排行

- GET `/FundMApi/FundRankNewList.ashx`
- QUERY STRING
```js
{
  FundType: 0,
  SortColumn: 'SYL_Y',
  Sort: 'desc',
  pageIndex: 1,
  pageSize: 30,
  BUY: true,
  CompanyId: '',
  LevelOne: '',
  LevelTwo: '',
  deviceid: 'F38279AA-5645-48C8-A31F-C37B317BA5D7',
  plat: 'Iphone',
  product: 'EFund',
  version: ''
}
```