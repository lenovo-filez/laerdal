'use strict';

const Controller = require('egg').Controller;
class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    const groupKey = ctx.params.groupkey;
    // 微信群的webhookUrl通过群组的webhook的key进行url的拼接
    const webhookUrl = `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${groupKey}`;
    const message = await ctx.service.webhook.translateMsg(ctx.request.body);
    if (!message || !webhookUrl) {
      ctx.body = { msg: 'message or webhookUrl is empty or not supported, suppressed.' };
      return;
    }

    // 调用微信群的webhook API
    const result = await ctx.curl(webhookUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json; charset=UTF-8',
      },
      // 自动解析 JSON response
      dataType: 'json',
      // 3 秒超时
      timeout: 3000,
      data: message,
    });

    ctx.body = {
      webhook_url: webhookUrl,
      webhook_message: message,
      status: result.status,
      headers: result.headers,
      package: result.data,
    };
  }
}

module.exports = HomeController;
