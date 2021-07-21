exports.getClass = function () {
  return Node;
}
const _ = require('lodash');
const HTMLClass = require('./Html');
const attrReg = /\b([_a-zA-Z][-_a-zA-Z0-9]*)(\s*=\s*(['"])(.*?)(\3))?/g;
const tagNameReg = /[a-z][0-9a-z]*/;

/**
 * Node节点类型
 */
class Node {
  /**
   * Node节点构造函数
   * @param {string|object} - o 字符串或节点的JSON对象
   */
  constructor(o) {
    // 默认数据
    const n = {
      nodeName: '',
      nodeType: Node.TEXT,
      attributes: {},
      text: ''
    };

    // 数据结构
    this.parentNode = null;
    this.prevNode = null;
    this.nextNode = null;
    this.firstChild = null;

    this.nodeName = '';
    this.nodeType = Node.TYPE.TEXT;
    this.attributes = {};
    this.text = '';
    // 数据处理
    if (_.isObject(o)) {
      if (!_.isNil(o.nodeName)) {
        this.nodeName = o.nodeName;
      }
      if (!_.isNil(o.nodeType)) {
        this.nodeType = o.nodeType;
      }
      if (!_.isNil(o.text)) {
        this.text = o.text;
      }
      if (_.isObject(o.attributes)) {
        _.assign(this.attributes, o.attributes);
      }
    } else if (_.isString(o)) {
      o = o.trim();
      this.parse(o);
    }
  }
  // 内部辅助
  _2attr(str) {
    let m = attrReg.exec(str);
    while (!_.isNull(m)) {
      this.attr(m[1], m[4]);
      m = attrReg.exec(str);
    }
  }
  // 调整dom树
  _adjust(node) {
    var bFound = false,
      op = this;
    if (node.nodeType === Node.TYPE.ST) {
      this.append(node);
      return node;
    }
    //结束标签处理
    if (node.nodeType === Node.TYPE.SE) {
      while (op.nodeType !== Node.TYPE.ROOT) {
        if (op.nodeName === node.nodeName) {
          bFound = true;
          break;
        }
        op = op.parentNode;
      }
      if (bFound) {
        while (op.nodeType !== Node.TYPE.ROOT) {
          if (op.nodeType === Node.TYPE.ST) {
            op.nodeType = Node.TYPE.S;
            if (op.nodeName === node.nodeName) {
              op.nodeType = Node.TYPE.D;
              op = op.parentNode;
              break;
            }
            else if (op.firstChild !== null) {
              op.firstChild.parentNode = op.parentNode;
              op.firstChild.prevNode = op;
              op.nextNode = op.firstChild;
              op.firstChild = null;
            }
          }
          op = op.parentNode;
        }
        return op;
      }
      else {
        node.nodeType = Node.TYPE.S;
      }
    }
    if (node.nodeType === Node.TYPE.TEXT) {
      if (this.lastChild && this.lastChild.nodeType === Node.TYPE.TEXT) {
        this.lastChild.text += node.text;
      } else if (node.text !== '') {
        this.append(node);
      }
      return this;
    }
    return this.append(node);
  }
  // 匹配器
  _matcher(selector) {
    let bFound = false;
    switch (selector.charAt(0)) {
      case '#':
        bFound = this.attr('id') === selector.substring(1);
        break;
      case '.':
        bFound = this.hasClass(selector.substring(1));
        break;
      case '[':
        if (selector.charAt(selector.length - 1) === ']') {
          //            1 name             2 ~$^*|      
          let m = /\[([a-z][a-z0-9]*)\s*([|^~$*]?)=\s*(['"]?)([\s\S]*?)\3\]/i.exec(selector);
          let attr = m[1];
          let nval = this.attributes[attr];
          let limit = m[2];
          let val = m[4];
          //console.log(m);
          if (val !== '') {
            switch (limit) {
              case '|':
                bFound = (nval === val ? true : false) || new RegExp(`^${val}-`).test(nval);
                break;
              case '^':
                bFound = new RegExp(`^${val}`).test(nval);
                break;
              case '~':
                bFound = nval.split(' ').indexOf(val) === -1 ? false : true;
                break;
              case '$':
                bFound = new RegExp(`${val}$`).test(nval);
                break;
              case '*':
                bFound = nval.indexOf(val) === -1 ? false : true;
                break;
              default:
                bFound = val === nval ? true : false;
                break;
            }
          } else {
            bFound = this.attributes[attr] === undefined ? false : true;
          }
        }
        break;
      default:
        bFound = this.nodeName === selector ? true : false;
        break;
    }
    return bFound;
  }
  parse(str) {
    this.nodeType = Node.TYPE.TEXT;
    if (str[0] === '<' && str[str.length - 1] === '>') {
      if (str[1] === '!') {
        this.nodeType = Node.TYPE.COMMENT;
        this.text = str;
      } else {
        let m = /^<([/]?)\s*([\w\W]+?)\s*([/]?)>$/g.exec(str);
        if (m !== null) {
          this.nodeType = Node.TYPE.ST;
          if (m[1] === '/') {
            this.nodeType = Node.TYPE.SE;
          }
          if (m[3] === '/') {
            this.nodeType = Node.TYPE.S;
          }
          let t = /^([a-z0-9]+)([\s\S]*)$/i.exec(m[2]);
          if (t !== null) {
            this.nodeName = t[1].toLowerCase();
            this._2attr(t[2]);
          } else {
            this.text = m[2];
          }
          if (Node.SINGLE.has(this.nodeName)) {
            this.nodeType = Node.TYPE.S;
          }
          return this;
        }
      }
    }
    this.text = str;
    return this;
  }

  set nodeName(name) {
    if (tagNameReg.test(name)) {
      this._nodeName = name;
    } else {
      this._nodeName = '';
    }
  }
  set nodeType(type) {
    this._nodeType = type;
  }
  get nodeName() {
    return this._nodeName;
  }
  get nodeType() {
    return this._nodeType;
  }
  get nodeValue() {
    return null;
  }
  get lastChild() {
    var res = this.firstChild;
    if (res !== null) {
      while (res.nextNode !== null) {
        res = res.nextNode;
      }
    }
    return res;
  }
  get nextSibling() {
    return this.nextNode;
  }
  get innerHTML() {
    let res = '',
      t = this.firstChild,
      s = '';
    while (t !== null) {
      switch (t.nodeType) {
        case Node.TYPE.S:
          s = t.attr();
          if (s !== '') {
            s = ' ' + s;
          }
          res += `<${t.nodeName}${s}/>`;
          break;
        case Node.TYPE.ST:
        case Node.TYPE.D:
          res += t.outerHTML;
          break;
        default:
          // COMMENT TEXT
          res += t.text;
          break;
      }
      t = t.nextNode;
    }
    return res;
  }
  set innerHTML(str) {
    const HTML = HTMLClass.getClass()
    let n = new HTML(str);
    console.log(n.toString());
    if (this.firstChild) {
      this.firstChild.remove();
    }
    this.firstChild = n.Root.firstChild;
    this.firstChild.parentNode = this;
    return this;
  }
  get outerHTML() {
    let res = '';
    let s = this.attr();
    if (s !== '') {
      s = ' ' + s;
    }
    switch (this.nodeType) {
      case Node.TYPE.S:
        res = `<${this.nodeName}${s}/>`;
        break;
      case Node.TYPE.ST:
      case Node.TYPE.D:
        res = `<${this.nodeName}${s}>${this.innerHTML}</${this.nodeName}>`;
        break;
      default:
        res = this.text;
        break;
    }
    return res;
  }
  get innerText() {
    let res = '',
      t = this.firstChild;
    while (t !== null) {
      res += t.nodeType === Node.TYPE.TEXT || t.nodeType === Node.TYPE.COMMENT ? t.text : '';
      t = t.nextNode;
    }
    return res;
  }
  get textContent() {
    return this.innerText;
  }
  get id() {
    return this.getAttribute('id');
  }
  get type() {
    return this.getAttribute('type');
  }
  get className() {
    return this.getAttribute('class');
  }
  get disabled() {
    return this.getAttribute('disabled');
  }
  get checked() {
    return this.getAttribute('checked');
  }
  get selected() {
    return this.getAttribute('selected');
  }
  getAttribute(attr) {
    let res = this.attributes[attr];
    if (res === undefined) {
      res = null;
    }
    return res;
  }
  setAttribute(attr, val) {
    this.attr(attr, val);
    return this;
  }
  /**
   * 获取单个属性、设置单个属性、获取所有属性、设置多个属性
   * @param {string|object} key 
   * @param {string|boolean|number} val 
   * @returns this对象
   * @returns 单个属性string
   * @returns 所有属性string
   */
  attr(key, val) {
    if (arguments.length === 2) {
      this.attributes[key] = _.toString(val);
      return this;
    } else if (arguments.length === 0) {
      let res = '';
      _.forEach(this.attributes, function (v, k) {
        res += ` ${k}="${v}"`;
      });
      return res.substring(1);
    } else {
      if (_.isObject(key)) {
        for (let k in key) {
          this.attributes[k] = key[k];
        }
        return this;
      } else {
        let res = this.getAttribute(key);
        return res;
      }
    }
  }

  /**
   * 删除属性
   * @param {string|array} o 
   * @returns this
   */
  removeAttr(o) {
    if (!_.isArray(o)) {
      o = [o];
    }
    for (let i = 0; i < o.length; i++) {
      delete this.attributes[o[i]];
    }
    return this;
  }

  /**
   * 判断是否有类名
   * @param {string|array} o 
   * @returns {boolean} 是否有指定的类名
   */
  hasClass(o) {
    let s = _.isNil(this.attr('class')) ? '' : this.attr('class');
    s = s.split(' ');
    let res = false;
    if (_.isString(o)) {
      o = o.split(' ');
    }
    if (_.isArray(o)) {
      _.forEach(o, function (val) {
        if (val !== '' && -1 !== _.indexOf(s, val)) {
          res = true;
          return false;
        }
      });
    }
    return res;
  }
  /**
   * 添加一个或多个类
   * @param {string|array} o 
   */
  addClass(o) {
    if (_.isArray(o)) {
      o = o.join(' ');
    }
    if (_.isString(o)) {
      this.attr('class', this.attr('class') + ' ' + o);
    }
    return this;
  }
  delClass(o) {
    if (_.isString(o)) {
      o = o.split(' ');
    }
    if (_.isArray(o)) {
      let p = this.attr('class').split(' ');
      for (let i = p.length - 1; i >= 0; i--) {
        if (-1 !== o.indexOf(p[i])) {
          p.splice(i, 1);
        }
      }
      this.attr('class', p.join(' '));
    }
    return this;
  }

  // 文档节点操作方法
  append(o) {
    if (_.isString(o)) {
      this.append(new Node(o));
    } else if (o instanceof Node) {
      if (o.parentNode !== null) {
        o = o.remove();
      }
      let t = this.firstChild;
      o.parentNode = this;
      if (t === null) {
        this.firstChild = o;
      } else {
        while (t.nextNode !== null) t = t.nextNode;
        t.nextNode = o;
        o.prevNode = t;
      }
    }
    return this;
  }
  remove() {
    if (this.prevNode === null) {
      this.parentNode.firstChild = this.nextNode;
      if (this.nextNode) {
        this.nextNode.prevNode = null;
      }
    } else {
      this.prevNode.nextNode = this.nextNode;
      if (this.nextNode !== null) {
        this.nextNode.prevNode = this.prevNode;
      }
    }
    this.parentNode = this.prevNode = this.nextNode = null;
    return this;
  }
  // 去一层包裹
  unwrap() {
    let op = this.parentNode,
      last = this.lastChild;
    // 没有子节点直接去掉
    if (last === null) {
      this.remove();
      return;
    }
    // 是第一个子节点 可能没有下个兄弟节点
    if (op.firstChild === this) {
      op.firstChild = this.firstChild;
      if (this.firstChild) {
        this.firstChild.parentNode = op;
      }
    } else {
      this.prevNode.nextNode = this.firstChild;
      this.firstChild.prevNode = this.prevNode;
    }
    // 链接上后面的节点
    last.nextNode = this.nextNode;
    if (this.nextNode) {
      this.nextNode.prevNode = last;
    }
    return this;
  }
  // 节点树转为前端树插件可用的树
  toJSON() {
    let oc = this.firstChild;
    let res = {
      nodeName: this.nodeName,
      nodeType: this.nodeType,
      attr: this.attr(),
      text: ''
    };
    if (this.nodeType === Node.TYPE.TEXT || this.nodeType === Node.TYPE.COMMENT) {
      res.text = this.text;
    }
    if (oc !== null) {
      res.children = [];
    }
    while (oc !== null) {
      res.children.push(oc.toJSON());
      oc = oc.nextNode;
    }
    return res;
  }
  // 缩进符号 几个空格 属性顺序
  toString(indent, level) {
    // 层级与缩进
    indent = indent || '    ';
    level = level || 0;
    let prefix = _.repeat(indent, level);

    let res = '';
    let t = this.firstChild;
    let tagBR = this.lastChild !== t || t !== null && t.nodeType === Node.TYPE.D;
    let pre
    switch (this.nodeType) {
      case Node.TYPE.S:
        res = `${prefix}${this.outerHTML}`;
        break;
      case Node.TYPE.D:
        level++;
        let s = this.attr();
        if (s !== '') {
          s = ` ${s}`;
        }
        res = `${prefix}<${this.nodeName}${s}>`;
        if (tagBR) {
          while (t !== null) {
            res += `\n${t.toString(indent, level)}`;
            t = t.nextNode;
          }
          res += `\n${prefix}`;
        } else if (t) {
          res += t.toString();
        }
        res += `</${this.nodeName}>`;
        break;
      case Node.TYPE.ROOT:
        res = '';
        while (t !== null) {
          res += `${t.toString(indent)}`;
          t = t.nextNode;
        }
        break;
      default:
        res = `${prefix}${this.text}`;
        break;
    }
    return res;
  };
  async bfsAsync(callback) {
    // 是否中断bfs
    var bBreak = false;
    // 遍历队列
    var queue = [];
    // 临时变量
    var temp = null;
    if (!_.isFunction(callback)) return;
    queue.push(this);
    while (queue.length !== 0 && bBreak === false) {
      temp = queue.shift();
      if (temp.nodeType !== Node.TYPE.ROOT) {
        bBreak = true === await callback.call(this, temp) ? true : false;
      };
      // 确定callback中没有删除节点
      if (temp.parentNode !== null || temp.nodeType === Node.TYPE.ROOT) {
        temp = temp.firstChild;
        while (temp !== null) {
          queue.push(temp);
          temp = temp.nextNode;
        }
      }
    }
    return true;
  }
  bfsSync(callback) {
    // 是否中断bfs
    var bBreak = false;
    // 遍历队列
    var queue = [];
    // 临时变量
    var temp = null;
    if (!_.isFunction(callback)) return;
    queue.push(this);
    while (queue.length !== 0 && bBreak === false) {
      temp = queue.shift();
      if (temp.nodeType !== Node.TYPE.ROOT) {
        bBreak = true === callback.call(temp, temp) ? true : false;
      };
      // 确定callback中没有删除节点
      if (temp.parentNode !== null || temp.nodeType === Node.TYPE.ROOT) {
        temp = temp.firstChild;
        while (temp !== null) {
          queue.push(temp);
          temp = temp.nextNode;
        }
      }
    }
    return true;
  }
  /**
   * 查找节点 支持逗号分割 #id .class tagname [attr] 四大类型
   * @param {string} selector 
   * 返回节点数组
   */
  $(selector, combator) {
    let res = [],
      temp,
      bFound;
    switch (combator) {
      case '+':
        temp = this.nextNode;
        while (temp) {
          if (temp._matcher(selector)) {
            res.push(temp);
          } else {
            break;
          }
          temp = temp.nextNode;
        }
        break;
      case '~':
        temp = this.nextNode;
        while (temp) {
          if (temp._matcher(selector)) {
            res.push(temp);
          }
          temp = temp.nextNode;
        }
        break;
      case '>':
        temp = this.firstChild;
        while (temp) {
          if (temp._matcher(selector)) {
            res.push(temp);
          }
          temp = temp.nextNode;
        }
        break;
      default: // 空格 空字符串
        this.bfsSync(function (n) {
          if (n._matcher(selector)) {
            res.push(n);
          }
        });
        break;
    }
    return res;
  }
  // TODO:svg处理
}
const single = new Set([
  'meta',
  'base',
  'link',
  'basefont',
  'source',
  'keygen',
  'frame',
  'input',
  'param',
  'area',
  'img',
  'col',
  'br',
  'hr'
]);
const type = {
  ROOT: 9,
  S: 'single',
  D: 1,
  ST: 'start',
  SE: 'end',
  TEXT: 3,
  COMMENT: 8
};
// 单标签
Node.SINGLE = single;
// 类型常量
Node.TYPE = type;
