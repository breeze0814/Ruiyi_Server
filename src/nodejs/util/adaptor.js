const { isEmpty } = require('./tools.js')

function adaptor(val) {
  if (isEmpty(val)) return val

  for (const key in val) {
    if (val[key] instanceof Object) {
      const obj = adaptor(val[key])
      delete val[key]
      val[key] = obj
    }

    const tempObj = val[key]
    const newKey = key.replace(/[A-Z]/g, (match) => {
      delete val[key]
      return '_' + match.toLowerCase()
    })
    val[newKey] = tempObj
  }

  return val
}
const reverseAdaptor = (val) => {
  const newVal = val.split('_')
  if (newVal.length === 1) return newVal[0]
  let a = ''
  newVal.forEach((item, idnex) => {
    a += idnex === 0 ? item : capitalizeFirstLetter(item)
  })
  return a
}
function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
module.exports = {
  adaptor,
  reverseAdaptor,
}
