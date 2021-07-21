# html-parser2
> 学习参考,用于爬虫
```js
/**
  作者：阮家友
  时间：2017-5-12 10:53:43
  说明：html Node节点对象
**/
```

## 安装方法
> npm install html-parser2 -s

## 使用
```js
const { HTML, Node, $ } = require('html-parser2');
let str = '<!--代码如诗 , 如痴如醉 !--><html xmlns:wb="http://open.weibo.com/wb"><title>xxx</title><body><p>yes<img src="https://www.google.com/favor.icon"/></p></body></html>';
let doc1 = new HTML(str);
// 1.
console.log($(doc).find('p > img').attr('src'));
console.log($(doc).find('p').find('img').attr('src'));
// 2.
console.log(doc.$('p > img').attr('src'));
```

## TODO
- 覆盖率测试
- 增加并完善测试 case
- svg 处理