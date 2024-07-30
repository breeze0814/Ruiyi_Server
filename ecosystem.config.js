const appBaseName = 'ys-nodejs'
const appName = `${appBaseName}-${process.env.NODE_ENV}`
console.log('APP_NAME:', appName)
console.log('NODE_ENV:', process.env.NODE_ENV)

module.exports = {
  apps: [
    {
      name: appName,
      script: './src/nodejs/bin/www',
    },
  ],
}
