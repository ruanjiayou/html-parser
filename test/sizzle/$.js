const fs = require('fs');
const path = require('path');
const vQueryFactory = require('../../lib/$');
const htmlparser = require('../../index');

let str = fs.readFileSync(path.join(__dirname, '../data/example-huanqiu-1.html'), 'utf-8');
console.log(str.length);
let document = new htmlparser(str);
let $ = vQueryFactory(document);

// 2018-2-2 01:09:05 pass => 日本研发世界最小飞行汽车 可在公路起降
/*
let t1 = new Date().getTime();
console.log($('h1').html());
let t2 = new Date().getTime();
console.log(`$('h1'):${t2 - t1}`);// => 3ms
let t3 = new Date().getTime();
console.log(document.$('h1'));
let t4 = new Date().getTime();
console.log(`document.bfs:${t4 - t3}`);// => 3ms
*/
// 2018-2-2 01:09:11 pass => more
// let t5 = new Date().getTime();
// console.log($('.bdsharebuttonbox .bds_more').html());
// console.log($('.bdsharebuttonbox .bds_more').html());
// console.log($('.bdsharebuttonbox .bds_more').html());
// console.log($('.bdsharebuttonbox .bds_more').html());
// console.log($('.bdsharebuttonbox .bds_more').html());
// let t6 = new Date().getTime();
// console.log(`$('.bdsharebuttonbox .bds_more'): ${t6 - t5}`);
// let t7 = new Date().getTime();
// console.log(document.$('.bdsharebuttonbox')[0].$('.bds_more')[0].innerText);
// console.log(document.$('.bdsharebuttonbox')[0].$('.bds_more')[0].innerText);
// console.log(document.$('.bdsharebuttonbox')[0].$('.bds_more')[0].innerText);
// console.log(document.$('.bdsharebuttonbox')[0].$('.bds_more')[0].innerText);
// console.log(document.$('.bdsharebuttonbox')[0].$('.bds_more')[0].innerText);
// let t8 = new Date().getTime();
// console.log(`document:${t8 - t7}`);

// 2018-2-3 00:31:26
console.log($('#text').length);
console.log($('#text').find('p > img').attr('src'));

process.exit();