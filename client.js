/*
 * File: /client.js
 * Project: iot-client
 * Description:
 * Created By: Tao.Hu 2019-10-04
 * -----
 * Last Modified: 2019-10-04 05:17:25 pm
 * Modified By: Tao.Hu
 * -----
 * Copyright (c) 2019 Kideasoft Tech Co.,Ltd
 */

const { addCrc16, getNextCmd } = require('./utils');
const { CMD_QUEUE } = require('./config');

// client验证：f2->通道号 01->设备编号(01-FF) 0001->设备序号(唯一)
const CLIENT_KEY = '02010001';

let clientStatus = false;
let clientId;
let curCmd;
let userCmd;
let sendCmd;
let isRestTime = false;

function doClientMsg(buf, client) {
  if (isRestTime) return;
  const msg = buf.toString('hex');
  if (!clientStatus && msg !== CLIENT_KEY) {
    client.destroy();
    return;
  }
  if (!clientStatus && msg === CLIENT_KEY) {
    clientStatus = true;
    clientId = msg.slice(2, 4);
    sendCmd = userCmd || getNextCmd(curCmd && curCmd.cmd);
    curCmd = userCmd ? curCmd : sendCmd;

    const cmdBuf = addCrc16(`${clientId}${sendCmd.cmd}`);
    const ret = client.write(cmdBuf);
    if (!ret) {
      console.error('cmd send error:', cmdBuf.toString('hex'), ret);
    }
    return;
  }
  // 解析消息
  const result = (userCmd || curCmd).decoder(msg);
  userCmd = '';
  console.log('cmd name: ', sendCmd.name);
  console.log('return: ', result);


  sendCmd = userCmd || getNextCmd(curCmd && curCmd.cmd);
  curCmd = userCmd ? curCmd : sendCmd;
  const cmdBuf = addCrc16(`${clientId}${sendCmd.cmd}`);
  if (sendCmd.cmd === CMD_QUEUE[0].cmd) {
    console.log('命令队列执行完成，等待5秒开始下一轮');
    isRestTime = true;
    setTimeout(() => {
      isRestTime = false;
      const ret = client.write(cmdBuf);
      if (!ret) {
        console.error('cmd send error:', cmdBuf.toString('hex'), ret);
      }
    }, 5000);
  } else {
    const ret = client.write(cmdBuf);
    if (!ret) {
      console.error('cmd send error:', cmdBuf.toString('hex'), ret);
    }
  }
}

module.exports = doClientMsg;
