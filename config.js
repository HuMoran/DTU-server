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

const CMD = {
  OPEN_WELL: '050000FF00', // 开井
  CLOSE_WELL: '0500000000', // 开井
  SYSTEM_STATUS: '040000000e', // 当前系统所有状态
  SYSTEM_EVENT: '0400640005', // 系统事件
  ACTION_LOG: '0400c80015', // 日动作记录
  SCHEDULE_LOG: '0401900008', // 定时记录
  ALARM_LOG: '0401f40004', // 报警记录
  DELETE_EVENT: '0700010001', // 删除系统事件
  DELETE_ACTION: '0700020001', // 删除动作事件
  DELETE_SCHEDULE: '0700030001', // 删除定时事件
  DELETE_ALARM: '0700040001', // 删除报警事件
};

const FUNC_CODE = {
  SYSTEM_INFO: '03', // 整定请求 读取内部保持寄存器的值(系统配置信息)
  SYSTEM_STATUS: '04', // AI/PI请求 读取输入寄存器的值(系统实时状态)
  WELL_STATUS: '05', // DO操作 向 1 个线圈寄存器写值(开关井)
  WRITE_SINGLE: '06', // 向 1 个保持寄存器写值
  WRITE_MULTI: '16', // 向 n 个保持寄存
};

module.exports = {
  CMD,
  FUNC_CODE,
};
