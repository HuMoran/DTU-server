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

const CMD_TIMEOUT = 5000;
const TCP_PORT = 8124;

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

function writeBufToClient(serialNo, client, buf, count = 0) {
  if (count >= 3) return false;
  const ret = client.write(buf);
  if (!ret) {
    console.error(`[${serialNo}] | send client cmd [${buf.toString('hex')}] failed. try again.`);
    if (count < 3) setTimeout(() => writeBufToClient(serialNo, client, buf, count + 1), 1000);
  }
  return true;
}

function sendQueueCmd(serialNo, client, count = 1, cmd) {
  if (count > 3) {
    console.error(`[${serialNo}] | destory client.`);
    client.destroy();
    return;
  }
  if (cmd) {
    const ret = writeBufToClient(serialNo, client, cmd);
    if (!ret) {
      console.error(`[${serialNo}] | send client cmd [${cmd.toString('hex')}] failed, try again[${count}].`);
      sendQueueCmd(serialNo, client, count + 1, cmd);
    }
  }
  // 先取用户命令队列，如果没有，再取轮询命令队列
  const userCmd = clients[serialNo].userCmd.shift();
  const { curCmd } = clients[serialNo];
  const sendCmd = userCmd || getNextCmd(curCmd && curCmd.cmd);
  clients[serialNo].sendCmd = sendCmd;
  clients[serialNo].curCmd = userCmd ? curCmd : sendCmd;
  const cmdBuf = addCrc16(`${clients[serialNo].devId}${sendCmd.cmd}`);
  const ret = writeBufToClient(serialNo, client, cmdBuf);
  if (!ret) {
    console.error(`[${serialNo}] | send client cmd [${cmdBuf.toString('hex')}] failed, try again[${count}].`);
    sendQueueCmd(serialNo, client, count + 1, cmdBuf);
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
  console.log(`[${serialNo}] | msg: ${JSON.stringify(result)}`);
  // 广播消息
  if (result && result !== true) {
    sendBroadcastMsg({ type: sendCmd.name, data: { serialNo, ...result } });
  }
}

function initTcpServer() {
  const server = net.createServer();
  server.on('connection', (client) => {
    console.log('new connection:', client.remoteAddress);
    let isNewClient = true;
    let serialNo;
    let timer;
    let restTimer;

    client.on('data', function doClientMsg(buf) {
      if (timer) clearTimeout(timer);
      if (!buf) console.log(`[${serialNo}] | 等待返回消息超时`);
      if (isNewClient) {
        serialNo = doNewClientMsg(buf, client);
        if (!serialNo) {
          client.destroy();
          return;
        }
        isNewClient = false;
        sendQueueCmd(serialNo, client);
        timer = setTimeout(doClientMsg, CMD_TIMEOUT);
        return;
      }
      if (buf) {
        doDeviceMsg(buf, serialNo);
      }
      // 判断是否轮询完一轮，如果是，则休息一段时间开始下一轮
      if (clients[serialNo].sendCmd.cmd === CMD_QUEUE[CMD_QUEUE.length - 1].cmd) {
        console.log(`[${serialNo}] | 命令队列执行完成，等待 ${INTERVAL_TIME} 毫秒开始下一轮`);
        clients[serialNo].isRestTime = true;
        restTimer = setTimeout(() => {
          if (!clients[serialNo]) return; // 定时完，可能客户端已经断开了
          clients[serialNo].isRestTime = false;
          sendQueueCmd(serialNo, client);
          timer = setTimeout(doClientMsg, CMD_TIMEOUT);
        }, INTERVAL_TIME);
        return;
      }
      sendQueueCmd(serialNo, client);
      timer = setTimeout(doClientMsg, CMD_TIMEOUT);
    });

    client.on('close', () => {
      console.error(`[${serialNo}] | client close`);
      delete clients[serialNo];
      if (timer) clearTimeout(timer);
      if (restTimer) clearTimeout(restTimer);
    });
    client.on('error', (error) => {
      console.error(`[${serialNo}] | client error.[${error}]`);
      delete clients[serialNo];
      if (timer) clearTimeout(timer);
      if (restTimer) clearTimeout(restTimer);
    });
  });

  server.on('error', (err) => {
    throw err;
  });
  server.listen(TCP_PORT, '0.0.0.0', () => {
    console.log('服务器已启动');
  });
}

async function doCmdMsg(ctx) {
  let { serialNo } = ctx.request.body;
  const { action, data } = ctx.request.body;
  if (serialNo) {
    serialNo = serialNo.padStart(4, '0');
  }
  if (clients[serialNo] && data) {
    const cmd = cmdConfig[action].encoder(data);
    clients[serialNo].userCmd.push({
      name: action, // 配置时间模式
      cmd,
      decoder: cmdConfig[action].decoder,
    });
    ctx.body = { code: 0, msg: '' };
    return;
  }
  if (clients[serialNo]) {
    clients[serialNo].userCmd.push({
      name: action, // 配置时间模式
      cmd: cmdConfig[action].cmd,
      decoder: cmdConfig[action].decoder,
    });
    ctx.body = { code: 0, msg: '' };
    return;
  }
  ctx.body = { code: 1, msg: `device[${serialNo}] offline` };
}

module.exports = { doCmdMsg, initTcpServer };
