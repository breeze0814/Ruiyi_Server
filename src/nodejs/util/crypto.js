const bcrypt = require('bcryptjs')
const { logger } = require('./logger')

// 对密码进行哈希
async function hashPassword(password) {
  try {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    return hashedPassword
  } catch (error) {
    logger.error(error.message, '加密失败')
    throw new Error('Failed to hash password')
  }
}

// 比较密码
async function comparePassword(password, hashPassword) {
  try {
    const isMatch = await bcrypt.compare(password, hashPassword)
    return isMatch
  } catch (error) {
    logger.error(error.message, '比较密码失败')
    throw new Error('Failed to compare passwords')
  }
}

module.exports = {
  hashPassword,
  comparePassword,
}
