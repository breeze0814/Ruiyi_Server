const svgCaptcha = require('svg-captcha')
//生成uuid
const { v4: uuidv4 } = require('uuid')

const produceSvg = async (ctx) => {
  const captcha = svgCaptcha.create({
    size: 4, //生成几个验证码
    fontSize: 50, //文字大小
    width: 120, //宽度
    height: 40, //高度
    background: '#cc9966', //背景颜色
  })
  const svgString = captcha.data
  ctx.session.captcha = captcha.text
  ctx.body = {
    img: `${Buffer.from(svgString).toString('base64')}`,
    uuid: uuidv4(),
  }
}

module.exports = {
  produceSvg,
}
