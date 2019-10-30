/* eslint-disable no-console */
/*
 * File: /http.js
 * Project: dtu-server
 * Description:
 * Created By: Tao.Hu 2019-10-04
 * -----
 * Last Modified: 2019-10-04 05:17:25 pm
 * Modified By: Tao.Hu
 * -----
 * Copyright (c) 2019 Kideasoft Tech Co.,Ltd
 */
const Koa = require('koa');
const http = require('http');
const Router = require('@koa/router');
const bodyparser = require('koa-bodyparser');
const { doCmdMsg } = require('./tcp');

// 路由定义
const router = new Router();
router.post('/cmd', doCmdMsg);

function startHttpServer() {
  const app = new Koa();

  // logger
  app.use(async (ctx, next) => {
    await next();
    const rt = ctx.response.get('X-Response-Time');
    console.log(`${ctx.method} ${ctx.url} - ${rt}`);
  });

  // x-response-time
  app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.set('X-Response-Time', `${ms}ms`);
  });

  app
    .use(bodyparser())
    .use(router.routes())
    .use(router.allowedMethods());

  return http.createServer(app.callback()).listen(3000);
}

module.exports = startHttpServer;
