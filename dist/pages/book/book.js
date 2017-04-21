'use strict';

var _util = require('../../utils/util.js');

var _timeago = require('../../utils/timeago.js');

var _timeago2 = _interopRequireDefault(_timeago);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = getApp();

Page({
  data: {
    book: {},
    loading: false,
    inshelf: false
  },

  onLoad: function onLoad(params) {
    var _this = this;

    var timeagoInstance = (0, _timeago2.default)();
    this.setData({ loading: true });
    var inshelf = false;
    app.Api.fetchBook(params.id).then(function (response) {
      response.cover = (0, _util.formatImageUrl)(response.cover);
      response.lastUpdated = timeagoInstance.format(response.updated, 'zh_CN');
      if (response.tags.length > 0) {
        response.tags = response.tags.map(function (tag) {
          return { color: (0, _util.getRandomColor)(), tag: tag };
        });
      }
      var value = wx.getStorageSync(response._id);
      var inshelf = !!value ? true : false;
      _this.setData({ book: response, loading: false, inshelf: inshelf });
      wx.setNavigationBarTitle({ title: response.title });
    }).catch(function (e) {
      _this.setData({ loading: false });
      console.error(e);
    });
  },

  addToBookshelf: function addToBookshelf() {
    wx.setStorageSync(this.data.book._id, this.data.book);
    this.setData({ inshelf: true });
    this.showToast('加入书架成功');
  },

  removeFromShelf: function removeFromShelf() {
    wx.removeStorageSync(this.data.book._id);
    this.setData({ inshelf: false });
    this.showToast('从书架移除成功');
  },

  showToast: function showToast(title) {
    wx.showToast({
      title: title,
      icon: 'success',
      duration: 2000
    });
  },

  startRead: function startRead() {
    if (!wx.getStorageSync(this.data.book._id)) {
      this.addToBookshelf();
    }
    wx.navigateTo({
      url: '../read/read?id=' + this.data.book._id + '&lastUpdated=' + this.data.book.updated
    });
  },
  onShareAppMessage: function onShareAppMessage() {
    var self = this;
    return {
      title: this.data.book.title,
      path: '/pages/book/book?id=' + this.data.book._id,
      desc: this.data.book.longIntro,
      success: function success(res) {
        console.log(res);
        self.showToast("分享成功");
      },
      fail: function fail(res) {
        console.log(res);
      }
    };
  }
});