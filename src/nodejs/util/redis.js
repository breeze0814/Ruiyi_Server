const Redis = require('ioredis')
const config = require('config')
const { logger } = require('./logger')

const redis = new Redis({
  ...config.get('Redis'),
  connectTimeout: 10000, // 连接超时时间（毫秒）
  retryStrategy: function (times) {
    // 重试策略，返回重试的延迟时间（毫秒）
    return Math.min(times * 50, 2000)
  },
})
const appNameSpace = config.get('appName')

// 监听连接成功事件
redis.on('connect', () => {
  logger.info('redis==>', '连接成功', `${config.get('Redis.host')}:${config.get('Redis.port')}`)
})

// 监听连接关闭事件
redis.on('close', () => {
  logger.warn('redis==>', '连接关闭', `${config.get('Redis.host')}:${config.get('Redis.port')}`)
})

// 监听重新连接事件
redis.on('reconnecting', () => {
  logger.info('redis==>', '重新连接成功', `${config.get('Redis.host')}:${config.get('Redis.port')}`)
})

// 监听错误事件
redis.on('error', (error) => {
  logger.error('redis==>', '错误', error)
})

function get(key) {
  return new Promise((resolve, reject) => {
    redis.get(`${appNameSpace}:${key}`, (err, result) => {
      if (err) {
        reject(err)
      } else {
        resolve(JSON.parse(result))
      }
    })
  })
}
function set(key, value) {
  return new Promise((resolve, reject) => {
    redis.set(`${appNameSpace}:${key}`, JSON.stringify(value), (err, result) => {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    })
  })
}

function expire(key, value) {
  redis.expire(`${appNameSpace}:${key}`, value)
}

function del(key) {
  return new Promise((resolve, reject) => {
    redis.del(`${appNameSpace}:${key}`, (err, result) => {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    })
  })
}

function hasKey(key) {
  return new Promise((resolve, reject) => {
    redis.exists(`${appNameSpace}:${key}`, (err, result) => {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    })
  })
}

function getKeys(key) {
  return new Promise((resolve, reject) => {
    redis.keys(`${appNameSpace}:${key}`, (err, result) => {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    })
  })
}
module.exports = { get, set, expire, del, hasKey, getKeys }
