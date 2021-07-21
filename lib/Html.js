exports.getClass = function () {
  return HTML;
};

const Node = require('./Node').getClass()
/**
 * HTML文档类
 */
class HTML {
  constructor(html) {
    this.Root = new Node();
    this.Root.nodeType = Node.TYPE.ROOT;
    this.parse(html);
  };
  parse(html) {
    html = html || '';
    var ch,         //当前字符
      temp,       //临时节点
      currNode = this.Root, //当前节点
      N = html.length, //html长度
      posL = 0,   //html片段开始位置
      currPos = 0,   //html片段当前位置
      bQS = false,
      bQD = false,
      bLeftBS = false,
      bCommentST = false;
    this.Root.firstChild = null;
    for (let i = 0; i < N; i++) {
      ch = html[i];
      currPos = i;
      //注释处理
      if (bCommentST && ch === HTML.CHAR.R_BRACKET) {
        if (i > 1 && html[i - 1] === HTML.CHAR.CONNECTOR && html[i - 2] === HTML.CHAR.CONNECTOR) {
          temp = html.substring(posL, currPos + 1);
          currNode = currNode._adjust(new Node(temp));
          bCommentST = false;
          bLeftBS = false;
          posL = i + 1;
          continue;
        }
      }
      //引号处理 转义处理
      if ((bQD || bQS) && (ch === HTML.CHAR.D_QUOTE || ch === HTML.CHAR.S_QUOTE) && html[i - 1] === HTML.CHAR.BACKSLASH) {
        continue;
      }
      //不然有bug
      if (bLeftBS || currNode.nodeName === 'script') {
        if (ch === HTML.CHAR.D_QUOTE) {
          //双引号开始过则闭合 否则开启
          bQD = !bQD;
        }
        if (ch === HTML.CHAR.S_QUOTE) {
          //单引号开始过则此单引号进行闭合操作 否则开启
          bQS = !bQS;
        }
        // 多余引号处理(只是一种情况)
        if ((bQD || bQS) && bLeftBS && html[i - 1] !== '=') {
          bQD = bQS = false;
        }
      }
      //如果在注释或字符串中则跳过
      if (bCommentST || bQD || bQS) {
        continue;
      }
      switch (ch) {
        case HTML.CHAR.WARNING:// !
          if (bLeftBS && i + 2 < N && html[i - 1] === HTML.CHAR.L_BRACKET && html[i + 1] === HTML.CHAR.CONNECTOR && html[i + 2] === HTML.CHAR.CONNECTOR) {
            bCommentST = true;
          }
          break;
        case HTML.CHAR.L_BRACKET:// <
          //当前块类型为文本或>开始后遇到<
          //push 重开<
          if (posL !== currPos) {
            temp = html.substring(posL, currPos);
            currNode = currNode._adjust(new Node(temp));
          }
          posL = i;
          bLeftBS = true;
          bQS = bQD = false;
          break;
        case HTML.CHAR.R_BRACKET:// >
          //<开始了 才处理
          if (bLeftBS) {
            //不在字符串内 不在注释内 <开启了  ----> 是html片段
            temp = html.substring(posL, currPos + 1);
            currNode = currNode._adjust(new Node(temp));
            //闭合 <
            bLeftBS = false;
            posL = currPos + 1;
          }
          break;
        default: break;
      }//switch end
    }//for end
    if (posL !== currPos) {
      temp = html.substring(posL, currPos + 1);
      currNode._adjust(new Node(temp));
    }
    // 有些html闭合不上~~
    this.Root.bfsSync(function (item) {
      if (item.nodeType === Node.TYPE.ST) {
        item.nodeType = Node.TYPE.D;
      }
    });
    return this;
  };
  get innerHTML() {
    return this.Root.innerHTML;
  }
  createElement(tag) {
    let n = new Node();
    n.nodeName = tag.toLowerCase();
    n.nodeType = Node.SINGLE.has(n.nodeName) ? Node.TYPE.S : Node.TYPE.D;
    return n;
  }
  // 提供的便捷方法
  // 美化输出
  toString() {
    return this.Root.toString();
  };
  // 为了转为tree可视化
  toJSON() {
    return this.Root.toJSON();
  }
  bfsSync(callback) {
    this.Root.bfsSync(callback);
  }
  async bfsAsync(callback) {
    await this.Root.bfsAsync(callback);
  }
  $(selector) {
    return this.Root.$(selector);
  }
}
HTML.CHAR = {
  L_BRACKET: `<`,
  R_BRACKET: `>`,
  S_QUOTE: `'`,
  D_QUOTE: `"`,
  WARNING: `!`,
  CONNECTOR: `-`,
  BACKSLASH: `\\`
}
