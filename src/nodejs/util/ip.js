const os = require('os')
const { isEmpty } = require('./tools.js')
const geoip = require('geoip-lite')
const city = require('../configuration/CityConstants.js')

const REGX_0_255 = '(25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]\\d|\\d)'
const REGX_IP = '((' + REGX_0_255 + '\\.){3}' + REGX_0_255 + ')'
const REGX_IP_WILDCARD =
  '(((\\*\\.){3}\\*)|(' +
  REGX_0_255 +
  '(\\.\\*){3})|(' +
  REGX_0_255 +
  '\\.' +
  REGX_0_255 +
  ')(\\.\\*){2}' +
  '|((' +
  REGX_0_255 +
  '\\.){3}\\*))'
const REGX_IP_SEG = '(' + REGX_IP + '\\-' + REGX_IP + ')'

function getIp() {
  const interfaces = os.networkInterfaces()
  for (let devName in interfaces) {
    const iface = interfaces[devName]
    for (let key of iface) {
      const { address, family, internal } = key
      if (family === 'IPv4' && !internal) {
        return address
      }
    }
  }
}

function isMatchedIp(ip, ips) {
  if (isEmpty(ip) || isEmpty(ips)) {
    return false
  }
  const ipArr = ips.split(',')
  for (const iterator of ipArr) {
    let isIp = iterator.match(REGX_IP)
    let wildCard = iterator.match(REGX_IP_WILDCARD)
    let segment = iterator.match(REGX_IP_SEG)
    const flag1 = !isEmpty(iterator) && iterator === isIp[0] && Object.is(iterator, ip)
    const flag2 =
      !isEmpty(iterator) && iterator === wildCard[0] && ipIsInWildCardNoCheck(iterator, ip)
    const flag3 = !isEmpty(iterator) && iterator === segment[0] && ipIsInNetNoCheck(iterator, ip)

    return flag1 || flag2 || flag3 || false
  }
}

function ipIsInWildCardNoCheck(ipWildCard, ip) {
  let s1 = ipWildCard.split('\\.')
  let s2 = ip.split('\\.')
  let isMatchedSeg = true
  for (let i = 0; i < s1.length && s1[i] !== '*'; i++) {
    if (s1[i] !== s2[i]) {
      isMatchedSeg = false
      break
    }
  }
  return isMatchedSeg
}

function ipIsInNetNoCheck(iparea, ip) {
  let idx = iparea.indexOf('-')
  let sips = iparea.substring(0, idx).split('\\.')
  let sipe = iparea.substring(idx + 1).split('\\.')
  let sipt = ip.split('\\.')
  let ips = 0,
    ipe = 0,
    ipt = 0
  for (let i = 0; i < 4; ++i) {
    ips = (ips << 8) | Number(sips[i])
    ipe = (ipe << 8) | Number(sipe[i])
    ipt = (ipt << 8) | Number(sipt[i])
  }
  if (ips > ipe) {
    let t = ips
    ips = ipe
    ipe = t
  }
  return ips <= ipt && ipt <= ipe
}

function isPrivateIP(ip) {
  // IPv4 内网 IP 段
  const privateIPv4Ranges = [
    ['10.0.0.0', '10.255.255.255'],
    ['172.16.0.0', '172.31.255.255'],
    ['192.168.0.0', '192.168.255.255'],
  ]

  // IPv6 内网 IP 前缀
  const privateIPv6Prefixes = [
    'fc00::', // Unique local address
    'fe80::', // Link-local address
  ]

  // 检查是否为 IPv4 内网 IP
  if (ip.includes(':')) {
    // IPv6 地址
    for (const prefix of privateIPv6Prefixes) {
      if (ip.startsWith(prefix)) {
        return true
      }
    }
  } else {
    // IPv4 地址
    const ipInt = ipToInt(ip)
    for (const range of privateIPv4Ranges) {
      if (ipInt >= ipToInt(range[0]) && ipInt <= ipToInt(range[1])) {
        return true
      }
    }
  }

  return false
}

function ipToInt(ip) {
  return ip.split('.').reduce((ipInt, octet) => (ipInt << 8) + parseInt(octet, 10), 0) >>> 0
}

function getLoginLocal(ip) {
  const geo = geoip.lookup(ip)
  if (geo) return city[geo.city]

  console.log('无法获取地理位置信息。')
  return null
}

const ip = getIp()

module.exports = {
  ip,
  isMatchedIp,
  isPrivateIP,
  getLoginLocal,
}
