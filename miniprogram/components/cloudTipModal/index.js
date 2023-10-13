// miniprogram/components/cloudTipModal/index.js
const { isMac } = require('../../envList.js');

Component({

  /**
   * 页面的初始数据
   */
  data: {
    showUploadTip: false,
    nickname: ''
  },
  properties: {
    showUploadTipProps: Boolean
  },
  observers: {
    showUploadTipProps: function(showUploadTipProps) {
      this.setData({
        showUploadTip: showUploadTipProps
      });
    }
  },
  methods: {
    bindKeyInput: function (e) {
      this.setData({
        nickname: e.detail.value
      })
    },
    submitForm () {
      wx.setStorage({ key:"nickname",  data: this.data.nickname }) 
      this.onChangeShowUploadTip()
      const dbName = 'user'
      const db = wx.cloud.database() 
      let _id = wx.getStorageSync('id')  
      if (_id) {
        db.collection(dbName).doc(_id).update({
          data: {
            nickname: this.data.nickname
          }
        }) 
      }

    },
    onChangeShowUploadTip() {
      this.setData({
        showUploadTip: !this.data.showUploadTip
      });
    }
  }
});
