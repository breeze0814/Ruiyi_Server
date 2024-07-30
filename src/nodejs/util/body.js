const success = (data) => {
  let res = {
    code: 200,
    msg: '操作成功',
    data,
  }
  return res
}

const fail = (msg) => {
  let res = {
    code: 500,
    msg: msg || '操作失败',
  }
  return res
}

module.exports = {
  success,
  fail,
}
