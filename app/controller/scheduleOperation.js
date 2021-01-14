'use strict';

const Controller = require('egg').Controller;

class ScheduleOperationController extends Controller {
  // 查询所有定时配置
  async querySchedule() {
    const { ctx } = this;
    const res = await ctx.service.scheduleOperation.querySchedule();
    ctx.body = {
      data: res,
    };
  }

  // 添加定时配置
  async addSchedule() {
    const { ctx } = this;
    const scheduleInfo = ctx.query;
    const res = await ctx.service.scheduleOperation.addSchedule(scheduleInfo);
    ctx.body = {
      data: res,
    };
  }

  // 更新定时配置
  async updateSchedule() {
    const { ctx } = this;
    const scheduleInfo = ctx.query;
    const res = await ctx.service.scheduleOperation.updateSchedule(scheduleInfo);
    ctx.body = {
      data: res,
    };
  }

  // 删除定时配置
  async deleteSchedule() {
    const { ctx } = this;
    const jobId = ctx.query.jobId;
    const res = await ctx.service.scheduleOperation.deleteSchedule(jobId);
    ctx.body = {
      data: res,
    };
  }

  // 获取定时配置详情
  async detailSchedule() {
    const { ctx } = this;
    const jobId = ctx.query.jobId;
    const res = await ctx.service.scheduleOperation.detailSchedule(jobId);
    ctx.body = {
      data: res,
    };
  }

  // 停止一个定时
  async stopSchedule() {
    const { ctx } = this;
    const jobId = ctx.query.jobId;
    const res = await ctx.service.scheduleOperation.stopSchedule(jobId);
    ctx.body = {
      data: res,
    };
  }

  // 重启一个定时
  async restartSchedule() {
    const { ctx } = this;
    const jobId = ctx.query.jobId;
    const res = await ctx.service.scheduleOperation.restartSchedule(jobId);
    ctx.body = {
      data: res,
    };
  }

  // 渲染模板显示列表页面
  async viewList() {
    const { ctx } = this;
    const data = await ctx.service.scheduleOperation.querySchedule();
    await ctx.render('list.xtpl', {
      data,
    });
  }

  // 渲染模板显示添加页面
  async viewAdd() {
    const { ctx } = this;
    await ctx.render('operation.xtpl');
  }

  // 渲染模板显示编辑页面
  async viewEdit() {
    const { ctx } = this;
    const jobId = ctx.params.jobId;
    const data = await ctx.service.scheduleOperation.detailSchedule(jobId);
    await ctx.render('operation.xtpl', {
      data,
      jobId,
    });
  }

}

module.exports = ScheduleOperationController;
