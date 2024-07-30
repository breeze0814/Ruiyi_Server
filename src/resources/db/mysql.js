const Sequelize = require('sequelize')
const config = require('config')
const { logger } = require('../../nodejs/util/logger.js')

const sequelize = new Sequelize(config.get('mysql'))
sequelize
  .authenticate()
  .then(() => {
    logger.info(
      'mysql==>',
      '连接成功',
      'host:',
      `${config.get('mysql.host')}:${config.get('mysql.port')}`,
      'database:',
      config.get('mysql.database'),
    )
  })
  .catch((error) => {
    logger.error('mysql==>', '连接失败', error.toString())
  })
module.exports = sequelize
