const path = require('path')
const dotenv = require('dotenv')
const { logger } = require('./logger')

// 监听未捕获的异常
// process.on('uncaughtException', (err) => {
//   logger.error('Uncaught Exception:', err)
//   // 通常最好在记录完错误后让进程退出
//   // process.exit(1)
// })

// // 监听未处理的拒绝（Promise）
// process.on('unhandledRejection', (reason, promise) => {
//   logger.error('Unhandled Rejection at:', promise, 'reason:', reason)
// })

logger.info('process.env.NODE_ENV', process.env.NODE_ENV)

const env = process.env.NODE_ENV ?? 'development'
process.env.NODE_CONFIG_DIR = path.join(__dirname, '../../resources/config')

logger.info(path.join(__dirname, '../../../', `.env.${env}`))
dotenv.config({ path: path.join(__dirname, '../../../', `.env.${env}`) })

// 打印信息
logger.info('VERSION:', '20240724 19:26')
logger.info('PORT:', process.env.PORT)
logger.info('NODE_ENV', process.env.NODE_ENV)
