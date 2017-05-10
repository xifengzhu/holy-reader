import {getRandomColor, formatImageUrl} from '../../utils/util.js';

const app = getApp();

Page({
  data: {
    books: [],
    loading: false,
    empty: true
  },

  onLoad: function () {
    //调用API从本地缓存中获取数据
    const res = wx.getStorageInfoSync();
    let books = res.keys.map((key) => {
      if(!['logs', 'searches'].includes(key)){
        return wx.getStorageSync(key);
      }
    })
    books = books.filter((book) => {
      if(book) {
        return book;
      }
    });
    this.setData({books: books, empty: (books.length === 0)});
  },

  goSearchPage: function(e) {
    wx.navigateTo({
      url: '../search/search'
    });
  }
})
