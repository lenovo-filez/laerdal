'use strict';

class AppBootHook {
  constructor(app) {
    this.app = app;
  }

  // 服务启动后开启定时服务
  async didReady() {
    const ctx = await this.app.createAnonymousContext(); // 模拟一个上下文，就可以使用model,service等
    await ctx.service.scheduleOperation.initAllSchedule();
  }
}

module.exports = AppBootHook;
