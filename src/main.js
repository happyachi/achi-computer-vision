$(document).ready(function () {
  // 檢查是否有KEY
  storage_key_get();

  // 儲存KEY
  $("#storage_save").click(function () {
    storage_key_save();
  });

  // 刪除KEY
  $("#storage_remove").click(function () {
    storage_key_remove();
  });

  // 選擇功能，變顏色，回傳所選id
  $(".choose_f").click(function () {
    choose_f($(this));
  });

  // 執行圖片辨識--線上連結
  $("#thisButton").click(function () {
    ChooseFunction();
  });

  // TEST
  $("#test_btn").click(function () {
    // console.log(params_computer_vision);
    test_tt();
  });
});

function ChooseFunction() {
  if (choose_f_id == "f_analyze_img") {
    AnalyzeImage();
  } else if (choose_f_id == "f_describe_img") {
    AnalyzeImage();
  } else if (choose_f_id == "f_OCR_credit") {
    OCRImage();
  } else if (choose_f_id == "f_OCR") {
    OCRImage();
  } else if (choose_f_id == "f_translator") {
    Translator();
  }
}
// 圖片分析主程式
function AnalyzeImage() {
  //確認區域與所選擇的相同或使用客製化端點網址
  let uriBase = endpoint_computer_vision + uri_choosed;

  //取得 params
  if (choose_f_id == "f_analyze_img") {
    get_analyze_parameter();
  } else if (choose_f_id == "f_describe_img") {
    params_computer_vision = {
      maxCandidates: 10,
      language: "zh",
    };
  }

  // 如果有上傳檔案，優先執行，再來是自定義連結，最後是預設圖片
  if ($("#inputImageFile")[0].files[0]) {
    //---這區為上傳檔案區---//
    let imageObject = $("#inputImageFile")[0].files[0];
    //顯示分析的圖片
    var sourceImageUrl = URL.createObjectURL(imageObject);
    document.querySelector("#sourceImage").src = sourceImageUrl;
    //送出分析
    $.ajax({
      url: uriBase + "?" + $.param(params_computer_vision),
      // Request header
      beforeSend: function (xhrObj) {
        xhrObj.setRequestHeader("Content-Type", "application/octet-stream");
        xhrObj.setRequestHeader(
          "Ocp-Apim-Subscription-Key",
          $("#vision_key").val()
        );
      },
      type: "POST",
      processData: false,
      contentType: false,
      // Request body
      data: imageObject,
    })
      .done(function (data) {
        if (choose_f_id == "f_analyze_img") {
          fun_done_analyze_img(data);
        } else if (choose_f_id == "f_describe_img") {
          fun_done_describe_img(data);
        }
      })
      .fail(function (jqXHR, textStatus, errorThrown) {
        //丟出錯誤訊息
        fun_fial(jqXHR, textStatus, errorThrown);
      });
  } else {
    //---這區為線上連結區---//
    let sourceImageUrl = "";
    if (document.getElementById("inputImage").value != "") {
      sourceImageUrl += document.getElementById("inputImage").value;
    } else {
      // 預設圖片
      for (let i = 0; i < $(".img_radio").length; i++) {
        if ($(".img_radio")[i].checked) {
          sourceImageUrl += $(".img_radio")[i].src;
        }
      }
    }
    //顯示分析的圖片
    document.querySelector("#sourceImage").src = sourceImageUrl;

    //送出分析
    $.ajax({
      url: uriBase + "?" + $.param(params_computer_vision),
      // Request header
      beforeSend: function (xhrObj) {
        xhrObj.setRequestHeader("Content-Type", "application/json");
        xhrObj.setRequestHeader(
          "Ocp-Apim-Subscription-Key",
          $("#vision_key").val()
        );
      },
      type: "POST",
      // Request body
      data: '{"url": ' + '"' + sourceImageUrl + '"}',
    })

      .done(function (data) {
        if (choose_f_id == "f_analyze_img") {
          fun_done_analyze_img(data);
        } else if (choose_f_id == "f_describe_img") {
          reset_target(); //清除target框框
          reset_target_word(); //清除辨識文字
          fun_done_describe_img(data);
        }
      })
      .fail(function (jqXHR, textStatus, errorThrown) {
        //丟出錯誤訊息
        fun_fial(jqXHR, textStatus, errorThrown);
      });
  }
}
// OCR分析主程式
function OCRImage() {
  // **********************************************
  // *** Update or verify the following values. ***
  // **********************************************
  $("#RecognitionCardNumber").text("XXXX XXXX XXXX XXXX");

  let endpoint = "https://eastus.api.cognitive.microsoft.com/";
  let subscriptionKey = $("#vision_key").val();

  if (!subscriptionKey) {
    throw new Error(
      "Set your environment variables for your subscription key and endpoint."
    );
  }

  var uriBase = endpoint + "vision/v2.1/read/core/asyncBatchAnalyze";

  //---這區為線上連結區---//
  let sourceImageUrl = "";
  if (document.getElementById("inputImage").value != "") {
    sourceImageUrl += document.getElementById("inputImage").value;
  } else {
    for (let i = 0; i < $(".img_radio").length; i++) {
      if ($(".img_radio")[i].checked) {
        sourceImageUrl += $(".img_radio")[i].src;
      }
    }
  }
  // Display the image.
  document.querySelector("#sourceImage").src = sourceImageUrl;
  // 先清空，顯示等5秒
  reset_target(); //清除target框框
  reset_target_word(); //清除辨識文字
  $("#row_show_analyze_data").empty();
  $("#row_show_analyze_data").html(function () {
    let html_add =
      '<h3>分析結果</h3> <h5 id="ocr_tag_h5">～辨識中～請稍等5秒～</h5>';
    return html_add;
  });
  // This operation requires two REST API calls. One to submit the image
  // for processing, the other to retrieve the text found in the image.
  //
  // Make the first REST API call to submit the image for processing.
  $.ajax({
    url: uriBase,

    // Request headers.
    beforeSend: function (jqXHR) {
      jqXHR.setRequestHeader("Content-Type", "application/json");
      jqXHR.setRequestHeader("Ocp-Apim-Subscription-Key", subscriptionKey);
    },

    type: "POST",

    // Request body.
    data: '{"url": ' + '"' + sourceImageUrl + '"}',
  })

    .done(function (data, textStatus, jqXHR) {
      // Show progress.
      $("#responseTextArea").val(
        "Text submitted. " +
          "Waiting 5 seconds to retrieve the recognized text."
      );

      // Note: The response may not be immediately available. Text
      // recognition is an asynchronous operation that can take a variable
      // amount of time depending on the length of the text you want to
      // recognize. You may need to wait or retry the GET operation.
      //
      // Wait ten seconds before making the second REST API call.
      setTimeout(function () {
        // "Operation-Location" in the response contains the URI
        // to retrieve the recognized text.
        var operationLocation = jqXHR.getResponseHeader("Operation-Location");

        // Make the second REST API call and get the response.
        $.ajax({
          url: operationLocation,

          // Request headers.
          beforeSend: function (jqXHR) {
            jqXHR.setRequestHeader("Content-Type", "application/json");
            jqXHR.setRequestHeader(
              "Ocp-Apim-Subscription-Key",
              subscriptionKey
            );
          },

          type: "GET",
        })

          .done(function (data) {
            // Show formatted JSON on webpage.
            $("#responseTextArea").val(JSON.stringify(data, null, 2));

            // 生成OCR主結構
            OCR_img_main();

            // 生成OCR標記
            check_OCR_word(data);

            // 生成資料
            ORC_text(data);
          })

          .fail(function (jqXHR, textStatus, errorThrown) {
            // Display error message.
            fun_fial(jqXHR, textStatus, errorThrown);
          });
      }, 5000);
    })

    .fail(function (jqXHR, textStatus, errorThrown) {
      // Put the JSON description into the text area.
      $("#responseTextArea").val(JSON.stringify(jqXHR, null, 2));

      // Display error message.
      fun_fial(jqXHR, textStatus, errorThrown);
    });
}

//翻譯主程式
function Translator() {
  reset_target(); //清除target框框
  reset_target_word(); //清除辨識文字
  $("#row_show_analyze_data").empty();
  $("#row_analyze_img").empty();

  let uriBase = "https://api.cognitive.microsofttranslator.com/translate";
  let params = {
    "api-version": "3.0",
    to: "zh-Hant",
  };

  //---這區為自行提供文字---//
  let sourceTranslateText = "";
  if (document.getElementById("inputWord").value != "") {
    sourceTranslateText += document.getElementById("inputWord").value;
  } else {
    // 預設文字
    for (let i = 0; i < $(".word_radio").length; i++) {
      if ($(".word_radio")[i].checked) {
        sourceTranslateText += $(".word_radio")[i].value;
      }
    }
  }

  //送出分析
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
      //生成翻譯結果
      translate_main_data(data);
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
    });
}
//清除target框框
function reset_target() {
  let pic = document.querySelector(".pic"); // 取得父層div
  let target = document.querySelectorAll(".target"); // 先選到全部的 target框
  if (target.length != 0) {
    for (let i = 0; i < target.length; i++) {
      pic.removeChild(target[i]); // 移除target框
    }
  }
}

//清除辨識文字
function reset_target_word() {
  let check_tag = document.querySelector(".check_tag"); // 取得父層div
  let target_word = document.querySelectorAll(".target_word"); // 先選到全部的 target框
  if (target_word.length != 0) {
    for (let i = 0; i < target_word.length; i++) {
      check_tag.removeChild(target_word[i]); // 移除target框
    }
  }
}

//進行臉部辨識
function check_face(data) {
  if (data.faces.length != 0) {
    let arr = [];
    for (i = 0; i < data.faces.length; i++) {
      let left = data.faces[i].faceRectangle.left;
      let top = data.faces[i].faceRectangle.top;
      let width = data.faces[i].faceRectangle.width;
      let height = data.faces[i].faceRectangle.height;
      let arr1 = [left, top, width, height];
      arr.push(arr1);
    }

    const check_tag = document.querySelector(".check_tag");
    const h1 = document.createElement("h1");
    h1.classList = "target_word target_face";
    h1.style.color = "#28FF28";
    h1.innerText = "人臉辨識";
    check_tag.appendChild(h1);

    const pic = document.querySelector(".pic");
    for (let i = 0; i < arr.length; i++) {
      const div_face = document.createElement("div");
      div_face.classList = "target target_face";
      div_face.innerText = "face";
      const div_face_style = div_face.style;
      div_face_style.color = "#28FF28";
      div_face_style.fontSize = "20px";
      div_face_style.fontWeight = "600";
      div_face_style.border = "3px solid #28FF28";
      div_face_style.position = "absolute";
      div_face_style.top = arr[i][1] + "px";
      div_face_style.left = arr[i][0] + "px";
      div_face_style.width = arr[i][2] + "px";
      div_face_style.height = arr[i][3] + "px";
      pic.appendChild(div_face);
    }
  }
}

//進行物件辨識
function check_objects(data) {
  if (data.objects.length != 0) {
    let arr = [];
    for (i = 0; i < data.objects.length; i++) {
      let left = data.objects[i].rectangle.x;
      let top = data.objects[i].rectangle.y;
      let width = data.objects[i].rectangle.w;
      let height = data.objects[i].rectangle.h;
      let obj = data.objects[i].object;
      let arr1 = [left, top, width, height, obj];
      arr.push(arr1);
    }

    const check_tag = document.querySelector(".check_tag");
    const h1 = document.createElement("h1");
    h1.classList = "target_word target_object";
    h1.style.color = "#FF5809";
    h1.innerText = "物件辨識";
    check_tag.appendChild(h1);

    const pic = document.querySelector(".pic");
    for (let i = 0; i < arr.length; i++) {
      const div_object = document.createElement("div");
      div_object.classList = "target target_object";
      div_object.innerText = arr[i][4];
      const div_object_style = div_object.style;
      div_object_style.color = "#FF5809";
      div_object_style.fontSize = "20px";
      div_object_style.fontWeight = "600";
      div_object_style.border = "3px solid #FF5809";
      div_object_style.position = "absolute";
      div_object_style.top = arr[i][1] + "px";
      div_object_style.left = arr[i][0] + "px";
      div_object_style.width = arr[i][2] + "px";
      div_object_style.height = arr[i][3] + "px";
      pic.appendChild(div_object);
    }
  }
}

//進行品牌辨識
function check_brands(data) {
  if (data.brands != "") {
    let arr = [];
    for (i = 0; i < data.brands.length; i++) {
      let left = data.brands[i].rectangle.x;
      let top = data.brands[i].rectangle.y;
      let width = data.brands[i].rectangle.w;
      let height = data.brands[i].rectangle.h;
      let name = data.brands[i].name;
      let arr1 = [left, top, width, height, name];
      arr.push(arr1);
    }

    const check_tag = document.querySelector(".check_tag");
    const h1 = document.createElement("h1");
    h1.classList = "target_word target_brands";
    h1.style.color = "#20f3ef";
    h1.innerText = "品牌辨識";
    check_tag.appendChild(h1);

    const pic = document.querySelector(".pic");
    for (let i = 0; i < arr.length; i++) {
      const div_object = document.createElement("div");
      div_object.classList = "target target_brands";
      div_object.innerText = arr[i][4];
      const div_object_style = div_object.style;
      div_object_style.color = "#20f3ef";
      div_object_style.fontSize = "20px";
      div_object_style.fontWeight = "600";
      div_object_style.border = "3px solid #20f3ef";
      div_object_style.position = "absolute";
      div_object_style.top = arr[i][1] + "px";
      div_object_style.left = arr[i][0] + "px";
      div_object_style.width = arr[i][2] + "px";
      div_object_style.height = arr[i][3] + "px";
      pic.appendChild(div_object);
    }
  }
}

//生成analyze結果
function analyze_img_main(data) {
  let params_list = params_computer_vision.visualFeatures.split(",");
  let detail = params_computer_vision.details;

  // 分析結果
  $("#row_show_analyze_data").empty();
  $("#row_show_analyze_data").html(function () {
    let html_add = '<h3>分析結果</h3> <div class="col">';

    for (let i = 0; i < params_list.length; i++) {
      html_add +=
        '<div class="row" id="ana_' +
        params_list[i] +
        '"><h5 id="ana_' +
        params_list[i] +
        '_h5">' +
        params_list[i] +
        '</h5><div class="cols col-12 col-md-5" id="ana_' +
        params_list[i] +
        '_e"><h6>原始</h6></div><div class="cols col-12 col-md-5" id="ana_' +
        params_list[i] +
        '_c"><h6>翻譯</h6></div></div>';
    }
    html_add += "</div>";
    return html_add;
  });

  // 回傳圖片辨識項目
  // $("#check_tag").empty();
  // $("#check_tag").html(function () {
  //   let ana_html_add =
  //     '<h3>回傳圖片辨識項目</h3> <div class="col"><div class="check_tag" id="check_tag">    <div></div></div><div class="pic" id="check_img"><img id="sourceImage" /></div></div></div>';
  //   return ana_html_add;
  // });

  if (params_list.includes("Adult")) {
    analyze_img_adult(data);
  }
  if (params_list.includes("Brands")) {
    analyze_img_brands(data);
  }
  if (params_list.includes("Categories")) {
    analyze_img_categories(data);
  }
  if (params_list.includes("Color")) {
    analyze_img_color(data);
  }
  if (params_list.includes("Description")) {
    analyze_img_description(data);
    analyze_img_description_tags(data);
  }
  if (params_list.includes("Faces")) {
    analyze_img_face(data);
  }
  if (params_list.includes("ImageType")) {
    analyze_img_image_type(data);
  }
  if (params_list.includes("Objects")) {
    analyze_img_objects(data);
  }
  if (params_list.includes("Tags")) {
    analyze_img_tags(data);
  }
  if (detail.includes("Landmarks")) {
    analyze_img_landmarks(data);
  }
}

//進行OCR文字標記
function check_OCR_word(data) {
  let recognitionArray = data.recognitionResults[0].lines;
  if (recognitionArray.length != 0) {
    let arr = [];
    for (i = 0; i < recognitionArray.length; i++) {
      let left = recognitionArray[i].boundingBox[0];
      let top = recognitionArray[i].boundingBox[1];
      let width =
        recognitionArray[i].boundingBox[4] - recognitionArray[i].boundingBox[0];
      let height =
        recognitionArray[i].boundingBox[5] - recognitionArray[i].boundingBox[1];
      let obj = recognitionArray[i].text;
      let arr1 = [left, top, width, height, obj];
      arr.push(arr1);
    }

    const check_tag = document.querySelector(".check_tag");
    const h1 = document.createElement("h1");
    h1.classList = "target_word target_OCR";
    h1.style.color = "#28FF28";
    h1.innerText = "OCR辨識";
    check_tag.appendChild(h1);

    const pic = document.querySelector(".pic");
    for (let i = 0; i < arr.length; i++) {
      const div_OCR = document.createElement("div");
      div_OCR.classList = "target target_OCR";
      div_OCR.innerText = arr[i][4];
      const div_OCR_style = div_OCR.style;
      div_OCR_style.color = "#28FF28";
      div_OCR_style.fontSize = "20px";
      div_OCR_style.fontWeight = "600";
      div_OCR_style.border = "3px solid #28FF28";
      div_OCR_style.position = "absolute";
      div_OCR_style.top = arr[i][1] + "px";
      div_OCR_style.left = arr[i][0] + "px";
      div_OCR_style.width = arr[i][2] + "px";
      div_OCR_style.height = arr[i][3] + "px";
      pic.appendChild(div_OCR);
    }
  }
}

//生成OCR結果
function OCR_img_main() {
  // 分析結果
  $("#row_show_analyze_data").empty();
  $("#row_show_analyze_data").html(function () {
    let html_add = '<h3>分析結果</h3> <div class="col">';

    html_add +=
      '<div class="row" id="ocr_tag"><h5 id="ocr_tag_h5">OCR辨識</h5>' +
      '<div class="cols col-12 col-md-5" id="ocr_tag_e"><h6>原始</h6></div>' +
      '<div class="cols col-12 col-md-5" id="ocr_tag_c"><h6>翻譯</h6></div>' +
      "</div></div>";

    return html_add;
  });
}
