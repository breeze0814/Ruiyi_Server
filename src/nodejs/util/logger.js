const log4js = require('log4js')
log4js.configure({
  appenders: {
    // 输出源
    out: {
      type: 'stdout',
      layout: {
        type: 'colored',
        pattern: '[%d{yyyy/MM/dd-hh.mm.ss}]  - %m%n',
      },
    },
    app: {
      type: 'dateFile',
      filename: 'log/app.log',
      pattern: 'yyyy-MM-dd',
      encoding: 'utf-8',
      compress: false,
      keepFileExt: true,
      alwaysIncludePattern: true,
      layout: {
        type: 'pattern',
        pattern: '[%d{yyyy-MM-dd hh:mm:ss}] [%p]  - %m%n',
      },
    },
    err: {
      type: 'stderr',
    },
  },
  categories: {
    // 类别
    default: {
      appenders: ['out', 'app'],
      level: 'debug',
    },
    normal: {
      appenders: ['out', 'app'],
      level: 'info',
    },
    err: {
      appenders: ['err'],
      level: 'error',
    },
  },
})

const logger = log4js.getLogger('normal')
module.exports = {
  logger,
}
