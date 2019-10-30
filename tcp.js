/* eslint-disable no-console */
/*
 * File: /tcp.js
 * Project: dtu-server
 * Description:
 * Created By: Tao.Hu 2019-10-04
 * -----
 * Last Modified: 2019-10-04 05:17:25 pm
 * Modified By: Tao.Hu
 * -----
 * Copyright (c) 2019 Kideasoft Tech Co.,Ltd
 */

const net = require('net');
const { addCrc16, getNextCmd } = require('./utils');
const { cmdConfig, CMD_QUEUE, INTERVAL_TIME } = require('./config');
const { sendBroadcastMsg } = require('./ws');

const clients = {
  // '0001': { // 0001 = serialNo
  //   devId: '01', // 01->ff
  //   channel: 'f2', // f2 两通道; f4 四通道
  //   serialNo: '0001',
  //   ip: '10.1.2.3',
  //   isRestTime: false, // 轮询休息时间，不处理消息
  //   userCmd: [], // 用户命令队列
  //   socket: '', // socket句柄
  // }
};

function decodeClientHeader(msg) {
  const channel = msg.slice(0, 2);
  const devId = msg.slice(2, 4);
  const serialNo = msg.slice(4, 8);
  if (channel !== 'f2' || !devId || !serialNo) return '';
  return { channel, devId, serialNo };
}

function sendQueueCmd(serialNo, client) {
  // 先取用户命令队列，如果没有，再取轮询命令队列
  const userCmd = clients[serialNo].userCmd.shift();
  const { curCmd } = clients[serialNo];
  const sendCmd = userCmd || getNextCmd(curCmd && curCmd.cmd);
  clients[serialNo].sendCmd = sendCmd;
  clients[serialNo].curCmd = userCmd ? curCmd : sendCmd;
  const cmdBuf = addCrc16(`${clients[serialNo].devId}${sendCmd.cmd}`);
  const ret = client.write(cmdBuf);
  if (!ret) {
    console.error(`[${serialNo}] | send client cmd error. [${cmdBuf.toString('hex')}]`);
  }
}

function doNewClientMsg(buf, client) {
  const msg = buf.toString('hex');
  const clientInfo = decodeClientHeader(msg);
  if (!clientInfo) {
    console.error('client auth failed:', msg, client.remoteAddress);
    return '';
  }
  console.log('认证成功：', client.remoteAddress);
  clients[clientInfo.serialNo] = {
    ...clientInfo,
    ip: client.remoteAddress,
    userCmd: [],
    sendCmd: {},
    curCmd: {},
    isRestTime: false,
    socket: client,
  };
  return clientInfo.serialNo;
}

function doDeviceMsg(buf, serialNo) {
  const msg = buf.toString('hex');
  // 休息时间，不处理轮询消息，TODO: 只处理用户命令消息
  if (clients[serialNo].isRestTime) {
    console.log(`[${serialNo}] | client rest time, ignore msg.[${msg}]`);
    return;
  }

  // 解析消息
  const { sendCmd } = clients[serialNo];
  const result = sendCmd.decoder(msg);
  console.log(`[${serialNo}] | cmd name: ${sendCmd.name}`);
  console.log(`[${serialNo}] |return: ${JSON.stringify(result)}`);
  // 广播消息
  sendBroadcastMsg({ type: sendCmd.name, data: { serialNo, ...result } });
}

function initTcpServer() {
  const server = net.createServer();
  server.on('connection', (client) => {
    console.log('new connection:', client.remoteAddress);
    let isNewClient = true;
    let serialNo;

    client.on('data', (buf) => {
      if (isNewClient) {
        serialNo = doNewClientMsg(buf, client);
        if (!serialNo) {
          client.destroy();
          return;
        }
        isNewClient = false;
        return;
      }
      doDeviceMsg(buf, serialNo);
      // 判断是否轮询完一轮，如果是，则休息一段时间开始下一轮
      if (clients[serialNo].sendCmd.cmd === CMD_QUEUE[CMD_QUEUE.length].cmd) {
        console.log(`[${serialNo}] | 命令队列执行完成，等待 ${INTERVAL_TIME} 毫秒开始下一轮`);
        clients[serialNo].isRestTime = true;
        setTimeout(() => {
          clients[serialNo].isRestTime = false;
          sendQueueCmd(serialNo, client);
        }, INTERVAL_TIME);
      }
    });

    client.on('close', () => {
      console.error(`[${serialNo}] | client close`);
      delete clients[serialNo];
    });
    client.on('error', (error) => {
      delete clients[serialNo];
      console.error(`[${serialNo}] | client error.[${error}]`);
    });
  });

  server.on('error', (err) => {
    throw err;
  });
  server.listen(8124, () => {
    console.log('服务器已启动');
  });
}

async function doCmdMsg(ctx) {
  let { serialNo } = ctx.request.body;
  const { cmdName, data } = ctx.request.body;

  if (serialNo) {
    serialNo = serialNo.padStart(4, '0');
  }
  if (clients[serialNo]) {
    const cmd = cmdConfig[cmdName].encoder(data);
    clients[serialNo].userCmd.push({
      name: cmdName, // 配置时间模式
      cmd,
      decoder: cmdConfig[cmdName].decoder,
    });
    ctx.body = { code: 0, msg: '' };
    return;
  }
  ctx.body = { code: 1, msg: `device[${serialNo}] offline` };
}

module.exports = { doCmdMsg, initTcpServer };


// let i = 40;
// setInterval(() => {
//   const cmd = cmdConfig.setIntervalMode.encoder({
//     closeWell: i,
//     openWell: i + 10,
//   });
//   i += 10;
//   if (clients['0001']) {
//     console.log('测试发送配置命令');
//     clients['0001'].userCmd.push({
//       name: 'setIntervalMode', // 配置时间模式
//       cmd,
//       decoder: cmdConfig.setIntervalMode.decoder,
//     });
//     clients['0001'].userCmd.push(cmdConfig.openWell);
//     setTimeout(() => {
//       clients['0001'].userCmd.push(cmdConfig.closeWell);
//     }, 2000);
//   }
// }, 5000);
