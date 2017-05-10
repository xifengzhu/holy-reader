import {getRandomColor, formatImageUrl} from '../../utils/util.js';
import timeago from '../../utils/timeago.js';

const app = getApp();

Page({
  data: {
    book: {},
    loading: false,
    inshelf: false
  },

  onLoad: function (params) {
    const timeagoInstance = timeago();
    this.setData({ loading: true });
    app.Api.fetchBook(params.id)
      .then(response => {
        response.cover = formatImageUrl(response.cover);
        response.lastUpdated = timeagoInstance.format(response.updated, 'zh_CN');
        if(response.tags.length > 0) {
          response.tags = response.tags.map((tag) => {
            return {color: getRandomColor(), tag: tag};
          });
        }
        const value = wx.getStorageSync(response._id);
        const inshelf = value ? true : false;
        this.setData({book: response, loading: false, inshelf: inshelf});
        wx.setNavigationBarTitle({title: response.title});
      }).catch(e => {
        this.setData({loading: false });
        console.error(e);
      });
  },

  addToBookshelf: function() {
    wx.setStorageSync(this.data.book._id, this.data.book);
    this.setData({inshelf: true});
    this.showToast('加入书架成功');
  },

  removeFromShelf: function(){
    wx.removeStorageSync(this.data.book._id);
    this.setData({inshelf: false});
    this.showToast('从书架移除成功');
  },

  showToast: function(title){
    wx.showToast({
      title: title,
      icon: 'success',
      duration: 2000
    });
  },

  startRead: function() {
    if(!wx.getStorageSync(this.data.book._id)){
      this.addToBookshelf();
    }
    wx.navigateTo({
      url: `../read/read?id=${this.data.book._id}&lastUpdated=${this.data.book.updated}`
    });
  },
  onShareAppMessage: function(){
    const self = this;
    return {
      title: this.data.book.title,
      path: `/pages/book/book?id=${this.data.book._id}`,
      desc: this.data.book.longIntro,
      success: function(res) {
        console.log(res)
        self.showToast('分享成功');
      },
      fail: function(res) {
        console.log(res);
      }
    }
  }
})
