// 以下為參數
const endpoint_computer_vision = "https://eastus.api.cognitive.microsoft.com/";
const endpoint_translator =
  "https://api.cognitive.microsofttranslator.com/translate";
let uri_choosed = "vision/v2.1/analyze";

let s_vision_key, s_translator_key;
let choose_f_id;
let params_computer_vision;

// 以下為functions

// 儲存KEY
function storage_key_save() {
  localStorage.setItem("vision_key", $("#vision_key").val());
  $("#vision_key").val($("#vision_key").val());
  localStorage.setItem("translator_key", $("#translator_key").val());
  $("#translator_key").val($("#translator_key").val());
}

// 檢查是否有KEY
function storage_key_get() {
  let s_vision_key, s_translator_key;

  if (localStorage.getItem("vision_key")) {
    s_vision_key = localStorage.getItem("vision_key");
    $("#vision_key").val(s_vision_key);
  }

  s_translator_key = localStorage.getItem("translator_key");
  $("#translator_key").val(s_translator_key);
}

// 刪除KEY
function storage_key_remove() {
  localStorage.removeItem("vision_key");
  $("#vision_key").val("");
  localStorage.removeItem("translator_key");
  $("#translator_key").val("");
}

// 分析圖片
function fun_done_analyze_img(data) {
  //顯示JSON內容
  $("#responseTextArea").val(JSON.stringify(data, null, 2)); //API回傳的原始資料 Response
  reset_target(); //清除target框框
  reset_target_word(); //清除辨識文字
  analyze_img_main(data); //生成標籤
}

// 描述圖片生成資料
function fun_done_describe_img(data) {
  //顯示JSON內容
  $("#responseTextArea").val(JSON.stringify(data, null, 2)); //API回傳的原始資料 Response
  $("#row_show_analyze_data").empty();
  $("#row_show_analyze_data").html(function () {
    let html_add = '<h3>分析結果</h3> <div class="col">';
    html_add +=
      '<div class="row" id="describe_tags"><h5 id="describe_tags_h5">描述標籤 Tags</h5>' +
      '<div class="cols col-12 col-md-5" id="describe_tags_sc"><h6>原始簡體中文</h6></div>' +
      '<div class="cols col-12 col-md-5" id="describe_tags_tc"><h6>翻譯繁體中文</h6></div></div>' +
      '<div class="row" id="describe_captions"><h5 id="describe_captions_h5">描述標題 Captions</h5>' +
      '<div class="cols col-12 col-md-5" id="describe_captions_sc"><h6>原始簡體中文</h6></div>' +
      '<div class="cols col-12 col-md-5" id="describe_captions_tc"><h6>翻譯繁體中文</h6></div></div>';

    html_add += "</div>";
    return html_add;
  });
  describe_img_tags(data);
  describe_img_captions(data);
}

// 失敗回傳
function fun_fial(jqXHR, textStatus, errorThrown) {
  //丟出錯誤訊息
  var errorString =
    errorThrown === "" ? "Error. " : errorThrown + " (" + jqXHR.status + "): ";
  errorString +=
    jqXHR.responseText === ""
      ? ""
      : jQuery.parseJSON(jqXHR.responseText).message
      ? jQuery.parseJSON(jqXHR.responseText).message
      : jQuery.parseJSON(jqXHR.responseText).error.message;
  alert(errorString);
  // var errorString =
  //   errorThrown === "" ? "Error. " : errorThrown + " (" + jqXHR.status + "): ";
  // errorString +=
  //   jqXHR.responseText === ""
  //     ? ""
  //     : jQuery.parseJSON(jqXHR.responseText).message;
  // alert(errorString);
}

// 選擇功能，變顏色，回傳所選id
function choose_f(choose_this) {
  //  設定背景色
  $(".choose_f_e").css("background-color", "#8B3A62");
  $(".choose_f_c").css("background-color", "#CD6090");

  choose_this.children(".choose_f_e").css("background-color", "#8B0A50");
  choose_this.children(".choose_f_c").css("background-color", "#CD1076");

  choose_f_id = choose_this.attr("id");
  let id_list = {
    f_analyze_img: "vision/v2.1/analyze",
    f_describe_img: "vision/v2.1/describe",
    f_OCR: "vision/v2.1/read/core/asyncBatchAnalyze",
    f_OCR_credit: "vision/v2.1/read/core/asyncBatchAnalyze",
    f_translator: "",
  };
  uri_choosed = id_list[choose_f_id];

  // 把uri_choosed 傳給後續程式
  parameters_list(choose_f_id);
  choose_image(choose_f_id);
  translate_input_function(choose_f_id);
}

// 顯示選擇範圍的html
function parameters_list(choose_f_id) {
  let analyze_p_list = [
    ["Analyze_Adult", "Adult", "Adult成人", ""],
    ["Analyze_Brands", "Brands", "Brands品牌", ""],
    ["Analyze_Categories", "Categories", "Categories類別", "checked"],
    ["Analyze_Color", "Color", "Color顏色", ""],
    ["Analyze_Description", "Description", "Description描述", "checked"],
    ["Analyze_Faces", "Faces", "Faces臉部", "checked"],
    ["Analyze_ImageType", "ImageType", "ImageType圖片類型", ""],
    ["Analyze_Objects", "Objects", "Objects物件", "checked"],
    ["Analyze_Tags", "Tags", "Tags標籤", "checked"],
  ];
  let analyze_p_detail_list = [
    // ["Analyze_Celebrities", "Celebrities", "Celebrities名人"],
    ["Analyze_Landmarks", "Landmarks", "Landmarks地標(需搭配Categories一起)"],
  ];

  $("#row_parameters").empty();

  if (choose_f_id == "f_analyze_img") {
    choose_f_analyze_img();
  }
  function choose_f_analyze_img() {
    $("#row_parameters").append("<h3>選擇範圍</h3>");
    $("#row_parameters").append(function () {
      let html =
        '<div class="col"><div class="analyze_checkboxs"><h5>要使用的辨識項目(可複選):</h5>';
      for (let i = 0; i < analyze_p_list.length; i++) {
        html +=
          '<label><input class="analyze_checkbox"  type="checkbox" name="' +
          analyze_p_list[i][0] +
          '"value="' +
          analyze_p_list[i][1] +
          '"' +
          analyze_p_list[i][3] +
          "/>" +
          analyze_p_list[i][2] +
          "</label>";
      }
      html +=
        '</div></div><div class="col"><div class="analyze_checkboxs_details"><h5>加選details的辨識功能(可複選):</h5>';
      for (let i = 0; i < analyze_p_detail_list.length; i++) {
        html +=
          '<label><input class="analyze_checkboxs_detail" type="checkbox" name="' +
          analyze_p_detail_list[i][0] +
          '"value="' +
          analyze_p_detail_list[i][1] +
          '"/>' +
          analyze_p_detail_list[i][2] +
          "</label>";
      }
      html += "</div></div>";

      return html;
    });
  }
}

// 取得"選擇範圍"所選的值
function get_analyze_parameter() {
  let visualFeatures = "";
  let details = "";
  let language = "en";

  let analyze_checkbox = $(".analyze_checkbox");
  for (i = 0; i < analyze_checkbox.length; i++) {
    if (analyze_checkbox[i].checked) {
      visualFeatures += analyze_checkbox[i].value + ",";
    }
  }
  visualFeatures = visualFeatures.slice(0, -1);

  let analyze_checkboxs_detail = $(".analyze_checkboxs_detail");
  for (i = 0; i < analyze_checkboxs_detail.length; i++) {
    if (analyze_checkboxs_detail[i].checked) {
      details += analyze_checkboxs_detail[i].value + ",";
    }
  }
  details = details.slice(0, -1);

  params_computer_vision = {
    visualFeatures: visualFeatures,
    details: details,
    language: language,
  };
}

// 圖片區
function choose_image(choose_f_id) {
  let ans_img_url = [
    "https://media.istockphoto.com/id/1368965646/zh/%E7%85%A7%E7%89%87/multi-ethnic-guys-and-girls-taking-selfie-outdoors-with-backlight-happy-life-style-friendship.jpg?s=612x612&w=0&k=20&c=3z5YW7iJyWxXvi8VtFKlFFbmp1WhOESkyZY41nRH7KA=",
    "https://www.petmd.com/sites/default/files/petmd-cat-happy-10.jpg",
    "https://img.ltn.com.tw/Upload/health/page/800/2022/01/01/phprhI3u1.jpg",
    "https://i.marieclaire.com.tw/assets/mc/202111/6197926C28DCD1637323372.jpeg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/%E6%97%A7%E4%B8%8A%E5%B2%A1%E5%B0%8F%E5%AD%A6%E6%A0%A1%E4%B8%80%E5%8F%B7%E6%A3%9F%E6%95%99%E5%AE%A4_02.jpg/1024px-%E6%97%A7%E4%B8%8A%E5%B2%A1%E5%B0%8F%E5%AD%A6%E6%A0%A1%E4%B8%80%E5%8F%B7%E6%A3%9F%E6%95%99%E5%AE%A4_02.jpg",
    "https://s.yimg.com/ny/api/res/1.2/CR7nqQ7kEU26t_wGBfIMlA--/YXBwaWQ9aGlnaGxhbmRlcjt3PTY0MDtoPTQxOA--/https://media.zenfs.com/zh-TW/she_com_523/f105e73fb71ed2cebced8f35170fcc16",
    "https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/123232323-1606819339.jpg?crop=0.428xw:0.856xh;0.0376xw,0.0229xh&resize=1200:*",
    "https://image-cdn.learnin.tw/bnextmedia/image/album/2018-10/img-1540353100-30133.jpg",
    "https://image.cdn-eztravel.com.tw/dDej7kIJwJPCYpz-ie3Qypzb0VqkVQqZMC6QVRVDluA/g:ce/aHR0cHM6Ly92YWNhdGlvbi5jZG4tZXp0cmF2ZWwuY29tLnR3L2ltZy9WRFIvRlJfMTAzNjg3MDk3Mi5qcGc.jpg",
  ];

  let ocr_img_url = [
    "https://www.visa.ca/dam/VCOM/regional/na/canada/pay-with-visa/cards/credit/visa-gold-recto-800x450.jpg",
    "https://www.regions.com/-/media/Images/DotCom/Products/credit-cards/CashRewards-Spotlight.jpg",
    "https://www.visa.com.tw/dam/VCOM/regional/ap/taiwan/global-elements/images/tw-visa-platinum-card-498x280.png",
    "https://techvidvan.com/tutorials/wp-content/uploads/sites/2/2020/05/Need-for-AI.jpg",
    "https://img.kocpc.com.tw/wp-content/uploads/2023/05/1684833759-b6ceea0871c20bbe930aefa8c55979e6.jpg",
    "https://marketplace.canva.com/EAFCt8DsaEA/1/0/566w/canva-yellow-restaurant-menu-UcSExesM14g.jpg",
    "https://www.blr.com/html_email/images/TDA_Images/TDA_101316.jpg",
    "https://thumbs.dreamstime.com/b/hand-magnifying-glass-over-knowledge-words-29854402.jpg",
  ];

  if (choose_f_id == "f_analyze_img") {
    $("#row_choose_img").empty();
    show_img(ans_img_url);
  } else if (choose_f_id == "f_describe_img") {
    $("#row_choose_img").empty();
    show_img(ans_img_url);
  } else if (choose_f_id == "f_OCR_credit") {
    $("#row_choose_img").empty();
    show_img_ocr(ocr_img_url);
  } else if (choose_f_id == "f_OCR") {
    $("#row_choose_img").empty();
    show_img_ocr(ocr_img_url);
  }

  function show_img(img_url) {
    $("#row_choose_img").append(
      "<h3>選擇圖片</h3><p style='color: #ee1289'>有三種圖片來源可以選擇，圖片分析優先權「上傳圖片」＞「提供線上圖片連結」＞「預設圖片」</p>"
    );

    // 圖檔上傳區
    $("#row_choose_img").append(
      '<div class="col" style="border: 2px solid #CD6090; margin:4px; padding:4px"><p>上傳圖片</p><input type="file"name="inputImageFile" id="inputImageFile" data-target="file-uploader" accept="image/*" /></div>'
    );

    // 圖檔連結區
    $("#row_choose_img").append(
      '<div class="col" style="border: 2px solid #CD6090; margin:4px; padding:4px"><p>提供線上圖片連結</p><input type="text" name="inputImage" id="inputImage" value=""  /></div>'
    );

    // 預設圖片區
    $("#row_choose_img").append(function () {
      let html =
        '<div class="col-12" style="border: 2px solid #CD6090 ; margin:4px; padding:4px"><p>預設圖片</p>';
      for (let i = 0; i < img_url.length; i++) {
        html +=
          '<label><input class="img_radio" type="radio" name="choose_img" src=' +
          img_url[i] +
          "><img src=" +
          img_url[i] +
          ' alt="" width="200" /></label>';
      }
      html += "</div>";
      return html;
    });
  }
  function show_img_ocr(img_url) {
    $("#row_choose_img").append(
      "<h3>選擇圖片</h3><p style='color: #ee1289'>有二種圖片來源可以選擇，圖片分析優先權「提供線上圖片連結」＞「預設圖片」</p>"
    );

    // 圖檔連結區
    $("#row_choose_img").append(
      '<div class="col" style="border: 2px solid #CD6090; margin:4px; padding:4px"><p>提供線上圖片連結</p><input type="text" name="inputImage" id="inputImage" value=""  /></div>'
    );

    // 預設圖片區
    $("#row_choose_img").append(function () {
      let html =
        '<div class="col-12" style="border: 2px solid #CD6090 ; margin:4px; padding:4px"><p>預設圖片</p>';
      for (let i = 0; i < img_url.length; i++) {
        html +=
          '<label><input class="img_radio" type="radio" name="choose_img" src=' +
          img_url[i] +
          "><img src=" +
          img_url[i] +
          ' alt="" width="200" /></label>';
      }
      html += "</div>";
      return html;
    });
  }
}

// 翻譯區
function translate_input_function(choose_f_id) {
  let sentence = [
    "愛してます",
    "大丈夫ですか",
    "나는오빠를가장사랑해요",
    "오늘날씨가너무좋아요",
    "Россия любит войну",
    "Dieu aime tellement le monde",
    "Le royaume des cieux est proche",
    "दलाईलामा",
    "What is your name?",
    "El vino tinto español es tan delicioso.",
  ];

  if (choose_f_id == "f_translator") {
    $("#row_choose_img").empty();
    // $("#row_translate_in").empty();
    show_word(sentence);
  }

  function show_word(sentence) {
    $("#row_choose_img").html(
      '<div class="row" id="row_choose_img"><h3>選擇翻譯文字</h3></div>'
    );

    $("#row_choose_img").append(
      "<p style='color: #ee1289'>有二種文字來源可以選擇，翻譯優先權「輸入文字」＞「預設文字」</p>"
    );

    // 輸入文字
    $("#row_choose_img").append(
      '<div class="col" style="border: 2px solid #CD6090; margin:4px; padding:4px"><p>輸入文字：</p>' +
        '<input type="text" name="inputWord" id="inputWord" value=""  /></div>'
    );

    // 預設文字區
    $("#row_choose_img").append(function () {
      let html =
        '<div class="col-12" style="border: 2px solid #CD6090 ; margin:4px; padding:4px"><p>預設文字</p>';
      for (let i = 0; i < sentence.length; i++) {
        html +=
          '<label><input class="word_radio" type="radio" name="inputWord" value="' +
          sentence[i] +
          '"><div class="trans_w">' +
          sentence[i] +
          "</div></label>";
      }
      html += "</div>";
      return html;
    });
  }
}

// analyze Adult成人
function analyze_img_adult(data) {
  $("#ana_Adult_h5").text("圖片的成人 Adult");
  if (data.adult != "") {
    $("#ana_Adult_e").append(function () {
      let html_add = "";
      html_add +=
        "<div class='ana_style'>成人內容:" +
        data.adult.isAdultContent +
        " (" +
        data.adult.adultScore.toFixed(4) * 100 +
        "% 成人分數)</div>";

      html_add +=
        "<div class='ana_style'>淫穢內容:" +
        data.adult.isRacyContent +
        " (" +
        data.adult.racyScore.toFixed(4) * 100 +
        "% 淫穢分數)</div>";

      html_add +=
        "<div class='ana_style'>血腥內容:" +
        data.adult.isGoryContent +
        " (" +
        data.adult.goreScore.toFixed(4) * 100 +
        "% 血腥分數)</div>";

      return html_add;
    });

    $("#ana_Adult_c").append("<h5>無需翻譯</h5>");
  } else {
    $("#ana_Adult_e").append("<h5><無資料></h5>");
    $("#ana_Adult_c").append("<h5>無需翻譯</h5>");
  }
}

// analyze Brands品牌
function analyze_img_brands(data) {
  $("#ana_Brands_h5").text("圖片的品牌 Brands");
  if (data.brands != "") {
    $("#ana_Brands_e").append(function () {
      html_add = "";
      for (let i = 0; i < data.brands.length; i++) {
        html_add +=
          "<div class='ana_style'>" +
          data.brands[i].name +
          " (" +
          data.brands[i].confidence.toFixed(4) * 100 +
          "% 辨識信心水準)</div>";
      }
      return html_add;
    });

    for (let i = 0; i < data.brands.length; i++) {
      let data_f = data.brands[i].name;
      processTranslate(data_f).then(function (data_f) {
        html_add_c = "";

        $("#ana_Brands_c").append(function () {
          html_add_c +=
            "<div class='ana_style'>" +
            data_f +
            " (" +
            data.brands[i].confidence.toFixed(4) * 100 +
            "% 辨識信心水準)</div>";

          return html_add_c;
        });
      });
    }

    // $("#ana_Brands_c").append("<h5>暫無資料</h5>");
  } else {
    $("#ana_Brands_e").append("<h5><無資料></h5>");
    $("#ana_Brands_c").append("<h5><無資料></h5>");
  }
  // 進行品牌辨識
  check_brands(data);
}

// analyze Categories類別
function analyze_img_categories(data) {
  $("#ana_Categories_h5").text("圖片的類別 Category");
  if (data.categories.length != 0) {
    $("#ana_Categories_e").append(function () {
      html_add = "";
      for (let i = 0; i < data.categories.length; i++) {
        html_add +=
          "<div class='ana_style'>" +
          data.categories[i].name +
          " (" +
          data.categories[i].score.toFixed(4) * 100 +
          "% 辨識信心水準)</div>";
      }
      return html_add;
    });

    for (let i = 0; i < data.categories.length; i++) {
      let data_f = data.categories[i].name;
      processTranslate(data_f).then(function (data_f) {
        html_add_c = "";

        $("#ana_Categories_c").append(function () {
          html_add_c +=
            "<div class='ana_style'>" +
            data_f +
            " (" +
            data.categories[i].score.toFixed(4) * 100 +
            "% 辨識信心水準)</div>";

          return html_add_c;
        });
      });
    }
  } else {
    $("#ana_Categories_e").append("<h5><無資料></h5>");
    $("#ana_Categories_c").append("<h5><無資料></h5>");
  }
}

// analyze Color顏色
function analyze_img_color(data) {
  $("#ana_Color_h5").text("圖片的顏色 Color");
  if (data.color.dominantColors.length != 0) {
    $("#ana_Color_e").append(function () {
      html_add = "";
      for (let i = 0; i < data.color.dominantColors.length; i++) {
        html_add +=
          "<div class='ana_style'>" + data.color.dominantColors[i] + "</div>";
      }
      return html_add;
    });

    for (let i = 0; i < data.color.dominantColors.length; i++) {
      let data_f = data.color.dominantColors[i];
      processTranslate(data_f).then(function (data_f) {
        html_add_c = "";

        $("#ana_Color_c").append(function () {
          html_add_c += "<div class='ana_style'>" + data_f + "</div>";

          return html_add_c;
        });
      });
    }

    // $("#ana_Color_c").append("<h5>暫無資料</h5>");
  } else {
    $("#ana_Color_e").append("<h5><無資料></h5>");
    $("#ana_Color_c").append("<h5><無資料></h5>");
  }
}

// analyze Description描述
function analyze_img_description(data) {
  $("#ana_Description_h5").text("圖片的描述 Description");
  if (data.description.captions.length != 0) {
    $("#ana_Description_e").append(function () {
      html_add = "";
      for (let i = 0; i < data.description.captions.length; i++) {
        html_add +=
          "<div class='ana_style'>" +
          data.description.captions[i].text +
          " (" +
          data.description.captions[i].confidence.toFixed(4) * 100 +
          "% 辨識信心水準)</div>";
      }
      return html_add;
    });

    for (let i = 0; i < data.description.captions.length; i++) {
      let data_f = data.description.captions[i].text;
      processTranslate(data_f).then(function (data_f) {
        html_add_c = "";

        $("#ana_Description_c").append(function () {
          html_add_c +=
            "<div class='ana_style'>" +
            data_f +
            " (" +
            data.description.captions[i].confidence.toFixed(4) * 100 +
            "% 辨識信心水準)</div>";

          return html_add_c;
        });
      });
    }

    // $("#ana_Description_c").append("<h5>暫無資料</h5>");
  } else {
    $("#ana_Description_e").append("<h5><無資料></h5>");
    $("#ana_Description_c").append("<h5><無資料></h5>");
  }
}

// analyze Description_Tags描述+標籤
function analyze_img_description_tags(data) {
  if (data.description.tags.length != 0) {
    $("#ana_Description").after(
      '<div class="col"><div class="row" id="ana_Description_Tags"><h5 id="ana_Description_Tags_h5">Description_Tags</h5><div class="cols col-12 col-md-5" id="ana_Description_Tags_e"><h6>原始</h6></div><div class="cols col-12 col-md-5" id="ana_Description_Tags_c"><h6>翻譯</h6></div></div></div>'
    );
    $("#ana_Description_Tags_h5").text("圖片的描述標籤 Description_Tags");

    $("#ana_Description_Tags_e").append(function () {
      html_add = "";
      for (let i = 0; i < data.description.tags.length; i++) {
        html_add +=
          "<div class='ana_style'>" + data.description.tags[i] + "</div>";
      }
      return html_add;
    });

    for (let i = 0; i < data.description.tags.length; i++) {
      let data_f = data.description.tags[i];
      processTranslate(data_f).then(function (data_f) {
        html_add_c = "";

        $("#ana_Description_Tags_c").append(function () {
          html_add_c += "<div class='ana_style'>" + data_f + "</div>";

          return html_add_c;
        });
      });
    }

    // $("#ana_Description_Tags_c").append("<h5>暫無資料</h5>");
  } else {
    $("#ana_Description_Tags_e").append("<h5><無資料></h5>");
    $("#ana_Description_Tags_c").append("<h5><無資料></h5>");
  }
}

// analyze Faces臉部
function analyze_img_face(data) {
  $("#ana_Faces_h5").text("圖片的臉部 Faces");
  if (data.faces != "") {
    $("#ana_Faces_e").append(function () {
      html_add = "";
      html_add += "總人數為： " + data.faces.length + " 人<br>";
      return html_add;
    });

    $("#ana_Faces_c").append("<h5>無需翻譯</h5>");
  } else {
    $("#ana_Faces_e").append("<h5><無資料></h5>");
    $("#ana_Faces_c").append("<h5><無資料></h5>");
  }
  //進行臉部辨識
  check_face(data);
}

// analyze ImageType圖片類型
function analyze_img_image_type(data) {
  $("#ana_ImageType_h5").text("圖片的圖片類型 ImageType");
  if (data.imageType != "") {
    $("#ana_ImageType_e").append(function () {
      let html_add = "";
      html_add +=
        "<div class='ana_style'>clipArtType(剪貼類型):" +
        data.imageType.clipArtType +
        "</div>";

      html_add +=
        "<div class='ana_style'>lineDrawingType(線性類型):" +
        data.imageType.lineDrawingType +
        "</div>";

      return html_add;
    });
    $("#ana_ImageType_c").append("<h5>無需翻譯</h5>");
  } else {
    $("#ana_ImageType_e").append("<h5><無資料></h5>");
    $("#ana_ImageType_c").append("<h5><無資料></h5>");
  }
}

// analyze Objects物件
function analyze_img_objects(data) {
  $("#ana_Objects_h5").text("圖片的物件 Objects");
  if (data.objects.length != 0) {
    $("#ana_Objects_e").append(function () {
      html_add = "";
      html_add += "總物件為： " + data.objects.length + " 件<br>";

      for (let i = 0; i < data.objects.length; i++) {
        html_add +=
          "<div class='ana_style'>" +
          data.objects[i].object +
          " (" +
          data.objects[i].confidence.toFixed(4) * 100 +
          "% 辨識信心水準)</div>";
      }

      return html_add;
    });

    $("#ana_Objects_e").append(function () {
      html_add = "";
      html_add += "總物件為： " + data.objects.length + " 件<br>";
    });

    for (let i = 0; i < data.objects.length; i++) {
      let data_f = data.objects[i].object;
      processTranslate(data_f).then(function (data_f) {
        html_add_c = "";

        $("#ana_Objects_c").append(function () {
          html_add_c +=
            "<div class='ana_style'>" +
            data_f +
            " (" +
            data.objects[i].confidence.toFixed(4) * 100 +
            "% 辨識信心水準)</div>";

          return html_add_c;
        });
      });
    }
  } else {
    $("#ana_Objects_e").append("<h5><無資料></h5>");
    $("#ana_Objects_c").append("<h5><無資料></h5>");
  }
  //進行物件辨識
  check_objects(data);
}

// analyze Tags標籤
function analyze_img_tags(data) {
  $("#ana_Tags_h5").text("圖片的標籤 Tags");
  if (data.tags.length != 0) {
    $("#ana_Tags_e").append(function () {
      html_add = "";
      for (let i = 0; i < data.tags.length; i++) {
        html_add +=
          "<div class='ana_style'>" +
          data.tags[i].name +
          " (" +
          data.tags[i].confidence.toFixed(4) * 100 +
          "% 辨識信心水準)</div>";
      }
      return html_add;
    });

    for (let i = 0; i < data.tags.length; i++) {
      let data_f = data.tags[i].name;
      processTranslate(data_f).then(function (data_f) {
        html_add_c = "";
        $("#ana_Tags_c").append(function () {
          html_add_c +=
            "<div class='ana_style'>" +
            data_f +
            " (" +
            data.tags[i].confidence.toFixed(4) * 100 +
            "% 辨識信心水準)</div>";
          return html_add_c;
        });
      });
    }
  } else {
    $("#ana_Tags_e").append("<h5><無資料></h5>");
    $("#ana_Tags_c").append("<h5><無資料></h5>");
  }
}

// analyze Landmarks地標
function analyze_img_landmarks(data) {
  if (data.categories != "") {
    $("#ana_Categories").after(
      '<div class="col"><div class="row" id="ana_Landmarks"><h5 id="ana_Landmarks_h5">Landmarks</h5><div class="cols col-12 col-md-5" id="ana_Landmarks_e"><h6>原始</h6></div><div class="cols col-12 col-md-5" id="ana_Landmarks_c"><h6>翻譯</h6></div></div></div>'
    );
    $("#ana_Landmarks_h5").text("圖片的地標 Landmarks");
    for (let i = 0; i < data.categories.length; i++) {
      if (data.categories[i].detail.landmarks) {
        $("#ana_Landmarks_e").append(function () {
          html_add = "";

          html_add +=
            "<div class='ana_style'>" +
            data.categories[i].detail.landmarks[0].name +
            " (" +
            data.categories[i].detail.landmarks[0].confidence.toFixed(4) * 100 +
            "% 辨識信心水準)</div>";

          return html_add;
        });

        let data_f = data.categories[i].detail.landmarks[0].name;
        processTranslate(data_f).then(function (data_f) {
          html_add_c = "";
          $("#ana_Landmarks_c").append(function () {
            html_add_c +=
              "<div class='ana_style'>" +
              data_f +
              " (" +
              data.categories[i].detail.landmarks[0].confidence.toFixed(4) *
                100 +
              "% 辨識信心水準)</div>";
            return html_add_c;
          });
        });

        // $("#ana_Landmarks_c").append("<h5>暫無資料</h5>");
      } else {
        $("#ana_Landmarks_e").append("<h5><無資料></h5>");
        $("#ana_Landmarks_c").append("<h5><無資料></h5>");
      }
    }
  }
}

//翻譯模組
function processTranslate(word) {
  let uriBase = "https://api.cognitive.microsofttranslator.com/translate";
  let params = {
    "api-version": "3.0",
    to: "zh-Hant",
  };
  //取得要翻譯的文字
  let sourceTranslateText = word;

  //送出分析
  return new Promise(function (resolve, reject) {
    $.ajax({
      url: uriBase + "?" + $.param(params),
      // Request header
      beforeSend: function (xhrObj) {
        xhrObj.setRequestHeader("Content-Type", "application/json");
        xhrObj.setRequestHeader(
          "Ocp-Apim-Subscription-Key",
          $("#translator_key").val()
        );
        // 如果不是設定全域，就要加上這一行指定你所選擇的區域
        xhrObj.setRequestHeader("Ocp-Apim-Subscription-Region", "eastus");
      },
      type: "POST",
      // Request body
      data: '[{"Text": ' + '"' + sourceTranslateText + '"}]',
    })
      .done(function (data) {
        //顯示JSON內容
        $("#responseTextArea2").val(JSON.stringify(data, null, 2));
        //修改下面這一行將翻譯結果顯示於右方
        let text = data[0].translations[0].text;
        resolve(text);
      })
      .fail(function (jqXHR, textStatus, errorThrown) {
        //丟出錯誤訊息
        var errorString =
          errorThrown === ""
            ? "Error. "
            : errorThrown + " (" + jqXHR.status + "): ";
        errorString +=
          jqXHR.responseText === ""
            ? ""
            : jQuery.parseJSON(jqXHR.responseText).message;
        alert(errorString);
        reject(errorThrown);
      });

    // setTimeout(function () {
    //   console.log(text);
    //   return text;
    // }, 300);
    // console.log(text);
  });
}

// describe tags 描述標籤 Tags
function describe_img_tags(data) {
  $("#describe_tags_h5").text("描述標籤 Tags");
  if (data.description.tags.length != 0) {
    $("#describe_tags_sc").append(function () {
      html_add = "";
      for (let i = 0; i < data.description.tags.length; i++) {
        html_add +=
          "<div class='ana_style'>" + data.description.tags[i] + "</div>";
      }
      return html_add;
    });

    for (let i = 0; i < data.description.tags.length; i++) {
      let data_f = data.description.tags[i];
      processTranslate(data_f).then(function (data_f) {
        html_add_c = "";

        $("#describe_tags_tc").append(function () {
          html_add_c += "<div class='ana_style'>" + data_f + "</div>";

          return html_add_c;
        });
      });
    }
  } else {
    $("#describe_tags_sc").append("<h5><無資料></h5>");
    $("#describe_tags_tc").append("<h5><無資料></h5>");
  }
}

// describe captions 描述標題 Captions
function describe_img_captions(data) {
  $("#describe_captions_h5").text("描述標題 Captions");
  if (data.description.captions.length != 0) {
    $("#describe_captions_sc").append(function () {
      html_add = "";
      for (let i = 0; i < data.description.captions.length; i++) {
        html_add +=
          "<div class='ana_style'>" +
          data.description.captions[i].text +
          " (" +
          data.description.captions[i].confidence.toFixed(4) * 100 +
          "% 辨識信心水準)</div>";
      }
      return html_add;
    });

    for (let i = 0; i < data.description.captions.length; i++) {
      let data_f = data.description.captions[i].text;
      processTranslate(data_f).then(function (data_f) {
        html_add_c = "";

        $("#describe_captions_tc").append(function () {
          html_add_c +=
            "<div class='ana_style'>" +
            data_f +
            " (" +
            data.description.captions[i].confidence.toFixed(4) * 100 +
            "% 辨識信心水準)</div>";

          return html_add_c;
        });
      });
    }
  } else {
    $("#describe_captions_sc").append("<h5><無資料></h5>");
    $("#describe_captions_tc").append("<h5><無資料></h5>");
  }
}

// ORC生成資料
function ORC_text(data) {
  let recognitionArray = data.recognitionResults[0].lines;
  if (choose_f_id == "f_OCR_credit") {
    for (let x = 0; x < recognitionArray.length; x++) {
      if (
        recognitionArray[x].text.length == 19 &&
        recognitionArray[x].text.split(" ").length == 4
      ) {
        $("#ocr_tag_e").html(
          "<h6>原始</h6><div class='ana_style'>" +
            recognitionArray[x].text +
            "</div>"
        );
      }
    }
  } else if (choose_f_id == "f_OCR") {
    for (let x = 0; x < recognitionArray.length; x++) {
      let data_f = recognitionArray[x].text;
      processTranslate(data_f).then(function (data_f) {
        html_add_c = "";

        $("#ocr_tag_c").append(function () {
          html_add_c += "<div class='ana_style'>" + data_f + " </div>";
          return html_add_c;
        });
      });

      console.log(x + "   " + recognitionArray[x].text);
      if (x == 0) {
        $("#ocr_tag_e").html(
          "<h6>原始</h6><div class='ana_style'>" +
            recognitionArray[x].text +
            " </div>" +
            "<br>"
        );
      } else {
        $("#ocr_tag_e").append(
          "<div class='ana_style'>" + recognitionArray[x].text + " </div>"
        );
      }
    }
  }
}

// 翻譯生成資料
function translate_main_data(data) {
  // 分析結果
  $("#row_show_analyze_data").empty();
  $("#row_show_analyze_data").html(function () {
    let html_add = '<h3>分析結果</h3> <div class="col">';

    html_add +=
      '<div class="row" id="trans_data"><h5 id="trans_data_h5">翻譯結果</h5>' +
      '<div class="cols col-12 col-md-5" id="trans_data_content"><h6>內容</h6></div>' +
      "</div></div>";
    return html_add;
  });
  $("#trans_data_content").text(data[0].translations[0].text);
}
