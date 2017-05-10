const URI = 'https://api.zhuishushenqi.com';

/**
  * @params {Object}   params 参数
  * @params {String}   url 参数
  * @return {Promise}  包含抓取任务的Promise
**/
function request(url, params){
  return new Promise((resolve, reject) => {
    wx.request({
      url: url,
      data: Object.assign({}, params),
      header: { 'Content-Type': 'json' },
      success: resolve,
      fail: reject
    })
  })
}

// 书籍详情
// GET api.zhuishushenqi.com/book/57206c3539a913ad65d35c7b
export function fetchBook(id) {
  const url = `${URI}/book/${id}`;
  return request(url).then(response => response.data);
}

// 书源
// GET api.zhuishushenqi.com/toc?view=summary&book=57206c3539a913ad65d35c7b
export function fetchBookSource(id) {
  const url = `${URI}/toc`;
  const params = { view: 'summary', book: id };
  return request(url, params).then(response => response.data);
}

// 章节列表
// GET api.zhuishushenqi.com/toc/577b477dbd86a4bd3f8bf1b2?view=chapters
export function fetchChapters(id) {
  const url = `${URI}/toc/${id}`;
  const params = { view: 'chapters'};
  return request(url, params).then(response => response.data);
}

// 章节
// GET chapter2.zhuishushenqi.com/chapter/http%3a%2f%2fbook.my716.com%2fgetBooks.aspx%3fmethod%3dcontent%26bookId%3d1127281%26chapterFile%3dU_1212539_201701211420571844_4093_2.txt?k=2124b73d7e2e1945&t=1468223717
export function fetchChapter(link) {
  const newURI = 'https://chapter2.zhuishushenqi.com';
  const url = `${newURI}/chapter/${link}`;
  const params = { k: '2124b73d7e2e1945', t: '1468223717'};
  return request(url, params).then(response => response.data);
}

// 搜索
// GET api.zhuishushenqi.com/book/fuzzy-search?query=一念&start=0&limit=2
export function fetchSearch(query) {
  const url = `${URI}/book/fuzzy-search`;
  const params = { query: query, start: 0, limit: 5};
  return request(url, params).then(response => response.data);
}

// 自动补全
// GET api.zhuishushenqi.com/book/auto-complete?query=一念
export function fetchAutoComplete(query) {
  const url = `${URI}/book/auto-complete`;
  const params = { query: query};
  return request(url, params).then(response => response.data);
}
