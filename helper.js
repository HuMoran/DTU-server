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

function systemStatus(msg) {
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

function systemEvent(msg) {
  return 'systemEvent';
}

function actionLog(msg) {
  return 'actionLog';
}

function scheduleLog(msg) {
  return 'scheduleLog';
}

function alarmLog(msg) {
  return 'alarmLog';
}

function deleteEvent(msg) {
  return 'deleteEvent';
}

function deleteAction(msg) {
  return 'deleteAction';
}

function deleteSchedule(msg) {
  return 'deleteSchedule';
}

function deleteAlarm(msg) {
  return 'deleteAlarm';
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
