'use strict';

// 2021特殊日期记录  rest 表示休息 work 表示工作 用于判断当天是否要发送更新状态的提醒
const daily = {
  20210101: 'rest',
  20210207: 'work',
  20210211: 'rest',
  20210212: 'rest',
  20210215: 'rest',
  20210216: 'rest',
  20210217: 'rest',
  20210220: 'work',
  20210405: 'rest',
  20210425: 'work',
  20210503: 'rest',
  20210504: 'rest',
  20210505: 'rest',
  20210508: 'work',
  20210614: 'rest',
  20210918: 'work',
  20210920: 'rest',
  20210921: 'rest',
  20210926: 'work',
  20211001: 'rest',
  20211004: 'rest',
  20211005: 'rest',
  20211006: 'rest',
  20211007: 'rest',
  20211009: 'work',
};

// 2021特殊日期记录用于判断何时发送周报 send 表示发送 ingore 表示不发送
const weekly = {
  20201231: 'send',
  20210101: 'ingore',
  20210210: 'send',
  20210212: 'ingore',
  20210219: 'ingore',
  20210220: 'send',
  20210507: 'ingore',
  20210508: 'send',
  20210917: 'ingore',
  20210918: 'send',
  20210930: 'send',
  20211001: 'ingore',
  20211008: 'ingore',
  20211009: 'send',
};

module.exports = {
  daily,
  weekly,
};
