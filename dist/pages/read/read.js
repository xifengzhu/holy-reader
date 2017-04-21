"use strict";

var _timeago = require("../../utils/timeago.js");

var _timeago2 = _interopRequireDefault(_timeago);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//read.js
//获取应用实例
var app = getApp();

Page({
  data: {
    book: {},
    loading: false,
    content: "",
    showFooter: false,
    showModal: false,
    modalList: [],
    isChapterList: false,
    readIndex: 0,
    currentSource: "",
    chapters: [],
    toView: "#"
  },

  onLoad: function onLoad(params) {
    var _this = this;

    var bookSources = [],
        chapters = [];

    var book = wx.getStorageSync(params.id);
    var extra = book.extra;
    this.setData({ loading: true, book: book });
    wx.setNavigationBarTitle({ title: book.title });
    if (extra) {
      this.setData({ book: book });
      this.getChapterContent(extra.readIndex || 0);
      if (new Date(params.lastUpdated) > new Date(book.updated)) {
        this.getNewestChapters();
      }
    } else {
      this.getBookSources().then(function (response) {
        return _this.getNewestChapters();
      }).then(function (response) {
        return _this.getChapterContent();
      }).catch(function (e) {
        _this.setData({ loading: false });
        wx.showToast({
          title: '获取资源失败，请换源重试!',
          icon: 'warn',
          duration: 2000
        });
        console.error(e);
      });
    }
  },

  getChapterContent: function getChapterContent(index) {
    var _this2 = this;

    if (index < 0) {
      return this.showToast('这已经是第一章啦！');
    }

    if (index > this.data.book.extra.chapters.length - 1) {
      return this.showToast('没有最新章节啦， 请等候更新！');
    }
    var chapter = this.data.book.extra.chapters[index || 0];
    if (chapter && chapter.link) {
      this.setData({ showFooter: false, showModal: false, loading: true });
      app.Api.fetchChapter(chapter.link).then(function (response) {
        _this2.setData({ content: response.chapter.body, title: response.chapter.title, showModal: false, loading: false, readIndex: index });
        _this2.data.book.extra.readIndex = index;
        wx.setStorageSync(_this2.data.book._id, _this2.data.book);
      }).catch(function (e) {
        _this2.setData({ loading: false });
        _this2.showToast('获取资源失败，请换源重试!');
        console.error(e);
      });
    }
  },

  showToast: function showToast(title) {
    wx.showToast({
      title: title,
      icon: 'success',
      duration: 2000
    });
  },

  getNewestChapters: function getNewestChapters() {
    var _this3 = this;

    var book = this.data.book;
    return app.Api.fetchChapters(book.extra.currentSource).then(function (response) {
      console.log("getNewestChapters callback");
      book.extra.chapters = response.chapters;
      _this3.setData({ book: book, loading: false, chapters: response.chapters });
      wx.setStorageSync(book._id, book);
      return response.chapters;
    });
  },

  getBookSources: function getBookSources() {
    var _this4 = this;

    var book = this.data.book;
    return app.Api.fetchBookSource(book._id).then(function (response) {
      console.log("getBookSources callback");
      var avalibleSources = response.filter(function (source) {
        return source.host != "vip.zhuishushenqi.com";
      });
      if (!book.extra) {
        book.extra = {};
      }
      book.extra.currentSource = avalibleSources[0]._id;
      book.extra.sources = avalibleSources;
      _this4.setData({ book: book, currentSource: avalibleSources[0]._id });
      wx.setStorageSync(book._id, book);
      return response;
    });
  },

  bindViewTap: function bindViewTap(e) {
    if (this.data.showModal) {
      this.setData({ showModal: false });
    } else {
      this.setData({ showFooter: !this.data.showFooter });
    }
  },

  showSources: function showSources() {
    var timeagoInstance = (0, _timeago2.default)();
    var modalList = this.data.book.extra.sources.map(function (source) {
      source.updated = timeagoInstance.format(source.updated, 'zh_CN');
      return source;
    });
    this.setData({ modalList: modalList, showModal: true, isChapterList: false });
  },

  showChapters: function showChapters() {
    this.setData({ modalList: this.data.book.extra.chapters, showModal: true, isChapterList: true, toView: "index-" + this.data.readIndex });
  },

  readChapter: function readChapter(e) {
    var index = e.currentTarget.dataset.chapterindex;
    this.getChapterContent(index);
  },

  changeSource: function changeSource(e) {
    var _this5 = this;

    var bookSource = e.currentTarget.dataset.source;
    var book = this.data.book;
    var chapters = [];
    this.setData({ loading: true });
    this.getNewestChapters().then(function (response) {
      book.extra.currentSource = bookSource;
      _this5.setData({ book: book, showModal: false, loading: false });
      wx.setStorageSync(book._id, book);
      return _this5.getChapterContent(_this5.data.readIndex);
    }).catch(function (e) {
      _this5.setData({ loading: false });
      wx.showToast({
        title: '获取资源失败，请换源重试!',
        icon: 'warn',
        duration: 2000
      });
      console.error(e);
    });;
  },
  prevChapter: function prevChapter() {
    this.getChapterContent(--this.data.readIndex);
  },
  nextChapter: function nextChapter() {
    this.getChapterContent(++this.data.readIndex);
  }
});