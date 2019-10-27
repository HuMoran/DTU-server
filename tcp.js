/* eslint-disable no-console */
/*
 * File: /tcp.js
 * Project: iot-client
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

const server = net.createServer();
server.on('connection', (client) => {
  console.log('new connection:', client.remoteAddress);
  let isNewClient = true;
  let serialNo;
  let devId;
  let curCmd;
  let sendCmd;
  let userCmd;

  client.on('data', (buf) => {
    const msg = buf.toString('hex');
    console.debug('****client msg:', msg);
    if (isNewClient) { // 新客户端，解析消息头，获取设备信息
      const clientInfo = decodeClientHeader(msg);
      if (!clientInfo) {
        console.error('client auth failed:', msg, client.remoteAddress);
        client.destroy();
        return;
      }
      console.log('认证成功：', client.remoteAddress);
      isNewClient = false;
      serialNo = clientInfo.serialNo;
      devId = clientInfo.devId;
      clients[clientInfo.serialNo] = {
        ...clientInfo,
        ip: client.remoteAddress,
        userCmd: [],
        isRestTime: false,
        socket: client,
      };
      // 新Client，取轮询命令队列
      sendCmd = getNextCmd();
      curCmd = sendCmd;
      const cmdBuf = addCrc16(`${devId}${sendCmd.cmd}`);
      const ret = client.write(cmdBuf);
      if (!ret) {
        console.error('cmd send error:', cmdBuf.toString('hex'), ret);
      }
      return;
    }

    // 休息时间，不处理消息
    if (clients[serialNo].isRestTime) {
      console.log(`[${serialNo}] | client rest time, ignore msg.[${msg}]`);
      return;
    }

    // 解析消息
    const result = sendCmd.decoder(msg);
    // TODO: seng msg to others;
    console.log(`[${serialNo}] | cmd name: ${sendCmd.name}`);
    console.log(`[${serialNo}] |return: ${JSON.stringify(result)}`);

    // 下一轮消息发送，先取用户命令队列，如果没有，再取轮询命令队列
    userCmd = clients[serialNo].userCmd.shift();
    sendCmd = userCmd || getNextCmd(curCmd && curCmd.cmd);
    curCmd = userCmd ? curCmd : sendCmd;
    const cmdBuf = addCrc16(`${devId}${sendCmd.cmd}`);
    console.log('======send msg:', cmdBuf.toString('hex'));

    if (sendCmd.cmd === CMD_QUEUE[0].cmd) {
      console.log(`[${serialNo}] | 命令队列执行完成，等待 ${INTERVAL_TIME} 毫秒开始下一轮`);
      clients[serialNo].isRestTime = true;
      setTimeout(() => {
        clients[serialNo].isRestTime = false;
        const ret = client.write(cmdBuf);
        if (!ret) {
          console.error(`[${serialNo}] | send client cmd error. [${cmdBuf.toString('hex')}]`);
        }
      }, INTERVAL_TIME);
    } else {
      const ret = client.write(cmdBuf);
      if (!ret) {
        console.error(`[${serialNo}] | send client cmd error. [${cmdBuf.toString('hex')}]`);
      }
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

let i = 40;
setInterval(() => {
  const cmd = cmdConfig.setIntervalMode.encoder({
    closeWell: i,
    openWell: i + 10,
  });
  i += 10;
  if (clients['0001']) {
    console.log('测试发送配置命令');
    clients['0001'].userCmd.push({
      name: 'setIntervalMode', // 配置时间模式
      cmd,
      decoder: cmdConfig.setIntervalMode.decoder,
    });
    clients['0001'].userCmd.push(cmdConfig.openWell);
    setTimeout(() => {
      clients['0001'].userCmd.push(cmdConfig.closeWell);
    }, 2000);
  }
}, 5000);
