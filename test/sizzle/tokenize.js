const fs = require('fs');
const path = require('path');
const tokenize = require('../../lib/tokenize');

/**
 * 要测试的选择器
 * .class
 * #id
 * element
 * element,element
 * element element
 * element > element
 * element + element
 * element ~ element
 * [attribute]
 * [attribute=value]
 * [attribute~=value]
 * [attribute|=value]
 * [attribute^=value]
 * [attribute*=value]
 * [attribute$=value]
 * :pseudo
 */


console.log(tokenize('.test'));
console.log(tokenize('#main'));
console.log(tokenize('div'));
console.log(tokenize('div,span'));
console.log(tokenize('div span'));
console.log(tokenize('div > p'));
console.log(tokenize('div + p'));
console.log(tokenize('div ~ p'));
console.log(tokenize('[href]'));
console.log(tokenize('[type=button]'));
console.log(tokenize('[type~=button]'));
console.log(tokenize('[type|=button]'));
console.log(tokenize('[type^=button]'));
console.log(tokenize('[type*=button]'));
console.log(tokenize('[type$=button]'));
console.log(tokenize('p:first-child'));
console.log(tokenize('p:odd'));
console.log(tokenize('p:even'));
console.log(tokenize('p:eq(1)'));

console.log(tokenize('.c1 .c2'));
console.log(tokenize('.c1.c2'));
console.log(tokenize('div > p + .aaron[type="checkbox"], #id:first-child'));
