const EventEmitter = require('events');

const clients = {
  // '0001': { // 0001 = serialNo
  //   devId: '01', // 01->ff
  //   channel: 'f2', // f2 两通道; f4 四通道
  //   serialNo: '0001',
  //   ip: '10.1.2.3',
  //   isRestTime: false, // 轮询休息时间，不处理消息
  //   userCmd: [], // 用户命令队列
  //   socket: '', // socket句柄
  // }
};

class Client {
  // eslint-disable-next-line object-curly-newline
  constructor({ serialNo, devId, channel, ip, socket } = {}) {
    if (!serialNo) throw new Error('client no serialNo');
    this.devId = devId; // 01->ff
    this.serialNo = serialNo;
    this.channel = channel; // f2 两通道; f4 四通道
    this.ip = ip;
    this.socket = socket; // socket句柄
    this.userCmd = []; // 用户命令队列
    this.isRestTime = false; // 轮询休息时间，不处理消息
  }

  decodeMsg() {
    console.log('devId:', this.devId);
  }

}

function scheduler() {
  // 新client上线

}

function startScheduler() {
  setTimeout(() => {
    scheduler();
    startScheduler();
  }, 5000);
}

function main(event) {
  event.on('newClient', (msg) => {
    console.log('newClient:', msg);
    const client = new Client(msg);
  });
  startScheduler();
}

const event = new EventEmitter();

main(event);
