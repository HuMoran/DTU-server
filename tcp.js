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
const { crc16modbus } = require('crc');
const { addCrc16, getNextCmd } = require('./utils');
const { cmdConfig } = require('./config');

const CLIENT_KEY = '02010001';


const server = net.createServer();
server.on('connection', (client) => {
  console.log('new connection');
  let clientStatus = false;
  let clientId;
  let curCmd;
  let userCmd;
  let sendCmd;

  client.on('data', (buf) => {
    console.log('client msg:', buf.toString('hex'));
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
    console.log('result:', result);

    sendCmd = userCmd || getNextCmd(curCmd && curCmd.cmd);
    curCmd = userCmd ? curCmd : sendCmd;
    console.log('sendCmd:', sendCmd);
    const cmdBuf = addCrc16(`${clientId}${sendCmd.cmd}`);
    const ret = client.write(cmdBuf);
    if (!ret) {
      console.error('cmd send error:', cmdBuf.toString('hex'), ret);
    }
  });

  client.on('close', () => {
    clientStatus = false;
  });
});
// 010410
// b7af 130a 1014 0e33 0000 0000 0003 0000
//   01    04   00 C8 00 15            B03B
// 地址域 功能码 数据域（大端）     校验码(CRC16大端)
// 010500001FF00C5BE
server.on('error', (err) => {
  throw err;
});
server.listen(8124, () => {
  console.log('服务器已启动');
});
