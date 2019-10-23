/*
 * File: /config.js
 * Project: dtu-server
 * Description:
 * Created By: Tao.Hu 2019-10-15
 * -----
 * Last Modified: 2019-10-15 08:12:36 pm
 * Modified By: Tao.Hu
 * -----
 * Copyright (c) 2019 Kideasoft Tech Co.,Ltd
 */

const helper = require('./helper');

// const CMD = {
//   open_well: '050000FF00', // 开井
//   close_well: '0500000000', // 开井
//   system_status: '040000000e', // 当前系统所有状态
//   system_event: '0400640005', // 系统事件
//   action_log: '0400c80015', // 日动作记录
//   schedule_log: '0401900008', // 定时记录
//   alarm_log: '0401f40004', // 报警记录
//   delete_event: '0700010001', // 删除系统事件
//   delete_action: '0700020001', // 删除动作事件
//   delete_schedule: '0700030001', // 删除定时事件
//   delete_alarm: '0700040001', // 删除报警事件
// };

const cmdConfig = {
  openWell: { // 开井
    name: 'openWell',
    cmd: '050000FF00',
    decoder: helper.openWell,
  },
  closeWell: {
    name: 'closeWell',
    cmd: '0500000000', // 开井
    decoder: helper.closeWell,
  },
  systemStatus: {
    name: 'systemStatus',
    cmd: '040000000e', // 当前系统所有状态
    decoder: helper.systemStatus,
  },
  systemEvent: {
    name: 'systemEvent',
    cmd: '0400640005', // 系统事件
    decoder: helper.systemEvent,
  },
  actionLog: {
    name: 'actionLog',
    cmd: '0400c80015', // 日动作记录
    decoder: helper.actionLog,
  },
  scheduleLog: {
    name: 'scheduleLog',
    cmd: '0401900008', // 定时记录
    decoder: helper.scheduleLog,
  },
  alarmLog: {
    name: 'alarmLog',
    cmd: '0401f40004', // 报警记录
    decoder: helper.alarmLog,
  },
  deleteEvent: {
    name: 'deleteEvent',
    cmd: '0700010001', // 删除系统事件
    decoder: helper.deleteEvent,
  },
  deleteAction: {
    name: 'deleteAction',
    cmd: '0700020001', // 删除动作事件
    decoder: helper.deleteAction,
  },
  deleteSchedule: {
    name: 'deleteSchedule',
    cmd: '0700030001', // 删除定时事件
    decoder: helper.deleteSchedule,
  },
  deleteAlarm: {
    name: 'deleteAlarm',
    cmd: '0700040001', // 删除报警事件
    decoder: helper.deleteAlarm,
  },
};

// 定时发送命令的队列
const CMD_QUEUE = [
  cmdConfig.systemStatus,
  cmdConfig.systemEvent,
  cmdConfig.deleteEvent,
  cmdConfig.actionLog,
  cmdConfig.deleteAction,
  cmdConfig.scheduleLog,
  cmdConfig.deleteSchedule,
  cmdConfig.alarmLog,
  cmdConfig.deleteAlarm,
];

const FUNC_CODE = {
  SYSTEM_INFO: '03', // 整定请求 读取内部保持寄存器的值(系统配置信息)
  system_status: '04', // AI/PI请求 读取输入寄存器的值(系统实时状态)
  WELL_STATUS: '05', // DO操作 向 1 个线圈寄存器写值(开关井)
  WRITE_SINGLE: '06', // 向 1 个保持寄存器写值
  WRITE_MULTI: '16', // 向 n 个保持寄存
};

module.exports = {
  cmdConfig,
  CMD_QUEUE,
};
