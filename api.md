# 数据接口文档

[TOC]

系统数据分两种：1、定时采集的数据；2、用户主动发出的控制命令

## 定时采集的数据

系统定时采集的数据有系统状态、系统事件记录、日动作记录、定时记录、报警记录共5种数据

### 系统状态

```js
{
  serialNo: '0001', // 设备编号（唯一）
  time: '2019-10-27 17:34:12', // 数据采集时间
  lidPressure: 23.23, // 套压
  oilPressure: 12.34, // 油压
  wellStatus: 1, // 开关井状态 0: 关井 1: 开井 2: 续流
  batteryVoltage: 6.1, // 电池电压(单位伏)
  solarVoltage: 13.5, // 太阳能电压(单位伏)
  countdownTime: 30, // 动作剩余时间(单位秒)
}
```

### 系统事件记录

```js
{
// type 和 data定义
// 1—系统启动(data显示为 0);
// 2—定值操作(data显示为 0);
// 3—电池电压异常;(data为当时电池电压,需要除以10);
// 4—太阳能电压异常(data为当时太阳能电压,由于晚上无电压,则只有电压过高异常);
// 5—显示异常(data显示为 0);
// 6—通讯口异常(data显示为 0);
// 7—动作事件(data: 1 程序开井; 2 程序关井; 3 手动开井;
//     4 手动关井; 5 未知开井; 6 未知关井);
// 8—oled 异常(data显示为 0);
// 9—sd 卡异常(data显示为 0)
  serialNo: '0001', // 设备编号（唯一）
  type: 1,
  data: 0,
  time: '2019-10-27 17:34:12', // 事件发生时间
}
```

### 日动作记录

```js
{
  serialNo: '0001', // 设备编号（唯一）
  time: '2019-10-27 17:34:12', // 事件发生时间
  openWellLidPressure: 2.43, // 开井套压
  openWellOilPressure: 3.34, // 开井油压
  plungerArrivalTime: '2019-10-27 17:34:12', // 柱塞到达时间
  plungerArrivalLidPressure: 2.32, // 柱塞到达套压
  plungerArrivalOilPressure: 4.23, // 柱塞到达油压
  closeWellTime: '2019-10-27 17:34:12', // 关井时间
  closeWellLidPressure: 4.23, // 关井套压
  closeWellOilPressure: 4.23, // 关井油压
  upTimestamp: 43, // 上升时间(单位秒)
  openWellTimestamp: 50, // 开井时间(单位秒)
  closeWellTimestamp: 40, // 关井时间(单位秒)
}
```

### 定时记录

```js
{
  serialNo: '0001', // 设备编号（唯一）
  no: 12, // 序号
  time: '2019-10-27 17:34:12', // 记录时间
  lidPressure: 12.32, // 套压
  oilPressure: 43.12, // 油压
  wellStatus: 0, // 开关井状态 0: close, 1: open
  arrivalSensorStatus:0, // 到达传感器状态 0: 未到达 1: 到达
}
```

### 报警记录

```js
{
  serialNo: '0001', // 设备编号（唯一）
  alarmNo: 1, // 0: 没有报警记录  1: 到达过快， 2： 未到达
  time: '2019-10-27 17:34:12', // 事件发生时间
}
```

## 用户主动发出的控制命令

### 开井

```js
{
  serialNo: '0001', // 设备编号（唯一）
  action: 'openWell',
}
```

### 关井

```js
{
  serialNo: '0001', // 设备编号（唯一）
  action: 'closeWell',
}
```

### 配置纯时间模式

```js
{
  serialNo: '0001', // 设备编号（唯一）
  action: 'setIntervalMode',
  data: {
    openWell: 53, // 开井时间
    closeWell: 42, // 关井时间
  },
}
```
