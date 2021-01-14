'use strict';

const Service = require('egg').Service;
const moment = require('moment');
const _ = require('lodash');
const schedule = require('node-schedule');
const { daily, weekly } = require('../constants/2021');
const { readFile, writeFile } = require('../utils/fileOperation');
const scheduleMap = {};
class scheduleOperationService extends Service {

  // 调用企业微信API
  async postText({ url, content }) {
    const { ctx } = this;
    try {
      const result = await ctx.curl(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json; charset=UTF-8',
        },
        dataType: 'json',
        data: {
          msgtype: 'text',
          text: {
            content,
          },
        },
      });
      if (result && result.data && result.data.errcode !== 0) {
        await this.postText({ url, content });
      }
    } catch (error) {
      await this.postText({ url, content });
    }
  }

  // 判断是否要发送(日报形式 考虑节假日形式)
  async isSendDaily() {
    const formatDate = moment().format('YYYYMMDD');
    if (daily[formatDate]) {
      // 如果是特殊日期且是工作日就发送
      return daily[formatDate] === 'work';
    } else if ([ 6, 0 ].includes(new Date().getDay())) {
      // 如果是周末则不发送
      return false;
    }
    return true;
  }

  // 判断是否要发送(周报形式 考虑节假日形式)
  async isSendWeekly() {
    const formatDate = moment().format('YYYYMMDD');
    if (weekly[formatDate]) {
      // 如果是特殊日期根据维护的数据进行处理
      return weekly[formatDate] === 'send';
    } else if (new Date().getDay() === 5) {
      // 如果是周五则发送
      return true;
    }
    return false;
  }

  // 开启一个定时
  async startSchedule({ url, content, cron, options }) {
    const funcMap = {
      isSendDaily: this.isSendDaily,
      isSendWeekly: this.isSendWeekly,
    };
    const flag = schedule.scheduleJob(cron, async () => {
      const funcName = funcMap[options];
      if (funcName) {
        const allowSend = await funcName();
        if (allowSend) {
          await this.postText({ url, content });
        }
      } else {
        await this.postText({ url, content });
      }
    });
    return flag;
  }

  // 查询数据
  async querySchedule() {
    const res = await readFile();
    return res;
  }

  // 插入数据
  async addSchedule(scheduleInfo) {
    const { url, content, cron, options } = scheduleInfo || {};
    const flag = await this.startSchedule({ url, content, cron, options });
    if (flag) {
      const prevData = await readFile();
      const maxIdData = _.maxBy(prevData, 'id');
      const newMaxId = _.isEmpty(maxIdData) ? 1 : maxIdData.id + 1;
      prevData.push({ url, content, cron, options, id: newMaxId, isStarting: 1 });
      const res = await writeFile(prevData);
      if (res) {
        scheduleMap[newMaxId] = flag;
      }
      return res;
    }
    return false;
  }

  // 更新数据
  async updateSchedule(scheduleInfo) {
    const { url, content, cron, id, options } = scheduleInfo || {};
    const prevData = await readFile();
    const currentIsStarting = _.get(prevData.find(item => Number(item.id) === Number(id)), 'isStarting');
    // 如果是开启中的任务则取消
    if (currentIsStarting) {
      scheduleMap[id] && scheduleMap[id].cancel();
    }
    const flag = await this.startSchedule({ url, content, cron, options });
    if (flag) {
      scheduleMap[id] = flag;
      prevData.forEach(item => {
        if (Number(item.id) === Number(id)) {
          item.url = url;
          item.content = content;
          item.cron = cron;
          item.options = options;
          item.isStarting = 1;
        }
      });
      const res = await writeFile(prevData);
      return res;
    }
    return false;
  }

  // 删除数据
  async deleteSchedule(jobId) {
    let prevData = await readFile();
    const currentIsStarting = _.get(prevData.find(item => Number(item.id) === Number(jobId)), 'isStarting');
    prevData = prevData.filter(item => Number(item.id) !== Number(jobId));
    const res = await writeFile(prevData);
    if (res) {
      if (currentIsStarting) {
        scheduleMap[jobId] && scheduleMap[jobId].cancel();
      }
      delete scheduleMap[jobId];
    }
    return res;
  }

  // 获取数据详情
  async detailSchedule(jobId) {
    const prevData = await readFile();
    const res = prevData.find(item => Number(item.id) === Number(jobId));
    return res;
  }

  // 停止一个定时
  async stopSchedule(jobId) {
    if (scheduleMap[jobId]) {
      const prevData = await readFile();
      const currentIsStarting = _.get(prevData.find(item => Number(item.id) === Number(jobId)), 'isStarting');
      if (currentIsStarting) {
        // 如果是在运行中则停止
        prevData.forEach(item => {
          if (Number(item.id) === Number(jobId)) {
            item.isStarting = 0;
          }
        });
        const res = await writeFile(prevData);
        if (res) {
          scheduleMap[jobId].cancel();
        }
        return res;
      }
      return true;
    }
    return false;
  }

  // 重启一个定时
  async restartSchedule(jobId) {
    if (scheduleMap[jobId]) {
      const prevData = await readFile();
      const scheduleInfo = prevData.find(item => Number(item.id) === Number(jobId));
      const currentIsStarting = _.get(scheduleInfo, 'isStarting');
      if (!currentIsStarting) {
        // 如果是在停止中则重启
        const flag = await this.startSchedule(scheduleInfo);
        if (flag) {
          scheduleMap[jobId] = flag;
          prevData.forEach(item => {
            if (Number(item.id) === Number(jobId)) {
              item.isStarting = 1;
            }
          });
          const res = await writeFile(prevData);
          return res;
        }
      } else {
        return true;
      }
    }
    return false;
  }

  // 开启所有定时
  async initAllSchedule() {
    const allSchedule = await this.querySchedule();
    allSchedule.forEach(async item => {
      const { url, content, cron, options, id, isStarting } = item || {};
      if (isStarting) {
        const flag = await this.startSchedule({ url, content, cron, options });
        scheduleMap[id] = flag;
      }
    });
  }
}

module.exports = scheduleOperationService;
