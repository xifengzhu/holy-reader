import timeago from '../../utils/timeago.js';

//read.js
//获取应用实例
const app = getApp()

Page({
  data: {
    book: {},
    loading: false,
    content: '',
    showFooter: false,
    showModal: false,
    modalList: [],
    isChapterList: false,
    readIndex: 0,
    currentSource: '',
    chapters: [],
    toView: '#'
  },

  onLoad: function (params) {
    // let [bookSources, chapters] = [[], []];
    const book = wx.getStorageSync(params.id);
    const extra = book.extra;
    this.setData({ loading: true, book: book });
    wx.setNavigationBarTitle({title: book.title});
    if(extra){
      this.setData({book: book});
      this.getChapterContent(extra.readIndex || 0);
      if(params.lastUpdated !== book.updated) {
        this.getNewestChapters();
      }
    } else {
      this.getBookSources()
        .then((response) => {
          return this.getNewestChapters();
        })
        .then(response => {
          return this.getChapterContent();
        })
        .catch(e => {
          this.setData({loading: false });
          wx.showToast({
            title: '获取资源失败，请换源重试!',
            icon: 'warn',
            duration: 2000
          });
          console.error(e);
        });
    }
  },

  getChapterContent: function(index){
    const chapter = this.data.book.extra.chapters[index || 0];
    if(chapter && chapter.link){
      this.setData({showFooter: false, showModal: false, loading: true});
      app.Api.fetchChapter(chapter.link).then((response) => {
        this.setData({
          content: response.chapter.body,
          title: response.chapter.title,
          showModal: false,
          loading:false,
          readIndex: index
        });
        this.data.book.extra.readIndex = index;
        wx.setStorageSync(this.data.book._id, this.data.book);
      })
      .catch(e => {
        this.setData({loading: false });
        this.showToast('获取资源失败，请换源重试!');
        console.error(e);
      });
    }
  },

  showToast: function(title){
    wx.showToast({
      title: title,
      icon: 'success',
      duration: 2000
    });
  },

  getNewestChapters: function(){
    const book = this.data.book;
    return app.Api.fetchChapters(book.extra.currentSource)
      .then(response => {
        book.extra.chapters = response.chapters;
        this.setData({book: book, loading: false, chapters: response.chapters});
        wx.setStorageSync(book._id, book);
        return response.chapters;
      });
  },

  getBookSources: function(){
    const book = this.data.book;
    return app.Api.fetchBookSource(book._id)
      .then(response => {
        const avalibleSources = response.filter((source) => {
          return source.host !== 'vip.zhuishushenqi.com';
        });
        if(!book.extra){
          book.extra = {}
        }
        book.extra.currentSource = avalibleSources[0]._id;
        book.extra.sources = avalibleSources;
        this.setData({book: book, currentSource: avalibleSources[0]._id});
        wx.setStorageSync(book._id, book);
        return response;
      });
  },

  bindViewTap: function(e){
    if(this.data.showModal){
      this.setData({showModal: false});
    } else {
      this.setData({showFooter: !this.data.showFooter});
    }
  },

  showSources: function(){
    const timeagoInstance = timeago();
    const modalList = this.data.book.extra.sources.map(source => {
      source.updated = timeagoInstance.format(source.updated, 'zh_CN');
      return source;
    });
    this.setData({modalList: modalList, showModal: true, isChapterList: false});
  },

  showChapters: function(){
    this.setData({modalList: this.data.book.extra.chapters, showModal: true, isChapterList: true, toView: `index-${this.data.readIndex}`});
  },

  readChapter: function(e){
    const index = e.currentTarget.dataset.chapterindex;
    this.getChapterContent(index);
  },

  changeSource: function(e){
    const bookSource = e.currentTarget.dataset.source;
    const book = this.data.book;
    this.setData({ loading: true });
    this.getNewestChapters()
      .then(response => {
        book.extra.currentSource = bookSource._id;
        this.setData({book: book, showModal: false, loading: false});
        wx.setStorageSync(book._id, book);
        return this.getChapterContent(this.data.readIndex);
      })
      .catch(e => {
        this.setData({loading: false });
        wx.showToast({
          title: '获取资源失败，请换源重试!',
          icon: 'warn',
          duration: 2000
        });
        console.error(e);
      }
    );;
  },

  prevChapter: function(){
    if(this.data.readIndex <= 0){
      return this.showToast('这已经是第一章啦！');
    } else {
      this.getChapterContent(--this.data.readIndex);
    }
  },
  nextChapter: function(){
    if(this.data.readIndex >= this.data.book.extra.chapters.length) {
      return this.showToast('没有最新章节啦， 请等候更新！');
    } else {
      this.getChapterContent(++this.data.readIndex);
    }
  }
})
