// index.js
// const app = getApp()
const { envList } = require('../../envList.js');
const { cityList } = require('../../cityList.js');

Page({
  data: {
    showUploadTip: false,
    powerList: [],
    envList,
    selectedEnv: envList[0],
    haveCreateCollection: false,
    inputValue: '', 
    envId: '',
    openId: '',
    isSuper: false,
    whiteList: ['o67OI6_TL0mPPDM4qXZZqHtvwWIA', 'o67OI69ceLuLc2bh_RRgvZj1W9bQ', 'o67OI66ktsoOtRwWn0nhTvwBSxNQ'],
    city: '成都',
    showPicker: false,
    cityList: cityList,
    loading: false
  }, 
  copyAction: function () {
    wx.setClipboardData({
      data: this.data.openId,
      success: function() {
        wx.showToast({
          title: '复制成功',
        })
      }
    })
  },
  jumpEdit: function(e) {  
    let id =  e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/addHotel/index?id=${id}`, 
    });
  },
  jumpDetail: function(e) {  
    wx.navigateTo({
      url: `/pages/detailHotel/index?id=${e.currentTarget.id}`, 
    });
  },
  bindPickerChange: function(e) { 
    let _this = this 
    _this.data.cityList.forEach((it, idx) => {
      if (idx == e.detail.value) { 
        _this.setData({ 
          city: it, 
        })
        wx.setStorage({ key:"city",  data: it })
      }
    })
    _this.getList()
  },
  clear () { 
    this.setData({
      inputValue: ''
    })
    this.getList()
  },
  getOpenId() {
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: {
        type: 'getOpenId'
      }
    }).then((resp) => { 
      let userId = resp.result.userInfo.openId   
      const db = wx.cloud.database() 
      const banner = db.collection('user').where({ userId: userId}) 
      banner.get().then(res => { 
        let info = res.data[0]  
        let nickname = wx.getStorageSync('nickname')  
        if (info) { 
          wx.setStorage({ key:"id",  data: info._id})

          this.setData({
            isSuper: info.isSuper ? true : false
          }) 
         
          if (nickname !== info.nickname)  {
            const dbName = 'user'
            const db = wx.cloud.database() 
            db.collection(dbName).doc(info._id).update({
              data: {
                nickname: nickname
              }
            }) 
          }
        } else {
          const dbName = 'user'
          db.collection(dbName).add({
            data: {
              userId: userId,
              isSuper: false,
              createTime: db.serverDate(),
              nickname: nickname || ''
            }
          })
          this.setData({
            isSuper:  false
          })
        }
      }) 
   }) 
  },
  onDel (e) { 
    let id =  e.currentTarget.dataset.id
    let fileID = e.currentTarget.dataset.fileid 
    wx.showModal({
      title: '提示',
      content: '确定删除该酒店',
      success:  (res) => {
        if (res.confirm) { 
          wx.cloud.callFunction({
            name: 'delRecord',
            data: {
              id: id  
            },
            success: (res) => {    
              wx.hideLoading();
              wx.showToast({
                title: '删除成功',
                icon: 'success',
                duration: 2000
              })  
              this.getList() 
              if (fileID) {
                wx.cloud.deleteFile({
                  fileList: [fileID]
                })
              } 
            }
          }) 
        }
      } 
    })
  }, 
  lower(e) {
    console.log('lower',e)
  },
  scrollToTop() {
    this.setAction({
      scrollTop: 0
    })
  },
  bindKeyInput: function (e) {
    this.setData({
      inputValue: e.detail.value
    })
  },
  onSearch() {
    this.getList() 
  },
  onClickPowerInfo(e) {
    console.log('onClickPowerInfo')
  },
  jumpPage(e) {
    wx.navigateTo({
      url: `/pages/addHotel/index`,
    });
  },
  async getImgList (fileList) {
    let total = fileList.length
    if (total) {
      const batchTimes = Math.ceil(total / 50) 
      const tasks = []
      for (let i = 0; i < batchTimes; i++) {
        const promise = wx.cloud.getTempFileURL({
          fileList: fileList
        })
        tasks.push(promise)
      }
      return (await Promise.all(tasks)).reduce((acc, cur) => {
        return {
          data: acc.data.concat(cur.data),
          errMsg: acc.errMsg,
        }
      })
    }
  },
  getList () {  
    let dataList = [] 
    let _this = this
    this.setData({
      powerList: []
    })
    let inputValue = _this.data.inputValue || ''
    let city = _this.data.city ? (_this.data.city !== '不限' ? _this.data.city : '')  : ''
    wx.showLoading({
      title: '',
    }); 
    _this.setData({
      loading: true
    })
    wx.cloud.callFunction({
      name: 'queryRecord',
      data: {
        inputValue: inputValue,
        city: city
      },
      success: (res) => {   
        wx.hideLoading();
        let data = res.result.data
        dataList = res.result.data
        this.setData({
          powerList: dataList
        });
        let fileList = data.map(i => {
          return i.fileID
        })
        fileList = fileList.filter(it => {
          return it
        }) 
        this.getImgList(fileList).then(res => { 
              let list = res.fileList
              if (list.length) {
                dataList.forEach(n => {
                  list.forEach(m => {
                    if (n.fileID === m.fileID) {
                      n.tempFileURL = m.tempFileURL
                    }
                  })
                }) 
                this.setData({
                  powerList: dataList
                });  
              } 
        }).finally(() => {
          wx.hideLoading();
          this.setData({
            loading: false
          })
        })
      },
      fail: () => {
        wx.hideLoading();
        _this.setData({
          loading: false
        })
      }
    }) 
  },
  onShow(options) {
    this.getList()
  }, 
  onLoad(options) { 
    this.getOpenId()
    var city = wx.getStorageSync('city') 
    if (city) {
      this.setData({
        city: city
      })
    } else {
      wx.setStorage({ key:"city",  data:"不限"})
    }
    let nickname = wx.getStorageSync('nickname') 
    if (!nickname) {
      this.setData({
        showUploadTip: true
      })
    }
  }   
});
