'use strict';

var _util = require('../../utils/util.js');

var app = getApp();

Page({
  data: {
    books: [],
    loading: false,
    searches: [],
    showSearchLog: true
  },

  onLoad: function onLoad() {
    //调用API从本地缓存中获取数据
    var searchArray = wx.getStorageSync('searches') || [];
    var searches = searchArray.map(function (search) {
      return { color: (0, _util.getRandomColor)(), word: search };
    });
    this.setData({ searches: searches });
    console.log("onLoad");
  },

  bindHideKeyboard: function bindHideKeyboard(e) {
    //收起键盘
    wx.hideKeyboard();
  },

  autoComplete: function autoComplete(e) {
    var query = e.detail.value;
    if (!query) return;
    app.Api.fetchAutoComplete(query).then(function (response) {
      console.log(response);
    });
  },

  search: function search(e) {
    var _this = this;

    var query = e.detail.value || e.currentTarget.dataset.query;
    if (!query) return;
    this.setData({ loading: true });
    this.logSearch(query);
    app.Api.fetchSearch(query).then(function (response) {
      response.books.map(function (item) {
        item.cover = (0, _util.formatImageUrl)(item.cover);
      });
      _this.setData({ books: response.books, loading: false, showSearchLog: false });
    }).catch(function (e) {
      _this.setData({ loading: false, showSearchLog: false });
      console.error(e);
    });
  },

  logSearch: function logSearch(word) {
    var searchArray = wx.getStorageSync('searches') || [];
    if (searchArray.indexOf(word) == -1) {
      searchArray.unshift(word);
      wx.setStorageSync('searches', searchArray);
      this.setData({ searches: wx.getStorageSync('searches') });
    }
  },

  clear: function clear() {
    this.setData({ searches: [] });
    wx.setStorageSync('searches', []);
  }
});