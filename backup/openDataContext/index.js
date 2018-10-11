/**
 * 微信开放数据域
 * 使用 Canvas2DAPI 在 SharedCanvas 渲染一个排行榜，
 * 并在主域中渲染此 SharedCanvas
 */

let hasCreateScene = false;


let currentCondition = "collectScore";


/**
 * 资源加载组，将所需资源地址以及引用名进行注册
 * 之后可通过assets.引用名方式进行获取
 */
var assets = {
  rank1: "openDataContext/assets/rank-1.png",
  rank2: "openDataContext/assets/rank-2.png",
  rank3: "openDataContext/assets/rank-3.png",
  panel: "openDataContext/assets/panel.png",
  icon: "openDataContext/assets/icon.png",
  box: "openDataContext/assets/box.png",
  avatarBox: "openDataContext/assets/avatar-box.png",
  nameBg: "openDataContext/assets/name-bg.png",
  button: "openDataContext/assets/button.png",
  title: "openDataContext/assets/rankingtitle.png"
};
/**
 * canvas 大小
 * 这里暂时写死
 * 需要从主域传入
 */
let canvasWidth;
let canvasHeight;

/**
 * 加载资源函数
 * 理论上只需要加载一次，且在点击时才开始加载
 * 最好与canvasWidht和canvasHeight数据的传入之后进行
 */

//获取canvas渲染上下文
var context = sharedCanvas.getContext("2d");
context.globalCompositeOperation = "source-over";


/**
 * 所有头像数据
 * 包括姓名，头像图片，得分
 * 排位序号i会根据parge*perPageNum+i+1进行计算
 */
let totalGroup = {
  collectScore: [],
  points: [],
  speed: []
};

function loadAvatar(images) {
  var preloaded = 0;
  var count = 0;
  return new Promise((resolve, reject) => {
    for (var index in images) {
      var url = images[index].url;
      if (assets[url]) {
        continue;
      }
      count++;
      var img = wx.createImage();
      img.onload = function () {
        preloaded++;
        if (preloaded == count) {
          resolve();
        }
      }
      img.src = url;
      assets[url] = img;
    }
    if (!count) {
      resolve();
    }
  });
}

/**
 * 创建排行榜
 */
function drawRankPanel() {
  //绘制背景
  //context.drawImage(assets.panel, offsetX_rankToBorder, offsetY_rankToBorder, RankWidth, RankHeight);
  //获取当前要渲染的数据组
  let start = perPageMaxNum * page;
  // currentGroup = totalGroup.slice(start, start + perPageMaxNum);
  currentGroup = totalGroup[currentCondition];
  RankHeight = currentGroup.length * preOffsetY;
  if(!currentGroup) {
    return;
  }
  //创建头像Bar
  drawRankByGroup(currentGroup);
  //创建按钮
  //drawButton()
}
/**
 * 根据屏幕大小初始化所有绘制数据
 */
function init() {
  //排行榜绘制数据初始化
  console.log(stageWidth, stageHeight);
  RankWidth = Math.floor(stageWidth * 0.74);
  // RankHeight = 960;
  barWidth = RankWidth;
  barHeight = Math.floor(RankWidth / 4);
  offsetX_rankToBorder = 0;
  offsetY_rankToBorder = 0;
  preOffsetY = barHeight + barHeight * 0.1;

  startX = offsetX_rankToBorder + offsetX_rankToBorder;
  startY = offsetY_rankToBorder;
  avatarSize = Math.floor(barHeight * 0.8);
  fontSize = Math.floor(barHeight * 0.3);
  intervalX = barWidth / 20;
  textOffsetY = Math.floor((barHeight + fontSize) / 2);
  textMaxSize = 250;
  indexWidth = context.measureText("99999").width;

  //按钮绘制数据初始化
  buttonWidth = barWidth / 3;
  buttonHeight = barHeight / 2;
  buttonOffset = RankWidth / 3;
  lastButtonX = offsetX_rankToBorder + buttonOffset - buttonWidth;
  nextButtonX = offsetX_rankToBorder + 2 * buttonOffset;
  nextButtonY = lastButtonY = offsetY_rankToBorder + RankHeight - 50 - buttonHeight;
  let data = wx.getSystemInfoSync();
  canvasWidth = data.windowWidth;
  canvasHeight = data.windowHeight;
}

/**
 * 创建两个点击按钮
 */
function drawButton() {
  context.drawImage(assets.button, nextButtonX, nextButtonY, buttonWidth, buttonHeight);
  context.drawImage(assets.button, lastButtonX, lastButtonY, buttonWidth, buttonHeight);
}


/**
 * 根据当前绘制组绘制排行榜
 */
function drawRankByGroup(currentGroup) {
  loadAvatar(currentGroup).then(() => {
    for (let i = 0; i < currentGroup.length; i++) {
      let data = currentGroup[i];
      drawByData(data, i);
    }
  });
}

/**
 * 根据绘制信息以及当前i绘制元素
 */
function drawByData(data, i) {
  console.log(barHeight, avatarSize);
  let x = startX;
  let itemY = startY + i * preOffsetY;
  let imgDiff =  avatarSize * 0.05;
  //绘制底框
  context.drawImage(assets.box, startX, itemY, barWidth, barHeight);
  x += avatarSize / 2;
  //设置字体
  context.font = "bold " + fontSize + "px Arial";
  context.fillStyle = "#a04310";
  //绘制序号
  if (data.key > 3) {
    context.fillText(data.key + "", x, itemY + textOffsetY, textMaxSize);
    x += indexWidth + intervalX;
  }
  else {
    context.drawImage(assets[`rank${data.key}`], startX + barHeight * 0.1, itemY + (barHeight - avatarSize + imgDiff) / 2, avatarSize - imgDiff, avatarSize - imgDiff);
    x += indexWidth + intervalX;
  }
  //绘制头像avatar-box
  context.drawImage(assets.avatarBox, x - imgDiff / 2, itemY + (barHeight - avatarSize - imgDiff) / 2, avatarSize + imgDiff, avatarSize + imgDiff);
  context.drawImage(assets[data.url], x, itemY + (barHeight - avatarSize) / 2, avatarSize, avatarSize);
  x += avatarSize + 10 + intervalX;
  //绘制名称
  context.drawImage(assets.nameBg, x - 20, itemY + (barHeight - avatarSize) / 2, avatarSize * 2, fontSize + 10);
  context.fillText(data.name + "", x, itemY + (barHeight - avatarSize) / 2 + fontSize, textMaxSize);
  // x += textMaxSize + intervalX;
  //绘制分数
  context.font = Math.floor(fontSize * 0.75) + "px Arial";
  context.fillStyle = "#46200b";
  context.fillText(data.score + "", x, itemY + textOffsetY + 10, textMaxSize);
}

/**
 * 点击处理
 */
function onTouchEnd(event) {
  let x = event.clientX * sharedCanvas.width / canvasWidth;
  let y = event.clientY * sharedCanvas.height / canvasHeight;
  if (x > lastButtonX && x < lastButtonX + buttonWidth
    && y > lastButtonY && y < lastButtonY + buttonHeight) {
    //在last按钮的范围内
    if (page > 0) {
      buttonClick(0);

    }
  }
  if (x > nextButtonX && x < nextButtonX + buttonWidth
    && y > nextButtonY && y < nextButtonY + buttonHeight) {
    //在next按钮的范围内
    if ((page + 1) * perPageMaxNum < totalGroup.length) {
      buttonClick(1);
    }
  }

}
/**
 * 根据传入的buttonKey 执行点击处理
 * 0 为上一页按钮
 * 1 为下一页按钮
 */
function buttonClick(buttonKey) {
  let old_buttonY;
  if (buttonKey == 0) {
    //上一页按钮
    old_buttonY = lastButtonY;
    lastButtonY += 10;
    page--;
    renderDirty = true;
    console.log('上一页');
    setTimeout(() => {
      lastButtonY = old_buttonY;
      //重新渲染必须标脏
      renderDirty = true;
    }, 100);
  } else if (buttonKey == 1) {
    //下一页按钮
    old_buttonY = nextButtonY;
    nextButtonY += 10;
    page++;
    renderDirty = true;
    console.log('下一页');
    setTimeout(() => {
      nextButtonY = old_buttonY;
      //重新渲染必须标脏
      renderDirty = true;
    }, 100);
  }

}

/////////////////////////////////////////////////////////////////// 相关缓存数据

/**********************数据相关***************************/

/**
 * 渲染标脏量
 * 会在被标脏（true）后重新渲染
 */
let renderDirty = true;

/**
 * 当前绘制组
 */
let currentGroup = [];
/**
 * 每页最多显示个数
 * 建议大于等于4个
 */
let perPageMaxNum = 5;
/**
 * 当前页数,默认0为第一页
 */
let page = 0;
/***********************绘制相关*************************/
/**
 * 舞台大小
 */
let stageWidth;
let stageHeight;
/**
 * 排行榜大小
 */
let RankWidth;
let RankHeight;

/**
 * 每个头像条目的大小
 */
let barWidth;
let barHeight;
/**
 * 条目与排行榜边界的水平距离
 */
let offsetX_barToRank
/**
 * 绘制排行榜起始点X
 */
let startX;
/**
 * 绘制排行榜起始点Y
 */
let startY;
/**
 * 每行Y轴间隔offsetY
 */
let preOffsetY;
/**
 * 按钮大小
 */
let buttonWidth;
let buttonHeight;
/**
 * 上一页按钮X坐标
 */
let lastButtonX;
/**
 * 下一页按钮x坐标
 */
let nextButtonX;
/**
 * 上一页按钮y坐标
 */
let lastButtonY;
/**
 * 下一页按钮y坐标
 */
let nextButtonY;
/**
 * 两个按钮的间距
 */
let buttonOffset;

/**
 * 字体大小
 */
let fontSize = 45;
/**
 * 文本文字Y轴偏移量
 * 可以使文本相对于图片大小居中
 */
let textOffsetY;
/**
 * 头像大小
 */
let avatarSize;
/**
 * 名字文本最大宽度，名称会根据
 */
let textMaxSize;
/**
 * 绘制元素之间的间隔量
 */
let intervalX;
/**
 * 排行榜与舞台边界的水平距离
 */
let offsetX_rankToBorder;
/**
 * 排行榜与舞台边界的竖直距离
 */
let offsetY_rankToBorder;
/**
 * 绘制排名的最大宽度
 */
let indexWidth;

//////////////////////////////////////////////////////////
/**
 * 监听点击
 */
wx.onTouchEnd((event) => {
  var l = event.changedTouches.length;
  for (var i = 0; i < l; i++) {
    onTouchEnd(event.changedTouches[i]);
  }
});


/**
 * 资源加载
 */
function preloadAssets() {
  var preloaded = 0;
  var count = 0;
  for (var asset in assets) {
    count++;
    var img = wx.createImage();
    img.onload = function () {
      preloaded++;
      if (preloaded == count) {
        setTimeout(function () {
          createScene();
        }, 500);
      }
    }
    img.src = assets[asset];
    assets[asset] = img;
  }
  return true;
}
/**
 * 绘制屏幕
 * 这个函数会在加载完所有资源之后被调用
 */
function createScene() {
  if (sharedCanvas.width && sharedCanvas.height) {
    console.log('初始化完成')
    stageWidth = sharedCanvas.width;
    stageHeight = sharedCanvas.height;
  } else {
    console.log(`sharedCanvas.width:${sharedCanvas.width}    sharedCanvas.height：${sharedCanvas.height}`)
  }
  init();
  requestAnimationFrame(loop);
}
/**
 * 循环函数
 * 每帧判断一下是否需要渲染
 * 如果被标脏，则重新渲染
 */
function loop() {
  if (renderDirty) {
    console.log(`stageWidth :${stageWidth}   stageHeight:${stageHeight}`)
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, sharedCanvas.width, sharedCanvas.height);
    drawRankPanel();
    renderDirty = false;
  }
  requestAnimationFrame(loop);
}

function formatDataByCondition(data, condition) {
  /**
 * [{
 *    "openid": "oqJNG40IJ7aBflO-X2HzxdEtAmLE",
 *    "nickname": "斗彩鸡缸杯",
 *    "avatarUrl": "https://wx.qlogo.cn/mmopen/vi_32/Q0",
 *    "KVDataList": [
 *      {"key":"collectScore","value":"101"}
 *    ]
 * }]
 */
  return data.map((item, index) => {
    const kvData = item.KVDataList && item.KVDataList.length && item.KVDataList.find(i => i.key == condition);
    let score = +(kvData && kvData.value) || 0;
    return {
      name: item.nickname,
      url: item.avatarUrl,
      score: score
    };
  }).filter(item => {
    return condition != "speed" || item.score;
  }).sort((lhs, rhs) => {
    if (lhs.score < rhs.score) {
      return condition == "speed" ? -1 : 1;
    }
    else if (lhs.score > rhs.score) {
      return condition == "speed" ? 1 : -1;
    }
    else {
      return 0;
    }
  }).map((item, index) => {
    return { ...item, key: index + 1 };
  });
}

wx.onMessage((data) => {
  if (data.command == 'open') {
    const keyList = ["collectScore", "points", "speed"];
    wx.getFriendCloudStorage({
      keyList: keyList,
      success: res => {
        console.log(res);
        keyList.forEach(key => {
          totalGroup[key] = formatDataByCondition(res.data, key);
        });

        currentCondition = "collectScore";
        
        renderDirty = true;
      },
      fail: err => {
        console.log(err);
      },
      complete: () => {
      }
    });
    //显示开放域
    if (!hasCreateScene) {
      //创建并初始化
      hasCreateScene = preloadAssets();
    }
    else {
      createScene();
    }
  }
  else if(data.command == 'switch') {
    currentCondition = data.condition;
    renderDirty = true;
  }
  else if (data.command == 'close') {
    console.log("close");
  }
  else if (data.command == 'upload') {
    let dataList = [];
    dataList.push({ key: data.condition, value: data.value.toString() });
    wx.setUserCloudStorage({
      KVDataList: dataList,
      success: res => {
        console.log(res);
      },
      fail: err => {
        console.log(err);
      },
      complete: () => {
      }
    });
  }
});