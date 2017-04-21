"use strict";

var _util = require("../../utils/util.js");

var app = getApp();

Page({
  data: {
    books: [],
    loading: false,
    empty: true
  },

  onLoad: function onLoad() {
    //调用API从本地缓存中获取数据
    var res = wx.getStorageInfoSync();
    var books = res.keys.map(function (key) {
      if (!["logs", "searches"].includes(key)) {
        return wx.getStorageSync(key);
      }
    });
    books = books.filter(function (book) {
      if (book) {
        return book;
      }
    });
    this.setData({ books: books, empty: books.length == 0 });
  },

  goSearchPage: function goSearchPage(e) {
    wx.navigateTo({
      url: '../search/search'
    });
  }
});