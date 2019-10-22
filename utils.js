/*
 * File: /utils.js
 * Project: dtu-server
 * Description:
 * Created By: Tao.Hu 2019-10-15
 * -----
 * Last Modified: 2019-10-15 08:11:53 pm
 * Modified By: Tao.Hu
 * -----
 * Copyright (c) 2019 Kideasoft Tech Co.,Ltd
 */
const { crc16modbus } = require('crc');
const { cmdConfig, CMD_QUEUE } = require('./config');


function getCrc(str) {
  const data = crc16modbus(Buffer.from(str, 'hex')).toString(16).padStart(4, '0');
  const l = data.slice(0, 2);
  const h = data.slice(2, 4);
  return `${h}${l}`;
}

/**
 * 增加crc16校验，生成命令buffer
 * @param {string} cmd
 * @returns {Buffer} cmd buffer
 */
function addCrc16(cmd) {
  const crc = getCrc(cmd);
  return Buffer.from(`${cmd}${crc}`, 'hex');
}

function crcCheck(msg) {
  if (!msg || msg.length < 8) {
    console.log('crc check failed:', msg);
    return false;
  }
  const data = msg.slice(0, msg.length - 4);
  const crc = msg.slice(msg.length - 4, msg.length);
  return crc === getCrc(data);
}

function getNextCmd(currentCmd) {
  if (!currentCmd) return CMD_QUEUE[0];
  const index = CMD_QUEUE.findIndex((e) => e.cmd === currentCmd);
  return CMD_QUEUE[index + 1] || CMD_QUEUE[0];
}

// 开井
const openWell = (devId) => addCrc16(`${devId}${cmdConfig.open_well.cmd}`);
// 关井
const closeWell = (devId) => addCrc16(`${devId}${cmdConfig.close_well.cmd}`);

module.exports = {
  addCrc16,
  crcCheck,
  openWell,
  closeWell,
  getNextCmd,
};
