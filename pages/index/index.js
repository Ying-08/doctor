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
    imageContainerHeight: 0 ,// 初始化图片容器高度
    reaction: 0, // 清醒
    reactionOptions: ['清醒', '嗜睡', '昏睡'], // 英文：['Awake', 'Drowsy', 'Comatose']
    temperatureStatus: 0, // 0: 正常, 1: 异常
    temperatureStatusOptions: ['正常', '异常'],
    temperature: 37, // 默认体温为37
    circulatory: {
      CRT: 20,
      heart_rate: 120,
      systolic_pressure: 80
    },
    respiratory: {
      respiratory_rate: 45,
      respiratory_pause: 0, // 默认无呼吸暂停
      respiratory_support: 0 // 默认不需要呼吸支持
    },
    abdomen: {
      abdominal_distension: 0, // 腹胀：无
      bowel_sound: 0, // 肠鸣音：正常
      abdominal_tenderness: 0, // 腹部触痛：否
      abdominal_erythema: 0, // 腹部红斑：否
      bloody_stool: 0 // 血便：否
    },
    feeding: {
      gastric_residual: 10, // 胃潴留
      bilious_vomiting: 0, // 胆汁呕吐
      formula_feeding: 0 // 奶粉喂养
    },
    examination: {
      fecal_occult_blood: 0, // 大便潜血：否
      platelet: 200, // 血小板
      lactate: 1.5, // 乳酸
      hco3: 24, // HCO3-
      pco2: 40, // PCO2
      neutrophils: 5, // 中性粒细胞
      dic: 0 // DIC：否
    },
    imaging: {
      xRay: 0, // X线：无
      ascites: 0, // 腹水：否
      pneumoperitoneum: 0 // 气腹：否
    },
    other: {
      BW: 2500, // 体重
      GA: 35 // 孕周
    },
    yesNoOptions: ['否', '是'],
    trueOrFalse:[false, true],
    abdominalDistensionOptions: ['无', '轻度', '明显'],
    bowelSoundOptions: ['正常', '减弱', '消失'],
    xRayOptions: ['无', '有'], // X线选项
    isFormValid: true,
    infantType: 0, // 默认选择早产儿
    infantTypeOptions: ['早产儿', '足月儿'], // 婴儿类型选项
    premature_infant: 45, // 早产儿的值
    full_term_infant: 55, // 足月儿的值
    user: {
      username: '',
      hospitalization_number: ''
    }
  },

  toggleForm() {
    this.setData({
      showForm: !this.data.showForm
    });
  },
   // 更新选项内容
   updateOptions(language) {
    this.setData({
      reactionOptions: language === 'en' 
        ? ['Awake', 'Drowsy', 'Comatose'] 
        : ['清醒', '嗜睡', '昏睡'],
      temperatureStatusOptions: language === 'en' 
        ? ['Normal', 'Abnormal'] 
        : ['正常', '异常'],
      infantTypeOptions: language === 'en' 
        ? ['Full-Term Infant', 'Premature Infant'] 
        : ['足月儿', '早产儿'],
      yesNoOptions: language === 'en' 
        ? ['No', 'Yes'] 
        : ['否', '是'],
      abdominalDistensionOptions: language === 'en' 
        ? ['No Distension', 'Distension'] 
        : ['无腹胀', '有腹胀'],
      bowelSoundOptions: language === 'en' 
        ? ['Normal', 'Abnormal'] 
        : ['正常', '异常']
    });
  },
  onLoad() {
    // 从存储中获取语言设置
    const language = wx.getStorageSync('language') || 'zh';
    const records = wx.getStorageSync('records') || [];
    this.setData({ language, records });
    this.updateOptions(language)
  },

  switchLanguage() {
    const newLanguage = this.data.language === 'zh' ? 'en' : 'zh';
    this.setData({ language: newLanguage });
    wx.setStorageSync('language', newLanguage);
    this.updateOptions(newLanguage)
  },

  onRead() {
    console.log("点击了读片===========")
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

   // 处理反应选择变化
   onReactionChange(e) {
    this.setData({
      reaction: e.detail.value
    });
    this.checkFormValidity();
  },

  // 处理体温状态变化
  onTemperatureStatusChange(e) {
    const selectedStatus = e.detail.value;
    const newTemperature = selectedStatus == 0 ? 37 : 36; // 正常 -> 37, 异常 -> 36
    this.setData({
      temperatureStatus: selectedStatus,
      temperature: newTemperature
    });
    this.checkFormValidity();
  },

  // 处理CRT变化
  onCRTChange(e) {
    this.setData({
      'circulatory.CRT': e.detail.value
    });
    this.checkFormValidity();
  },

  // 处理心率变化
  onHeartRateChange(e) {
    this.setData({
      'circulatory.heart_rate': e.detail.value
    });
    this.checkFormValidity();
  },

  // 处理收缩压变化
  onBloodPressureChange(e) {
    this.setData({
      'circulatory.systolic_pressure': e.detail.value
    });
    this.checkFormValidity();
  },

  // 处理呼吸频率变化
  onRespiratoryRateChange(e) {
    this.setData({
      'respiratory.respiratory_rate': e.detail.value
    });
    this.checkFormValidity();
  },

  // 处理呼吸暂停变化
  onRespiratoryPauseChange(e) {
    this.setData({
      'respiratory.respiratory_pause': e.detail.value
    });
    this.checkFormValidity();
  },

  // 处理提高呼吸支持变化
  onRespiratorySupportChange(e) {
    this.setData({
      'respiratory.respiratory_support':e.detail.value
    });
    this.checkFormValidity();
  },

  // 处理腹胀变化
  onAbdominalDistensionChange(e) {
    this.setData({
      'abdomen.abdominal_distension': e.detail.value
    });
    this.checkFormValidity();
  },

  // 处理肠鸣音变化
  onBowelSoundChange(e) {
    this.setData({
      'abdomen.bowel_sound': e.detail.value
    });
    this.checkFormValidity();
  },

  // 处理腹部触痛变化
  onAbdominalTendernessChange(e) {
    this.setData({
      'abdomen.abdominal_tenderness': e.detail.value
    });
    this.checkFormValidity();
  },

  // 处理腹部红斑变化
  onAbdominalErythemaChange(e) {
    this.setData({
      'abdomen.abdominal_erythema': e.detail.value
    });
    this.checkFormValidity();
  },

  // 处理血便变化
  onBloodyStoolChange(e) {
    this.setData({
      'abdomen.bloody_stool': e.detail.value
    });
    this.checkFormValidity();
  },

  // 处理胃潴留变化
  onGastricResidualChange(e) {
    this.setData({
      'feeding.gastric_residual': e.detail.value
    });
    this.checkFormValidity();
  },

  // 处理胆汁呕吐变化
  onBiliousVomitingChange(e) {
    this.setData({
      'feeding.bilious_vomiting': e.detail.value
    });
    this.checkFormValidity();
  },

  // 处理奶粉喂养变化
  onFormulaFeedingChange(e) {
    this.setData({
      'feeding.formula_feeding': e.detail.value
    });
    this.checkFormValidity();
  },

  // 处理大便潜血变化
  onFecalOccultBloodChange(e) {
    this.setData({
      'examination.fecal_occult_blood': e.detail.value
    });
    this.checkFormValidity();
  },

  // 处理血小板变化
  onPlateletChange(e) {
    this.setData({
      'examination.platelet': e.detail.value
    });
    this.checkFormValidity();
  },

  // 处理乳酸变化
  onLactateChange(e) {
    this.setData({
      'examination.lactate': e.detail.value
    });
    this.checkFormValidity();
  },

  // 处理HCO3-变化
  onHco3Change(e) {
    this.setData({
      'examination.hco3': e.detail.value
    });
    this.checkFormValidity();
  },

  // 处理PCO2变化
  onPco2Change(e) {
    this.setData({
      'examination.pco2': e.detail.value
    });
    this.checkFormValidity();
  },

  // 处理中性粒细胞变化
  onNeutrophilsChange(e) {
    this.setData({
      'examination.neutrophils': e.detail.value
    });
    this.checkFormValidity();
  },

  // 处理DIC变化
  onDicChange(e) {
    this.setData({
      'examination.dic': e.detail.value
    });
    this.checkFormValidity();
  },

  // 处理X线变化
  onXRayChange(e) {
    this.setData({
      'imaging.xRay': e.detail.value
    });
    this.checkFormValidity();
  },

  // 处理腹水变化
  onAscitesChange(e) {
    this.setData({
      'imaging.ascites': e.detail.value
    });
    this.checkFormValidity();
  },

  // 处理气腹变化
  onPneumoperitoneumChange(e) {
    this.setData({
      'imaging.pneumoperitoneum': e.detail.value
    });
    this.checkFormValidity();
  },

  // 处理BW变化
  onBWChange(e) {
    this.setData({
      'other.BW': e.detail.value
    });
    this.checkFormValidity();
  },

  // 处理GA变化
  onGAChange(e) {
    this.setData({
      'other.GA': e.detail.value
    });
    this.checkFormValidity();
  },

  // 处理婴儿类型的选择
  onInfantTypeChange(e) {
    const selectedInfantType = e.detail.value; // 获取选中的值，0为早产儿，1为足月儿
    this.setData({
      infantType: selectedInfantType // 更新婴儿类型的选择
    });
  },
  onUsernameInput(e) {
    this.setData({
      'user.username': e.detail.value
    });
  },

  onHospitalizationNumberInput(e) {
    this.setData({
      'user.hospitalization_number': e.detail.value
    });
  },

  // 检查表单有效性
  checkFormValidity() {
  
  },
  validateNestedFields(object) {
    return Object.values(object).every(value => {
      if (typeof value === 'boolean') return true; // 布尔值不需检查
      return value !== null && value !== '' && value !== undefined;
    });
  },
  submitForm() {
    const { formData } = this.data;
  
    // 检查所有字段是否填写，排除 BW 和 GA
    const requiredFields = ['reaction', 'temperature', 'circulatory', 'respiratory', 'abdomen', 'feeding', 'examination', 'infant', 'user'];
    for (const field of requiredFields) {
      if (!formData[field] || (typeof formData[field] === 'object' && !this.validateNestedFields(formData[field]))) {
        wx.showToast({ title: `${field} 不能为空`, icon: 'none' });
        return;
      }
    }
  },
  submitForm() {
    const { selectedImage } = this.data;
    if (!selectedImage) {
      wx.showToast({
        title: this.data.language === 'en' ? 'Please select an image first' : '请先选择图片',
        icon: 'none'
      });
      return;
    }

    const formData = {
      reaction: this.data.reaction, // 反应（清醒、嗜睡、昏睡）
      temperature: this.data.temperature, // 体温（number）
      circulatory: {
        CRT: this.data.circulatory.CRT, // CRT（number）
        heart_rate: this.data.circulatory.heart_rate, // 心率（number）
        systolic_pressure: this.data.circulatory.systolic_pressure // 收缩压（number）
      },
      respiratory: {
        respiratory_rate: this.data.respiratory.respiratory_rate, // 呼吸速率（number）
        respiratory_pause: Boolean(this.data.respiratory.respiratory_pause), // 呼吸暂停（boolean）
        respiratory_support: Boolean(this.data.respiratory.respiratory_support) // 呼吸支持（boolean）
      },
      abdomen: {
        abdominal_distension: this.data.abdomen.abdominal_distension, // 腹胀（枚举：无 0、轻度 1、明显 2）
        bowel_sound: this.data.abdomen.bowel_sound, // 腹鸣（枚举：正常 0、减弱 1、消失 2）
        abdominal_tenderness: Boolean(this.data.abdomen.abdominal_tenderness), // 腹部触痛（boolean）
        abdominal_erythema: Boolean(this.data.abdomen.abdominal_erythema), // 腹部红斑（boolean）
        bloody_stool: Boolean(this.data.abdomen.bloody_stool) // 血便（boolean）
      },
      feeding: {
        gastric_residual: this.data.feeding.gastric_residual, // 胃潴留（number）
        bilious_vomiting: this.data.feeding.bilious_vomiting, // 胆汁呕吐（boolean）
        formula_feeding: Boolean(this.data.feeding.formula_feeding) // 奶粉喂养（boolean）
      },
      examination: {
        fecal_occult_blood: Boolean(this.data.examination.fecal_occult_blood), // 大便潜血（boolean）
        platelet: this.data.examination.platelet, // 血小板（number）
        lactate: this.data.examination.lactate, // 乳酸（number）
        hco3: this.data.examination.hco3, // HCO3（number）
        pco2: this.data.examination.pco2, // PCO2（number）
        neutrophils: this.data.examination.neutrophils, // 中性粒细胞（number）
        dic: Boolean(this.data.examination.dic) // DIC（boolean）
      },
      infant: this.data.infantType === 0
        ? { premature_infant: this.data.premature_infant }
        : { full_term_infant: this.data.full_term_infant },
      other: {
        BW: this.data.other.BW, // 体重（number）
        GA: this.data.other.GA // 孕周（number）
      },
      user: this.data.user
    }

     // 验证逻辑 (确保除了 BW 和 GA 之外的字段都已填写)
     const requiredFields = [ 'circulatory', 'respiratory', 'abdomen', 'feeding', 'examination',  'user'];
    
     for (const field of requiredFields) {
       if (!formData[field] || (typeof formData[field] === 'object' && !this.validateNestedFields(formData[field]))) {
         wx.showToast({ title: `${field} 不能为空`, icon: 'none' });
         return;
       }
     }

     wx.showLoading({
      title: this.data.language === 'en' ? 'Diagnosing...' : '诊断中...'
    });
  console.log("提价了===============",formData)

  wx.uploadFile({
    url: 'https://medrobnec.icu/predict/params', 
    filePath: selectedImage,
    name: 'file',
    formData: {
      params: JSON.stringify(formData)
    },
    success: (res) => {
      wx.hideLoading();
     
      const data= JSON.parse(res.data)
      console.log("有结果了？？？",data)
      const base64 = data.image
      const overlayImageUrl = `data:image/png;base64,${base64}`;
      const diagnosisTextArray = ["bell","nec_socre"]
      const resData=[data.bell,data.nec_socre]
      const diagnosisText = diagnosisTextArray.map((text, index) => {
        return `${text}: ${resData[index]}`;
      }).join('\n');
      console.log("分割结构",diagnosisText)
          this.setData({
            overlayImage: overlayImageUrl, // 更新显示的叠加图片
            diagnosisText: diagnosisText // 更新显示的诊断文本
          });
           
          const diagnosis = {
            formData:formData,
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