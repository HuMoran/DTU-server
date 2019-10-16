/*
 * File: /nvr.js
 * Project: iot-client
 * Description:
 * Created By: Tao.Hu 2019-10-08
 * -----
 * Last Modified: 2019-10-08 07:59:09 pm
 * Modified By: Tao.Hu
 * -----
 * Copyright (c) 2019 Kideasoft Tech Co.,Ltd
 */
const util = require('util');
const execFile = util.promisify(require('child_process').execFile);
const readFile = util.promisify(require('fs').readFile);

const HK_NVR_IP = '192.168.1.101';
const HK_NVR_PORT = 8000;
const HK_NVR_USER = 'admin';
const HK_NVR_PWD = 'admin123';

async function getHkNVRInfo() {
  try {
    const { stdout } = await execFile(
      './hk_nvr',
      [HK_NVR_IP, HK_NVR_PORT, HK_NVR_USER, HK_NVR_PWD],
      { cwd: `${process.cwd()}/nvr` },
    );
    const data = JSON.parse(stdout);
    // const promises = data.IPChans.map((chan) => readFile(`${process.cwd()}/nvr/${chan.no}.jpg`));
    // const result = await Promise.all(promises);
    // const imgs = result.map((e) => Buffer.from(e).toString('base64'));
    // data.imgs = imgs;
    return data;
  } catch (error) {
    console.log('getHkNVRInfo error:', error);
    return '';
  }
}

module.exports = getHkNVRInfo;
