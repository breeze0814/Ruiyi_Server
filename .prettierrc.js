module.exports = {
  semi: false, //行尾需要有分号
  tabWidth: 2, //使用2个空格缩进
  singleQuote: true, //使用单引号
  printWidth: 100, //一行最多100字符
  trailingComma: 'all', //末尾需要有逗号
  useTabs: false, //不使用缩进符，而使用空格
  quoteProps: 'as-needed', //对象的key仅在必要时用引号
  singleProps: true, //使用单引号
  jsxSingleQuote: false, //jsx不使用单引号，而使用双引号
  bracketSpacing: true, //大括号内的首尾需要空格
  bracketSameLine: false, //jsx标签的反尖括号需要换行
  arrowParents: 'always', //箭头函数，只有一个参数的时候，也需要括号
  rangeStart: 0, //每个文件格式化的范围是文件的全部内容
  rangeEnd: Infinity,
  requirePragma: false, //不需要写文件头的@prettier
  insertPragma: false, //不需要自动在文件开头插入@prettier
  proseWrap: 'preserve', //使用默认的执行标准
  htmlWhitespaceSensitivity: 'css', //根据显示样式决定html要不要折行
  vueIndentScriptAndStyle: false, //vue 文件中的 script 和 style 内不用缩进
  // endOfLine: 'lf', //换行符使用 lf
  embeddedLanguageFormatting: 'auto', //格式化内嵌代码
}
