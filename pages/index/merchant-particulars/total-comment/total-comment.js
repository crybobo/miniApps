import Api from '/../../../../utils/config/api.js';  //每个有请求的JS文件都要写这个，注意路径
import { GLOBAL_API_DOMAIN } from '/../../../../utils/config/config.js';
var app = getApp();
Page({
  data: {
    _build_url: GLOBAL_API_DOMAIN,
    comment_list: [],
    userId: app.globalData.userInfo.userId ? app.globalData.userInfo.userId : 1,     //登录用户的id
    page: 1,
    id:'',
    source:'',   //请求来源   查明是谁来调用这个文件
    cmtType:'',  //评论类别
    reFresh: true
  },
  onLoad: function (options) {
    console.log(options)
    this.setData({
      id: options.id,
      // source: options.source,
      cmtType: options.cmtType
    });
    this.commentList();
  },
  //评论列表
  commentList: function () {
    let that = this;
    wx.request({
      url: that.data._build_url + 'cmt/list',
      data: {
        refId: that.data.id,
        cmtType: that.data.cmtType,
        zanUserId: that.data.userId,
        page: that.data.page,
        rows: 8
      },
      success: function (res) {
        let data = res.data;
        if (data.code == 0 && data.data.list != null && data.data.list != "" && data.data.list != []) {
          let comment_list = that.data.comment_list;
          for (let i = 0; i < res.data.data.list.length; i++) {
            comment_list.push(res.data.data.list[i]);
          }
          that.setData({
            comment_list: comment_list,
            reFresh: true
          })
        } else {
          that.setData({
            reFresh: false
          })
        }
      }
    })
  },
  //评论点赞
  toLike: function (event) {
    let that = this,
      id = event.currentTarget.id,
      index = "";
    for (var i = 0; i < this.data.comment_list.length; i++) {
      if (this.data.comment_list[i].id == id) {
        index = i;
      }
    }
    wx.request({
      url: that.data._build_url + 'zan/add?refId=' + id + '&type=4&userId=' + that.data.userId,
      method: "POST",
      success: function (res) {
        if (res.data.code == 0) {
          wx.showToast({
            icon: 'none',
            title: '点赞成功'
          })
          var comment_list = that.data.comment_list
          comment_list[index].isZan = 1;
          comment_list[index].zan++;
          that.setData({
            comment_list: comment_list
          });
        }
      }
    })
  },
  //取消点赞
  cancelLike: function (event) {
    let that = this,
      id = event.currentTarget.id,
      cmtType = "",
      index = "";
    for (var i = 0; i < this.data.comment_list.length; i++) {
      if (this.data.comment_list[i].id == id) {
        index = i;
      }
    }
    wx.request({
      url: that.data._build_url + 'zan/delete?refId=' + id + '&type=4&userId=' + that.data.userId,
      method: "POST",
      success: function (res) {
        if (res.data.code == 0) {
          wx.showToast({
            icon: 'none',
            title: '已取消'
          })
          var comment_list = that.data.comment_list
          comment_list[index].isZan = 0;
          comment_list[index].zan == 0 ? comment_list[index].zan : comment_list[index].zan--;
          console.log(comment_list[index].zan)
          that.setData({
            comment_list: comment_list
          });
        }
      }
    })
  },
  //用户下拉刷新
  onPullDownRefresh: function() {
    let that = this;
    this.setData({
      page: 1
    });
    that.commentList();
    wx.stopPullDownRefresh();
    // wx.showLoading({
    //   title: '加载中...',
    //   success: function() {
    //     setTimeout(() => {
    //       wx.hideLoading();
    //     }, 500);
    //   }
    // })
  },
  //用户上拉触底
  onReachBottom: function() {
    if (this.data.reFresh) {
      this.setData({
        page: this.data.page + 1
      });
      this.commentList();
    }
  }
})