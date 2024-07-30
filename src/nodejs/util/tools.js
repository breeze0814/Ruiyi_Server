/**
 * 变量判空
 * @param {*} val
 * @returns
 */
function isEmpty(val) {
  if (val instanceof Array) {
    return !val || val.length <= 0
  }

  return val === '' || val === undefined || val === null
}

/**
 * 获取分页数据
 * @param {*} val 总数据
 * @param {*} page
 * @param {*} pageSize
 * @returns 分页数据
 */
function pageData(val, page = 1, pageSize = 10) {
  return {
    total: val.length,
    rows: val.slice((page - 1) * pageSize, page * pageSize),
  }
}

/**
 * 深拷贝
 * @param {*} val
 * @returns
 */
function deepClone(val) {
  return JSON.parse(JSON.stringify(val))
}

/**
 * Date转化为 yyyy-MM-dd hh:mm:ss
 * @param date
 * @returns {string} yyyy-MM-dd hh:mm:ss
 */
function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

module.exports = {
  isEmpty,
  pageData,
  formatDate,
  deepClone,
}
