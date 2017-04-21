'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchBook = fetchBook;
exports.fetchBookSource = fetchBookSource;
exports.fetchChapters = fetchChapters;
exports.fetchChapter = fetchChapter;
exports.fetchSearch = fetchSearch;
exports.fetchAutoComplete = fetchAutoComplete;
var URI = 'https://api.zhuishushenqi.com';

/**
  * @params {Object}   params 参数
  * @params {String}   url 参数
  * @return {Promise}  包含抓取任务的Promise
**/
function request(url, params) {
  return new Promise(function (resolve, reject) {
    wx.request({
      url: url,
      data: Object.assign({}, params),
      header: { 'Content-Type': 'json' },
      success: resolve,
      fail: reject
    });
  });
}

// 书籍详情
// GET api.zhuishushenqi.com/book/57206c3539a913ad65d35c7b
function fetchBook(id) {
  var url = URI + '/book/' + id;
  return request(url).then(function (response) {
    return response.data;
  });
}

// 书源
// GET api.zhuishushenqi.com/toc?view=summary&book=57206c3539a913ad65d35c7b
function fetchBookSource(id) {
  var url = URI + '/toc';
  var params = { view: "summary", book: id };
  return request(url, params).then(function (response) {
    return response.data;
  });
}

// 章节列表
// GET api.zhuishushenqi.com/toc/577b477dbd86a4bd3f8bf1b2?view=chapters
function fetchChapters(id) {
  var url = URI + '/toc/' + id;
  var params = { view: "chapters" };
  return request(url, params).then(function (response) {
    return response.data;
  });
}

// 章节
// GET chapter2.zhuishushenqi.com/chapter/http%3a%2f%2fbook.my716.com%2fgetBooks.aspx%3fmethod%3dcontent%26bookId%3d1127281%26chapterFile%3dU_1212539_201701211420571844_4093_2.txt?k=2124b73d7e2e1945&t=1468223717
function fetchChapter(link) {
  var newURI = "https://chapter2.zhuishushenqi.com";
  var url = newURI + '/chapter/' + link;
  var params = { k: '2124b73d7e2e1945', t: '1468223717' };
  return request(url, params).then(function (response) {
    return response.data;
  });
}

// 搜索
// GET api.zhuishushenqi.com/book/fuzzy-search?query=一念&start=0&limit=2
function fetchSearch(query) {
  var url = URI + '/book/fuzzy-search';
  var params = { query: query, start: 0, limit: 5 };
  return request(url, params).then(function (response) {
    return response.data;
  });
}

// 自动补全
// GET api.zhuishushenqi.com/book/auto-complete?query=一念
function fetchAutoComplete(query) {
  var url = URI + '/book/auto-complete';
  var params = { query: query };
  return request(url, params).then(function (response) {
    return response.data;
  });
}