// index.js
import base64 from "base64-js"
Page({
  data: {
    language: 'zh', // 默认语言为中文
    selectedImage: '', // 存储选中图片的路径
    overlayImage: '', // 存储后端返回图片的路径
    clinicalData: {
      gestationalAge: '',
      rbc: '',
      hb: '',
      wbc: '',
      wbcDiff: '',
      plt: ''
    },
   
    diagnosisResult: ' ', // 诊断结果
    diagnosisText: '', // 存储后端返回的文本信息\
    records: [], // 存储所有记录
    showForm: false,
    overlayImageOpacity: 1, // 初始透明度
    scaleValue: 1,
    imageContainerHeight: 0 // 初始化图片容器高度
  },

  toggleForm() {
    this.setData({
      showForm: !this.data.showForm
    });
  },
  onLoad() {
    // 从存储中获取语言设置
    const language = wx.getStorageSync('language') || 'zh';
    const records = wx.getStorageSync('records') || [];
    this.setData({ language, records });
  },

  switchLanguage() {
    const newLanguage = this.data.language === 'zh' ? 'en' : 'zh';
    this.setData({ language: newLanguage });
    wx.setStorageSync('language', newLanguage);
  },

  onRead() {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        wx.getImageInfo({
          src: tempFilePath,
          success: (imgInfo) => {
            // 计算图片高度
            const screenWidth = wx.getSystemInfoSync().screenWidth;
            const imgHeight = (screenWidth / imgInfo.width) * imgInfo.height;

            this.setData({
              selectedImage: tempFilePath,
              overlayImage: '',
              overlayImageOpacity: 1.0,
              diagnosisText: '',
              scaleValue: 1,
              imageContainerHeight: imgHeight // 设置图片容器高度
            });
          }
        });
      }
    });
    
  },
  onScaleChange(e) {
    this.setData({
      scaleValue: e.detail.scale
    });
  },

  onInput(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    this.setData({
      clinicalData: {
        ...this.data.clinicalData,
        [field]: value
      }
    });
  },
  

  onOverlayImageOpacityChange(e) {
    const value = e.detail.value / 100;
    this.setData({ overlayImageOpacity: value });
  },

  onRecord() {
    wx.showToast({
      title: this.data.language === 'en' ? 'Record clicked' : '记录被点击',
      icon: 'none'
    });
  },
  onInputChange(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      clinicalData: {
        ...this.data.clinicalData,
        [field]: e.detail.value
      }
    });
  },
  onRecord() {
    wx.navigateTo({
      url: '/pages/record/record'
    });
  },
  translateField(field) {
    const fieldMap = {
      gestationalAge: '胎龄',
      rbc: '红细胞计数(RBC)',
      hb: '血红蛋白(Hb)',
      wbc: '白细胞(WBC)',
      wbcDiff: '白细胞分类计数',
      plt: '血小板(PLT)'
    };
    return fieldMap[field] || field;
  },
  onDiagnose() {
    const { selectedImage, clinicalData } = this.data;
    if (!selectedImage) {
      wx.showToast({
        title: this.data.language === 'en' ? 'Please select an image first' : '请先选择图片',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: this.data.language === 'en' ? 'Diagnosing...' : '诊断中...'
    });

    const isClinicalDataEmpty = Object.values(clinicalData).every(value => value === '');
    const clinicalDataArray = Object.values(clinicalData);
    console.log("是否输入内容=========",isClinicalDataEmpty)
    const url = isClinicalDataEmpty ? 'https://medrobnec.icu/predict' : 'https://medrobnec.icu/predict/params';
    
    
    // 上传图片和临床数据到服务器
    if(isClinicalDataEmpty){
      wx.uploadFile({
        url: url, 
        filePath: selectedImage,
        name: 'file',
        success: (res) => {
          wx.hideLoading();
          console.log(res.data)
          const data= res.data
          console.log()
  
          const base64 = data
          const overlayImageUrl = `data:image/png;base64,${base64}`;
  
              this.setData({
                overlayImage: overlayImageUrl, // 更新显示的叠加图片
                diagnosisText: data.text // 更新显示的诊断文本
              });
               
              const diagnosis = {
                clinicalData,
                diagnosisText: data.text,
                overlayImage: overlayImageUrl
              };
          // 保存记录到本地存储
          const records = wx.getStorageSync('records') || [];
          records.push(diagnosis);
          wx.setStorageSync('records', records);
          this.setData({ records });
  
          wx.showToast({
            title: this.data.language === 'en' ? 'Diagnosis successful' : '诊断成功',
            icon: 'success'
          });
        },
        fail: (err) => {
          console.log("=============---",err)
          wx.hideLoading();
          wx.showToast({
            title: this.data.language === 'en' ? 'Diagnosis failed' : '诊断失败',
            icon: 'none'
          });
        }
      });
    }else{
      console.log("else内==============",clinicalDataArray)
     
      wx.uploadFile({
        url: url, 
        filePath: selectedImage,
        name: 'file',
        formData: {
          params: JSON.stringify(clinicalDataArray)
        },
        success: (res) => {
          wx.hideLoading();
          const data= JSON.parse(res.data)
          console.log(clinicalDataArray,"诊断数据")
  
          const base64 = data.image
          const overlayImageUrl = `data:image/png;base64,${base64}`;
          const diagnosisTextArray = JSON.parse(data.text);
          console.log("分割结构",diagnosisTextArray )
          const diagnosisText = diagnosisTextArray.map((text, index) => {
            const field = Object.keys(clinicalData)[index];
            const fieldLabel = this.data.language === 'en' ? field : this.translateField(field);
            return `${fieldLabel}: ${text}`;
          }).join('\n');
          console.log("分割结构",diagnosisText)
              this.setData({
                overlayImage: overlayImageUrl, // 更新显示的叠加图片
                diagnosisText: diagnosisText // 更新显示的诊断文本
              });
               
              const diagnosis = {
                clinicalData,
                diagnosisText: diagnosisText,
                overlayImage: overlayImageUrl
              };
          // 保存记录到本地存储
          const records = wx.getStorageSync('records') || [];
          records.push(diagnosis);
          wx.setStorageSync('records', records);
          this.setData({ records });
  
          wx.showToast({
            title: this.data.language === 'en' ? 'Diagnosis successful' : '诊断成功',
            icon: 'success'
          });
        },
        fail: (err) => {
          console.log("=============---",err)
          wx.hideLoading();
          wx.showToast({
            title: this.data.language === 'en' ? 'Diagnosis failed' : '诊断失败',
            icon: 'none'
          });
        }
      });
    }
    
  },
  
});