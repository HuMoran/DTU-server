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
const { addCrc16 } = require('./utils');

const server = net.createServer();
server.on('connection', (c) => {
  console.log('new connection');
  const cmd = addCrc16('01050000FF00'); // 开井
  // const cmd = addCrc16('01040000000e'); // 系统状态
  // const cmd = addCrc16('010400640005'); // 系统事件
  // const cmd = addCrc16('010400c80015'); // 日动作记录
  // const cmd = addCrc16('010401900008'); // 定时记录
  // const cmd = addCrc16('010401f40004'); // 报警记录
  // const cmd = addCrc16('010700020001'); // 删除动作事件

  // setInterval(() => {
  //   const ret = c.write(cmd);
  //   console.log('send cmd:', cmd.toString('hex'), ret);
  // }, 3000);

  c.on('end', () => {
    console.log('client end');
  });
  c.on('data', (msg) => {
    console.log('client msg:', msg.toString('hex'));
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
