import {getRandomColor, formatImageUrl} from '../../utils/util.js';

const app = getApp();

Page({
  data: {
    books: [],
    loading: false,
    searches: [],
    showSearchLog: true
  },

  onLoad: function () {
    //调用API从本地缓存中获取数据
    const searchArray = wx.getStorageSync('searches') || [];
    const searches = searchArray.map((search) => {
      return { color: getRandomColor(), word: search };
    });
    this.setData({searches: searches});
    // console.log("onLoad");
  },

  bindHideKeyboard: function(e) {
    //收起键盘
    wx.hideKeyboard();
  },

  autoComplete: function(e){
    const query = e.detail.value;
    if (!query) { return };
    app.Api.fetchAutoComplete(query)
      .then((response) => {
        console.log(response);
      });
  },

  search: function(e) {
    const query = e.detail.value || e.currentTarget.dataset.query;
    if (!query) { return };
    this.setData({ loading: true });
    this.logSearch(query);
    app.Api.fetchSearch(query)
      .then(response => {
        response.books.map((item) => { item.cover = formatImageUrl(item.cover) });
        this.setData({books: response.books, loading: false, showSearchLog: false});
      }).catch(e => {
        this.setData({ loading: false, showSearchLog: false });
        console.error(e);
      });
  },

  logSearch: function(word){
    const searchArray = wx.getStorageSync('searches') || [];
    if(searchArray.indexOf(word) === -1){
      searchArray.unshift(word);
      wx.setStorageSync('searches', searchArray);
      this.setData({searches: wx.getStorageSync('searches')});
    }
  },

  clear: function(){
    this.setData({searches: []});
    wx.setStorageSync('searches', []);
  }
})
