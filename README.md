## `ruoyi`系统后台`nodejs`版本 （源`java 3.8.6b`版本更新)
### 使用准备
前端准备
修改login文件中`codeUrl.value` 值的前缀为 `"data:image/svg+xml;base64,"`
配置文件
- 开发环境 `devConfig.js`
- 生产环境 `serverConfig.js`
#### Mysql
- 安装mysql 
- 请手动执行`db/sql/ys_databse.sql`脚本，初始化数据
- 请手动修改 `config/devConfig.js`文件中的数据库连接信息

#### Redis环境
- 请自行安装`redis`
- 请手动修改 `config/devConfig.js`文件中的`redis`连接信息