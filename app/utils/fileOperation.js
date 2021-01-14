/**
 * 读写文件相关操作方法
 */

'use strict';

const fs = require('fs');
const path = require('path');

const isFileExisted = () => {
  return new Promise(resolve => {
    fs.access(path.join(__dirname, '../../schedule.json'), err => {
      if (err) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};

const readFile = async () => {
  const isExisted = await isFileExisted();
  if (isExisted) {
    const data = fs.readFileSync(path.join(__dirname, '../../schedule.json'), 'utf-8');
    return JSON.parse(data);
  }
  return [];
};

const writeFile = async newData => {
  return new Promise(resolve => {
    fs.writeFile(path.join(__dirname, '../../schedule.json'), JSON.stringify(newData, null, 2), err => {
      if (err) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};

exports.readFile = readFile;
exports.writeFile = writeFile;
exports.isFileExisted = isFileExisted;
