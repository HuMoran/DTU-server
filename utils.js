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
const { CMD, FUNC_CODE } = require('./config');


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
    return false;
  }
  const data = msg.slice(0, msg.length - 4);
  const crc = msg.slice(msg.length - 4, msg.length);
  return crc === getCrc(data);
}

function decodeMsg(msg) {
  const result = {
    devId: '',
    funcCode: '',
    address: '',
    data: '',
  };

  result.devId = msg.slice(0, 2);
  result.funcCode = msg.slice(2, 4);
  switch (result.funcCode) {
    case FUNC_CODE.SYSTEM_INFO: // 系统配置信息
      break;
    case FUNC_CODE.SYSTEM_STATUS: // 系统实时状态和事件记录
      break;
    case FUNC_CODE.WELL_STATUS: { // 开关井返回
      result.address = msg.slice(4, 8);
      result.data = msg.slice(8, 12);
      break;
    }
    case FUNC_CODE.WRITE_SINGLE:
      break;
    case FUNC_CODE.WRITE_MULTI:
      break;
    default:
      break;
  }

  return result;
}

// 开井
const openWell = (devId) => addCrc16(`${devId}${CMD.OPEN_WELL}`);
// 关井
const closeWell = (devId) => addCrc16(`${devId}${CMD.CLOSE_WELL}`);

module.exports = {
  addCrc16,
  crcCheck,
  openWell,
  closeWell,
};
