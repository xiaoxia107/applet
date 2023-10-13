const { cityList } = require('../../cityList.js');
Page({
  onShareAppMessage() {
    return {
      title: 'form',
      path: 'page/component/pages/form/form',
    }
  },

  data: {
    tempFilePaths: '',
    fileID: '',
    address: '',
    name: '',
    roomType: '',
    latitude: 39.909088,
    longitude: 116.397643,
    inputValue: '',
    array: [],
    showPicker: false,
    roomTypeList: [
      {
        roomType: '',
        price: ''
      }
    ],
    city: '',
    district: '',
    province: '',
    cityList: [],
    curId: '',
    bindkeyboardheight: ''
  },
  bindkeyboardheightchange: function (e) {
    this.setData({
      bindkeyboardheight: e.detail.height
    }) 
  },
  bindmarkertap: function (e) { 
    this.data.markers.forEach(it => {
      if (it.id === e.detail.markerId) {
        let info = it.callout
        this.setData({  
          latitude: info.latitude,
          longitude: info.longitude,
          address: info.address,
          inputValue: info.inputValue,
          name:info.name,
          city: info.city,
          district: info.district,
          province: info.province,
        })
      }
    })
  },
  bindCityPickerChange: function(e) { 
    let _this = this 
    _this.data.cityList.forEach((it, idx) => {
      if (idx == e.detail.value) { 
        _this.setData({ 
          latitude: '',
          longitude: '',
          address: '',
          inputValue: '',
          name: '',
          city: it,
          district: '',
          province: '',
        })
        wx.setStorage({ key:"defaultcity",  data: it})
      }
    }) 
  },

  onDel (e) { 
    let _this = this
    let index =  e.currentTarget.dataset.index
    wx.showModal({
      title: '提示',
      content: '确定删除该房型',
      success:  (res) => {
        if (res.confirm) { 
          let roomTypeList = _this.data.roomTypeList
          roomTypeList.splice(0, index)
          _this.setData({
            roomTypeList: roomTypeList
          }) 
        }
      }
    })
  }, 

  bindRoomTypeInput: function(e) {
    let _this = this
    let index =  e.currentTarget.dataset.index
    let roomTypeList = _this.data.roomTypeList
    roomTypeList[index].roomType = e.detail.value
    _this.setData({
      roomTypeList: roomTypeList
    })
  },
  bindRoomPriceInput: function(e) {
    let _this = this
    let index =  e.currentTarget.dataset.index
    let roomTypeList = _this.data.roomTypeList
    roomTypeList[index].price = e.detail.value
    _this.setData({
      roomTypeList: roomTypeList
    })
  },
  addRoomType: function () {
    let _this = this
    let params = {
      roomType: '',
      price: ''
    }
    let roomTypeList = _this.data.roomTypeList
    roomTypeList.push(params)
    _this.setData({
      roomTypeList: roomTypeList
    })
  },
  bindPickerChange: function(e) {
    let _this = this 
    _this.data.array.forEach((it, idx) => {
      if (idx == e.detail.value) { 
        _this.setData({
          latitude: it.location.lat,
          longitude: it.location.lng,
          address: it.address,
          inputValue: it.title,
          name: it.title,
          city: it.ad_info.city,
          district: it.ad_info.district,
          province: it.ad_info.province,
        })
      }
    })
  },
  bindKeyblur: function(e) { 
    this.buttonSearch()
  },
  bindPersonInput: function (e)  {
    this.setData({
      person: e.detail.value
    })
  },
  bindTelInput: function (e)  {
    this.setData({
      personTel: e.detail.value
    })
  },
  bindKeyInput: function (e) { 
    this.setData({
      inputValue: e.detail.value
    })
    if (this.data.inputValue) {
      this.setData({
        showPicker: true
      })
    } else {
      this.setData({
        showPicker: false
      })
    }
    this.buttonSearch()
  },
  buttonSearch(e){
    if(!this.data.inputValue) return
    var _this = this
    var allMarkers = []
    let keywords = _this.data.inputValue 
    let city = _this.data.city ? (_this.data.city !== '不限' ? _this.data.city : '') : ''
    //通过wx.request发起HTTPS接口请求
    wx.request({
      //地图WebserviceAPI地点搜索接口请求路径及参数（具体使用方法请参考开发文档）
      url: `https://apis.map.qq.com/ws/place/v1/search?page_index=1&page_size=100&boundary=region(${city},1)&keyword=${keywords}&key=MSXBZ-VGVWV-XQGPQ-5ON3L-2VST6-PNFGY`,
      success(res){
        var result = res.data 
        var pois = result.data
        for(var i = 0; i< pois.length; i++){
          var title = pois[i].title
          var lat = pois[i].location.lat
          var lng = pois[i].location.lng 
          var address = pois[i].address 
          var city = pois[i].ad_info.city
          var district = pois[i].ad_info.district
          var province = pois[i].ad_info.province

        
          let marker = {
            id: i,
            latitude: lat,
            longitude: lng,
            callout: { 
              latitude: lat,
              longitude: lng,
              address: address, 
              name: title,
              city: city,
              district: district,
              province: province,
            }
          }
          allMarkers.push(marker)
          marker = null
        }  
        if (allMarkers?.length) {
          _this.setData({
            latitude: allMarkers[0].latitude,
            longitude: allMarkers[0].longitude,
            markers: allMarkers,
            array: pois
          })
        } 
      }
    })
  },
  uploadImg () { 
    const self = this
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success (chooseResult) {
                // tempFilePath可以作为img标签的src属性显示图片  
                const tempFilePaths =  chooseResult.tempFilePaths[0] 
                self.setData({
                  tempFilePaths: tempFilePaths
                })
                // 将图片上传至云存储空间
                const cloudPath = `cloudbase/hotels/${Date.now()}-${Math.floor(Math.random(0, 1) * 1000)}` + tempFilePaths.match(/\.[^.]+?$/)
                wx.cloud.uploadFile({
                  // 指定上传到的云路径
                  cloudPath: cloudPath,
                  // 指定要上传的文件的小程序临时文件路径
                  filePath: tempFilePaths, 
                  success: res => {
                    wx.showToast({
                      title: '上传成功',
                      icon: 'success',
                      duration: 2000
                    }) 
                    if (self.data.fileID) {
                      wx.cloud.deleteFile({
                        fileList: [self.data.fileID]
                      })
                    } 
                    self.setData({
                      fileID: res.fileID
                    })
                  },
                }) 
      }
    })
  },

  formSubmit(e) { 
            if (!this.data.name) {
              wx.showToast({
                title: '酒店名称不能为空',
                icon: 'error',
                duration: 2000
              })  
              return
            }
            if (!this.data.address) {
              wx.showToast({
                title: '酒店地址不能为空',
                icon: 'error',
                duration: 2000
              })  
              return
            }
            if (!this.data.person) {
              wx.showToast({
                title: '联系人不能为空',
                icon: 'error',
                duration: 2000
              })  
              return
            }
            if (!this.data.personTel) {
              wx.showToast({
                title: '联系方式不能为空',
                icon: 'error',
                duration: 2000
              })  
              return
            }

            let roomTypeList = this.data.roomTypeList.filter(it => {
              return it.roomType && it.price
            })

            if (!roomTypeList.length) {
              wx.showToast({
                title: '房型不能为空',
                icon: 'error',
                duration: 2000
              })  
              return
            } 
            const db = wx.cloud.database()
            let params = e.detail.value
            params.fileID = this.data.fileID   
            params.latitude = this.data.latitude
            params.longitude = this.data.longitude 
            params.city = this.data.city
            params.district = this.data.district
            params.province = this.data.province
            params.ad_info = params.name + '_' + params.address
            params.roomTypeList = this.data.roomTypeList.filter(it => {
              return it.roomType && it.price
            })

            let minPrice = params.roomTypeList[0].price
            let minRoomType = params.roomTypeList[0].roomType
            params.roomTypeList.forEach(it => {
              if (it.price < minPrice) {
                minPrice = it.price
                minRoomType = it.roomType
              }
            })
            params.minPrice =  minPrice
            params.minRoomType = minRoomType
            params.createTime =  db.serverDate() 
           
            if (!this.data.curId) {
              const dbName = 'hotels'
              db.collection(dbName).add({ 
                data: params,
                success: function(res) { 
                  wx.showToast({
                    title: '保存成功',
                    icon: 'success',
                    duration: 2000
                  }) 
                  wx.navigateBack()
                }
              })
            } else { 
              let info = params   
              wx.cloud.callFunction({ 
                name: 'update',
                data: {
                  id: this.data.curId,
                  params: {
                    fileID: info.fileID,
                    address: info.address,
                    name: info.name, 
                    latitude: info.latitude, 
                    longitude: info.longitude, 
                    inputValue: info.name,  
                    roomTypeList: info.roomTypeList,
                    city: info.city,
                    district: info.district,
                    province: info.province,
                    person: info.person,
                    personTel: info.personTel,
                    remark: info.remark,
                    minPrice: info.minPrice,
                    minRoomType: info.minRoomType,
                    ad_info: info.name + '_' + info.address
                  }
                }
              }).then(res => {
                 wx.showToast({
                    title: '保存成功',
                    icon: 'success',
                    duration: 2000
                  }) 
                  wx.navigateBack()
              })
            }
  },

  formReset(e) { 
    this.setData({
      tempFilePaths: '',
      fileID: '',
      address: '',
      name: '', 
      latitude: 39.909088,
      longitude: 116.397643,
      inputValue: '',
      array: [],
      showPicker: false,
      roomTypeList: [
        {
          roomType: '',
          price: ''
        }
      ],
      city: '',
      district: '',
      province: '',
      person: '',
      personTel: '',
      remark: ''
    })
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
        inputValue: info.name,  
        roomTypeList: info.roomTypeList,
        city: info.city,
        district: info.district,
        province: info.province,
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
                this.setData({
                  tempFilePaths: m.tempFileURL
                }); 
              }
            })
           
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
    let tempArr = cityList.filter(it => {
      return it !== '不限'
    })
    this.setData({
      cityList: tempArr,
      curId: option.id
    })
    if (!this.data.curId) {
      var city = wx.getStorageSync('defaultcity') 
      if (city) {
        this.setData({
          city: city
        })
      }
    } else {
      this.getDetail()
    }
  }
})
