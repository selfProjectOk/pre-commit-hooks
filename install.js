#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const self = path.resolve(__dirname);
const root = path.resolve(__dirname, '..', '..');
const execSync = require('child_process').execSync;
const exists = fs.existsSync || path.existsSync;
let pg = require('./package.json');
let rootPackagePath = root + '/package.json';
let rootEslintrcPath = root + '/.eslintrc.js';
let selfEslintrcPath = self + '/vue-eslint.js';
let rootEslintignorePath = root + '/.eslintignore';

console.log("install pre-commit");
try {
  execSync(`node ${root}/node_modules/pre-commit/install.js`);
} catch (e) {
  console.log(e);
}

console.log('install pre-commit-hook(version:' + pg.version + ')');

//处理package修改
let packageContent = null;
try {
  packageContent = fs.readFileSync(rootPackagePath, 'utf-8');
  packageContent = JSON.parse(packageContent);
} catch (e) {
  //do nothing
  console.log(e);
}
//定义添加内容
let baseConfig = {
  'pre-commit': [
    'eslint'
  ]
};
let scriptsConfig = {
  'precommit-msg': 'echo "\033["32"m"蘑菇租房前端“语法规范”自动提交扫描 ..."\033[0m" && exit 0 ',
  'eslint': `npm run precommit-msg && /bin/bash ./node_modules/pre-commit-hooks/shell/eslint.sh`,
  'eslint-fix': `npm run precommit-msg && /bin/bash ./node_modules/pre-commit-hooks/shell/eslint.sh fix`,
  'eslint-fixdryrun': `npm run precommit-msg && /bin/bash ./node_modules/pre-commit-hooks/shell/eslint.sh fix-dry-run`,
  'eslint-desc': `npm run precommit-msg && /bin/bash ./node_modules/pre-commit-hooks/shell/eslint.sh desc`
};

if (packageContent !== null && typeof packageContent == 'object') {
  Object.assign(packageContent, baseConfig);
  Object.assign(packageContent.scripts, scriptsConfig);
  try {
    fs.writeFileSync(rootPackagePath, JSON.stringify(packageContent, null, 2), 'utf-8');
    console.log("Success:", "编辑package.json成功");
  } catch (e) {
    console.log(e);
    console.log("fail:", "编辑package.json失败");
  }
}


//创建.eslintignore
try {
  execSync(`touch ${rootEslintignorePath}`);
  console.log("Success:", "创建成功.eslintignore,并且合并历史配置")
} catch (e) {
  console.log(e);
  console.log("fail:", "创建失败.eslintignore");
}

/**
 * 创建eslint合并非统一配置
 */
try {
  //当开发分支下不存在.eslintrc.js时进行copy动作
  if (!exists(rootEslintrcPath)) {
    execSync(`cp ${selfEslintrcPath} ${rootEslintrcPath}`);
  } else {
    //存在.eslintrc.js时，使用标准配置进行合并
    let rootEslintrcConfig = require(rootEslintrcPath);
    let selfEslintrcConfig = require(selfEslintrcPath);
    let eslintrcContent = Object.assign({}, rootEslintrcConfig, selfEslintrcConfig);
    fs.writeFileSync(rootEslintrcPath, "module.exports = "+ JSON.stringify(eslintrcContent, null, 2) + ";", 'utf-8');
  }
  console.log("Success:", "创建成功.eslintrc.js,并且合并历史配置")
} catch(e) {
  console.log(e);
  console.log("fail:", "创建失败.eslintrc.js");
}
