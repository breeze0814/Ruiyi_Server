const sequelize = require('../mysql')
const { initModels } = require('./init-models')

const models = initModels(sequelize)

module.exports = models
