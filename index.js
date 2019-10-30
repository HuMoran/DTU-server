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

const startHttpServer = require('./http');
const { initWs } = require('./ws');
const { initTcpServer } = require('./tcp');

function main() {
  const server = startHttpServer();
  initWs(server);
  initTcpServer();
}

main();
