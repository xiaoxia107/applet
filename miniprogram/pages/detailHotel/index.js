
Page({
  onShareAppMessage() {
    return {
      title: 'form',
      path: 'page/component/pages/form/form',
    }
  },

  data: {
    tempFileURL: '',
    fileID: '',
    address: '',
    name: '', 
    latitude: '',
    longitude: '', 
    roomTypeList: [],  
    person: '',
    personTel: '',
    remark: '',
    curId: '',
  },
  getDetail () { 
    if (!this.data.curId) return
    wx.showLoading({
      title: '',
    }); 
    const db = wx.cloud.database() 
    const banner = db.collection('hotels').doc(this.data.curId) 
    banner.get().then(res => { 
      let info = res.data 
      let marker = {
        id: this.data.curId,
        latitude: info.latitude,
        longitude: info.longitude,
        callout: { 
          name: info.name,
        }
      }  
      this.setData({ 
        fileID: info.fileID,
        address: info.address,
        name: info.name, 
        latitude: info.latitude, 
        longitude: info.longitude,   
        roomTypeList: info.roomTypeList,
        city: info.city,
        person: info.person,
        personTel: info.personTel,
        remark: info.remark,
        markers: [marker]
      }) 
      marker = null

      if (info.fileID) {
        wx.cloud.getTempFileURL({
          fileList: [info.fileID],
          success: fileURL => {  
            let list = fileURL.fileList
            list.forEach(m => {
              if (info.fileID === m.fileID) {
                info.tempFileURL = m.tempFileURL
              }
            })
            this.setData({
              tempFileURL: info.tempFileURL
            });
          },
          fail: err => {
            // handle error
          }
        }) 
      } 
    }).finally(() => {
      wx.hideLoading();
    })
  },
  onLoad(option){ 
    this.setData({
      curId: option.id
    })
    this.getDetail()
  }
})
