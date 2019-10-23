/*
 * File: /helper.js
 * Project: dtu-server
 * Description:
 * Created By: Tao.Hu 2019-10-22
 * -----
 * Last Modified: 2019-10-22 08:14:48 pm
 * Modified By: Tao.Hu
 * -----
 * Copyright (c) 2019 Kideasoft Tech Co.,Ltd
 */

function openWell(msg) {
  const devId = msg.slice(0, 2);
  const funCode = msg.slice(2, 4);
  const addr = msg.slice(4, 6);
  const data = msg.slice(6, 8);
  if (!devId
    || funCode !== '05'
    || addr !== '0000'
    || data !== 'FF00'
  ) {
    return false;
  }
  return true;
}

function closeWell(msg) {
  const devId = msg.slice(0, 2);
  const funCode = msg.slice(2, 4);
  const addr = msg.slice(4, 6);
  const data = msg.slice(6, 8);
  if (!devId
    || funCode !== '05'
    || addr !== '0000'
    || data !== '0000'
  ) {
    return false;
  }
  return true;
}

function checkHeader(msg) {
  const devId = msg.slice(0, 2);
  const funCode = msg.slice(2, 4);
  const len = parseInt(msg.slice(4, 6), 16);
  const data = msg.slice(6, msg.length - 4);
  if (!devId
    || funCode !== '04'
    || data.length !== len * 2
  ) {
    return false;
  }
  return data;
}

function getTime(data) {
  const year = parseInt(data.slice(0, 2), 16);
  const month = parseInt(data.slice(2, 4), 16);
  const day = parseInt(data.slice(4, 6), 16);
  const h = parseInt(data.slice(6, 8), 16);
  const m = parseInt(data.slice(8, 10), 16);
  const s = parseInt(data.slice(10, 12), 16);
  return year ? `20${year}-${month}-${day} ${h}:${m}:${s}` : '0-0-0 0:0:0';
}

function systemStatus(msg) {
  const data = checkHeader(msg);
  if (!data) return false;
  // 套压
  const lidPressure = parseInt(data.slice(0, 8), 16) / 100;
  // 油压
  const oilPressure = parseInt(data.slice(8, 16), 16) / 100;
  // 开光井状态： 0: close, 1: open, 2: 续流
  const wellStatus = parseInt(data.slice(16, 24), 16);
  // battery
  const batteryVoltage = parseInt(data.slice(24, 32), 16) / 10;
  // Solar voltage
  const solarVoltage = parseInt(data.slice(32, 40), 16) / 10;
  // 动作剩余时间 单位秒
  const countdownTime = parseInt(data.slice(40, 48), 16);
  return {
    lidPressure,
    oilPressure,
    wellStatus,
    batteryVoltage,
    solarVoltage,
    countdownTime,
  };
}

// type and data定义
// 1—系统启动(数据显示为 0);
// 2—定值操作(数据显示为 0);
// 3—电池电压异常;(数据位当时电池电压,需要除以10);
// 4—太阳能电压异常(数据位当时太阳能电压,由于晚上无电压,则只有电压过高异常);
// 5—显示异常(数据显示为 0);
// 6—通讯口异常(数据显示为 0);
// 7—动作事件(事件数据: 1 程序开井; 2 程序关井; 3 手动开井;
// 4 手动关井; 5 未知开井; 6 未知关井);
// 8—oled 异常(数据显示为 0);
// 9—sd 卡异常(数据显示为 0)
function systemEvent(msg) {
  const data = checkHeader(msg);
  if (!data) return false;
  const type = parseInt(data.slice(0, 4), 16);
  const eventData = parseInt(data.slice(4, 8), 16);
  const time = getTime(data.slice(8, 20));
  return {
    type,
    data: eventData,
    time,
  };
}

function actionLog(msg) {
  const data = checkHeader(msg);
  if (!data) return false;
  // 130a 1715 1204 // 开井时间
  // 0000 // 开井套压
  // 0000 // 开井油压
  // 0000 0000 0000// 柱塞到达时间
  // 0000 // 柱塞到达套压
  // 0000 // 柱塞到达油压
  // 130a 1715 1303 // 关井到达时间
  // 0000 // 关井套压
  // 0000 // 关井油压
  // 0000 003b
  // 0000 003b
  // 0000 001e
  const time = getTime(data);
  // 开井套压
  const openWellLidPressure = parseInt(data.slice(12, 16), 16) / 100;
  // 开井油压
  const openWellOilPressure = parseInt(data.slice(16, 20), 16) / 100;
  // 柱塞到达时间
  const plungerArrivalTime = getTime(data.slice(20, 32));
  // 柱塞到达套压
  const plungerArrivalLidPressure = parseInt(data.slice(32, 36), 16) / 100;
  // 柱塞到达油压
  const plungerArrivalOilPressure = parseInt(data.slice(36, 40), 16) / 100;
  // 关井时间
  const closeWellTime = getTime(data.slice(40, 52));
  // 关井套压
  const closeWellLidPressure = parseInt(data.slice(52, 56), 16) / 100;
  // 关井油压
  const closeWellOilPressure = parseInt(data.slice(56, 60), 16) / 100;
  // 上升时间
  const upTimestamp = parseInt(data.slice(60, 68), 16);
  // 开井时间
  const openWellTimestamp = parseInt(data.slice(68, 76), 16);
  // 关井时间
  const closeWellTimestamp = parseInt(data.slice(76, 84), 16);
  return {
    time,
    openWellLidPressure,
    openWellOilPressure,
    plungerArrivalTime,
    plungerArrivalLidPressure,
    plungerArrivalOilPressure,
    closeWellTime,
    closeWellLidPressure,
    closeWellOilPressure,
    upTimestamp,
    openWellTimestamp,
    closeWellTimestamp,
  }
}

function scheduleLog(msg) {
  const data = checkHeader(msg);
  if (!data) return false;
  const no = parseInt(data.slice(0, 4), 16);
  const time = getTime(data.slice(4, 16));
  const lidPressure = parseInt(data.slice(16, 20), 16) / 100;
  const oilPressure = parseInt(data.slice(20, 24), 16) / 100;
  const wellStatus = parseInt(data.slice(24, 28), 16);
  const arrivalSensorStatus = parseInt(data.slice(28, 32), 16);
  return {
    no,
    time,
    lidPressure,
    oilPressure,
    wellStatus, // 0: close, 1: open
    arrivalSensorStatus, // 0: 未到达 1: 到达
  };
}

function alarmLog(msg) {
  const data = checkHeader(msg);
  if (!data) return false;
  const alarmNo = parseInt(data.slice(0, 4), 16);
  const time = getTime(data.slice(4, 16));
  return {
    alarmNo, // 0: 没有报警记录  1: 到达过快， 2： 未到达
    time,
  };
}

function deleteEvent(msg) {
  return msg.includes('0700010001');
}

function deleteAction(msg) {
  return msg.includes('0700020001');
}

function deleteSchedule(msg) {
  return msg.includes('0700030001');
}

function deleteAlarm(msg) {
  return msg.includes('0700040001');
}

module.exports = {
  openWell,
  closeWell,
  systemStatus,
  systemEvent,
  actionLog,
  scheduleLog,
  alarmLog,
  deleteEvent,
  deleteAction,
  deleteSchedule,
  deleteAlarm,
};
