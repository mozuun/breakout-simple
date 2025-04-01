// Canvas要素の取得
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const StartBtn = document.getElementById("start_btn");
const AgainBtn = document.getElementById("again_btn");
const GameInner = document.getElementById("game_inner");
const StartScreen = document.getElementById("start_screen");
const GameOverScreen = document.getElementById("game_over_screen");
const TotalScore = document.getElementById("score");
const BreakPoint = 516;

//　Canvasサイズ
let CanvasSize;
let ScreenWidth;
let ScreenHeight;

// ボール
let BallRadius;
let BallColor = "white";

// パドル
let PaddleWidth;
let PaddleHeight;
let PaddleSpeed = 7;
let PaddleColor = "white";
let PaddleOffsetBottom = 20;

//　ブロック変数の定義
let blockRowCount; // ブロックの行数
let blockColumnCount; // ブロックの列数
let blockWidth; // ブロックの幅
let blockHeight; // ブロックの高さ
let blockOffsetTop = 50; //ブロックの上からのオフセット

function resizeCanvas() {
  if (window.innerWidth >= BreakPoint) {
    CanvasSize = 500;
  } else {
    const canvas_w = window.innerWidth;
    CanvasSize = canvas_w - 16;
  }
  // canvasサイズ
  canvas.width = CanvasSize;
  canvas.height = CanvasSize;
  // スクリーンサイズ(描画サイズ)
  ScreenWidth = CanvasSize;
  ScreenHeight = CanvasSize;

  if (window.innerWidth >= BreakPoint) {
    //　ブロック
    blockColumnCount = 8;
    blockHeight = ScreenHeight / 20;
  } else {
    //　ブロック
    blockColumnCount = 6;
    blockHeight = ScreenHeight / 16;
  }
  blockRowCount = 1;
  BallRadius = 10;
  PaddleWidth = 80;
  PaddleHeight = 16;
  blockWidth = ScreenWidth / blockColumnCount;
}

// 初回実行
resizeCanvas();

// アニメーションIDを定義
let animationId;

//　keyの真偽
let RightPressed = false;
let LeftPressed = false;

//　ボールの座標
let BallX = ScreenWidth / 2;
let BallY = ScreenHeight - 50;

// ボールの移動量
let dx;
let dy;

// パドルの座標
let PaddleX = (ScreenWidth - PaddleWidth) / 2;
let PaddleY = ScreenHeight - PaddleHeight - PaddleOffsetBottom;

let breakPower = 1;
let status_up = true;
let status_dawn = true;

let score; // スコア
let life; // ライフ
let level; // レベル

// 画像
const images = [
  new Image(),
  new Image(),
  new Image(),
  new Image(),
  new Image(),
  new Image(),
  new Image(),
  new Image(),
  new Image(),
  new Image(),
  new Image(),
];

// 画像のソースを設定
images[0].src = "/image/赤ブロック.png";
images[1].src = "/image/青ブロック.png";
images[2].src = "/image/緑ブロック.png";
images[3].src = "/image/紫ブロック.png";
images[4].src = "/image/黄色ブロック.png";
images[5].src = "/image/赤ブロック.png";
images[6].src = "/image/青ブロック.png";
images[7].src = "/image/緑ブロック.png";
images[8].src = "/image/紫ブロック.png";
images[9].src = "/image/黄色ブロック.png";

// 音
function playSound(fileName) {
  const sound = new Audio(fileName); // 毎回新しいインスタンスを作成
  sound.play(); // 即時再生
}

//　ブロックの定義
let blocks = [];
for (let y = 0; y < blockRowCount; y++) {
  blocks[y] = [];
  for (let x = 0; x < blockColumnCount; x++) {
    blocks[y][x] = {
      x: x * blockWidth,
      y: y * blockHeight,
      isVisible: true,
      durability: 1,
      maxDurability: 1,
    };
  }
}

// 初期化処理
function init() {
  score = 0; // スコア
  life = 3; // ライフ
  level = 1;
  dx = 3;
  dy = -4;
  initBlocks();
  draw();
}

// ブロックの再生成関数
function initBlocks() {
  blockRowCount = Math.floor(Math.random() * 2) + 2;
  //　レベル5以上の場合
  if (level > 5) {
    blockRowCount = Math.floor(Math.random() * 6) + 4;
  }
  blocks = [];
  for (let y = 0; y < blockRowCount; y++) {
    blocks[y] = [];
    for (let x = 0; x < blockColumnCount; x++) {
      let durability = 1;
      //　レベル5以上の場合
      if (level > 5) {
        durability = Math.floor(Math.random() * 3) + 1;
      }
      // 5%の確率
      if (Math.random() < 0.05) {
        durability = 0; // 1/2で0
      }
      blocks[y][x] = {
        x: x * blockWidth,
        y: y * blockHeight,
        isVisible: durability > 0, // ブロックが表示されてるかをtrue or falseで返す
        durability: durability, // 現在の耐久度
        maxDurability: durability, // 最大耐久度
      };
    }
  }
}

// 次のレベルへ行く関数
function nextLevel() {
  level++; // レベルを上げる
  playSound("clear.mp3");

  // ボールの速度を少し上げる
  dy *= -1.2;

  initBlocks(); // 新しい配置のブロックを生成
}

// ボールを描く関数
function drawBall() {
  ctx.beginPath();
  ctx.fillStyle = BallColor;
  ctx.arc(BallX, BallY, BallRadius, 0, Math.PI * 2);
  ctx.fill();
}

// パドルを描く関数
function drawPaddle() {
  ctx.beginPath();
  ctx.fillStyle = PaddleColor;
  ctx.fillRect(PaddleX, PaddleY, PaddleWidth, PaddleHeight);
}

// ブロックを描く関数
function drawBlocks() {
  for (let y = 0; y < blockRowCount; y++) {
    for (let x = 0; x < blockColumnCount; x++) {
      if (blocks[y][x].isVisible === true) {
        // 座標を定義
        let printX = blocks[y][x].x;
        let printY = blocks[y][x].y + blockOffsetTop;

        // 各ブロックの耐久度を取得
        const durability = blocks[y][x].durability;
        const maxDurability = blocks[y][x].maxDurability;

        // 耐久度に基づいて色のフィルターを設定
        const filter = getColorFilter(durability, maxDurability);

        // フィルターを適用
        ctx.filter = filter;

        // 列インデックスに基づいて色を選択
        let color = images[y % images.length];

        ctx.drawImage(color, printX, printY, blockWidth, blockHeight);
        // 線のスタイル
        ctx.strokeStyle = "black";
        // 枠線を描画
        ctx.strokeRect(printX, printY, blockWidth, blockHeight);

        // フィルターをリセット
        ctx.filter = "none";
      }
    }
  }
}

// ブロックの衝突判定
function collisionDetection() {
  let hasCollidedX = false;
  let hasCollidedY = false;
  for (let y = 0; y < blockRowCount; y++) {
    for (let x = 0; x < blockColumnCount; x++) {
      if (blocks[y][x].isVisible === true) {
        const blockX = blocks[y][x].x;
        const blockY = blocks[y][x].y + blockOffsetTop;
        const maxDurability = blocks[y][x].maxDurability;
        if (
          blockX < BallX + BallRadius &&
          blockX + blockWidth > BallX - BallRadius &&
          blockY < BallY + BallRadius &&
          blockY + blockHeight > BallY - BallRadius
        ) {
          if (blockY < BallY && blockY + blockHeight > BallY) {
            hasCollidedX = true;
          } else {
            hasCollidedY = true;
          }
          // 耐久度を減らす
          blocks[y][x].durability -= breakPower;

          // 耐久度が0以下になったらブロックを消す
          if (blocks[y][x].durability <= 0) {
            blocks[y][x].isVisible = false; // ブロックを消す
            onBlockDestroyed(blockX, blockY);
            score++; // スコア加算
            if (status_up == false) {
              playSound("ball-bounce.mp3");
            }
          }
        }
      }
    }
  }

  if (hasCollidedX && status_up) {
    dx = -dx;
    playSound("ball-bounce.mp3");
  }

  // ループ終了後にボールの速度を反転
  if (hasCollidedY && status_up) {
    dy = -dy;
    dx += (Math.random() - 0.5) * 0.5;
    playSound("ball-bounce.mp3");
  }

  // 全てのブロックが壊れていたら次のレベルへ
  if (checkAllBlocksDestroyed()) {
    score += 100;
    nextLevel();
  }
}

// ブロックを全て壊したか確認する関数
function checkAllBlocksDestroyed() {
  for (let y = 0; y < blockRowCount; y++) {
    for (let x = 0; x < blockColumnCount; x++) {
      if (blocks[y][x].isVisible) {
        return false; // まだ壊れていないブロックがある
      }
    }
  }
  return true; // 全て壊れた
}

// 耐久度に基づいて色のフィルターを返す関数
function getColorFilter(durability, maxDurability) {
  const brightness = Math.max(50, (durability / maxDurability) * 100);
  return `brightness(${brightness}%)`;
}

// スコアの関数
function drawScore() {
  // スコア自体
  ctx.beginPath(); // パスの開始
  const ScoreText = String(score).padStart(5, "0"); // 10桁ゼロ埋め
  ctx.font = "20px Arial";
  ctx.fillStyle = "white";
  const ScoreTextWidth = ctx.measureText(ScoreText).width; // 文字の幅
  const ScoreCenterX = (ScreenWidth - ScoreTextWidth) / 2; //　中央に配置
  ctx.fillText(ScoreText, ScoreCenterX, 35);
  ctx.closePath(); // パスの終了
}

// ライフの関数
function drawLife() {
  // ライフ自体
  ctx.beginPath(); // パスの開始
  ctx.font = "20px Arial";
  ctx.fillStyle = "red";
  const LifeText = "HP " + life + "/3";
  const LifeTextWidth = ctx.measureText(LifeText).width;
  const LifeCenterX = LifeTextWidth / 2; //　中央に配置
  ctx.fillText(LifeText, LifeCenterX, 35);
  ctx.closePath(); // パスの終了
}

// レベルの関数
function drawLevel() {
  // スコア自体
  ctx.beginPath(); // パスの開始
  const LevelText = "Lv " + level;
  const LevelTextWidth = ctx.measureText(LevelText).width; // 文字の幅
  const LevelCenterX = ScreenWidth - LevelTextWidth - 25; //　中央に配置
  ctx.font = "20px Arial";
  ctx.fillStyle = "green";
  ctx.fillText(LevelText, LevelCenterX, 35);
  ctx.closePath(); // パスの終了
}

//　描画処理
function draw() {
  ctx.clearRect(0, 0, ScreenWidth, ScreenHeight);
  drawBall();
  drawPaddle();
  drawBlocks();
  collisionDetection();
  drawScore();
  drawLife();
  drawLevel();
  updateItems(); // アイテムの更新（落下）
  checkItemCatch(); // パドルとの当たり判定
  drawItems(); // アイテムの描画
  BallX += dx;
  BallY += dy;

  //　パドルの移動
  if (RightPressed) {
    PaddleX = Math.min(PaddleX + PaddleSpeed, ScreenWidth - PaddleWidth);
  } else if (LeftPressed) {
    PaddleX = Math.max(PaddleX - PaddleSpeed, 0);
  }

  //　水平方向の反転
  if (BallX + dx > ScreenWidth - BallRadius || BallX + dx < BallRadius) {
    dx = -dx;
    playSound("ball-bounce.mp3");
  }

  // 垂直方向の反転
  if (BallY + dy < BallRadius) {
    dy = -dy;
    playSound("ball-bounce.mp3");
  } else if (
    BallY + dy >
      ScreenHeight - BallRadius - PaddleHeight - PaddleOffsetBottom &&
    PaddleX < BallX + dx + BallRadius &&
    PaddleX + PaddleWidth > BallX + dx - BallRadius
  ) {
    dy = -dy;
    dx += (Math.random() - 0.5) * 0.5;
    BallY = ScreenHeight - BallRadius - PaddleHeight - PaddleOffsetBottom; //　すり抜け禁止
    playSound("ball-bounce.mp3");
  } else if (BallY + dy > ScreenHeight) {
    playSound("failure.mp3");
    life--;
    BallX = ScreenWidth / 2;
    BallY = ScreenHeight - 50;
    dy = -4;
    dx = 4;
    PaddleX = (ScreenWidth - PaddleWidth) / 2;
    if (life === 0) {
      GameOverScreen.classList.toggle("hidden");
      TotalScore.innerText = "スコア: " + score;
      cancelAnimationFrame(animationId);
      return;
    }
  }
  animationId = requestAnimationFrame(draw);
}

//　keyが押された時
document.addEventListener("keydown", keyDownHandler);
//　keyが離れた時
document.addEventListener("keyup", keyUpHandler);
//　マウス操作
canvas.addEventListener("mousemove", mouseMoveHandler);
// タッチ操作
canvas.addEventListener("touchmove", touchMoveHandler);

// ウィンドウリサイズ時にCanvasサイズを適切
window.addEventListener("resize", resizeCanvas);

//　スタートボタンが押された時
StartBtn.addEventListener("click", () => {
  StartScreen.classList.toggle("hidden");
  init();
});

//　もう一度が押された時
AgainBtn.addEventListener("click", () => {
  GameOverScreen.classList.toggle("hidden");
  init();
});

//　keyが押された時の関数
function keyDownHandler(e) {
  if (e.key === "ArrowRight") {
    RightPressed = true;
  } else if (e.key === "ArrowLeft") {
    LeftPressed = true;
  }
}

// keyが離れた時の関数
function keyUpHandler(e) {
  if (e.key === "ArrowRight") {
    RightPressed = false;
  } else if (e.key === "ArrowLeft") {
    LeftPressed = false;
  }
}

// アイテムの種類
const ITEM_TYPES = ["status_up", "life", "status_dawn", "none"];

// アイテムを保持する配列
let items = [];

// ブロックが崩れたときにアイテムを生成
function onBlockDestroyed(blockX, blockY) {
  let randomType = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];

  // 8割の確率でnone
  if (Math.random() < 0.8) {
    randomType = ITEM_TYPES[ITEM_TYPES.length - 1];
  }

  if (randomType !== "none") {
    items.push({
      x: blockX,
      y: blockY,
      type: randomType,
      width: 20,
      height: 20,
      dy: 2, // 落下速度
    });
  }
}

// アイテムを描画する関数
function drawItems() {
  for (let i = 0; i < items.length; i++) {
    let item = items[i];

    ctx.fillStyle =
      item.type === "status_up"
        ? "yellow"
        : item.type === "life"
        ? "red"
        : item.type === "status_dawn"
        ? "blue"
        : "gray";

    ctx.fillRect(item.x, item.y, item.width, item.height);
  }
}

// アイテムを落下させる処理
function updateItems() {
  for (let i = 0; i < items.length; i++) {
    items[i].y += items[i].dy;

    // 画面下まで落ちたら削除
    if (items[i].y > canvas.height) {
      items.splice(i, 1);
      i--;
    }
  }
}

// アイテムがパドルに当たったか確認
function checkItemCatch() {
  for (let i = 0; i < items.length; i++) {
    let item = items[i];

    if (
      item.y + item.height >= PaddleY && // アイテムがパドルに到達
      item.x >= PaddleX &&
      item.x <= PaddleX + PaddleWidth
    ) {
      applyItemEffect(item.type);
      items.splice(i, 1); // アイテムを削除
      i--;
    }
  }
}

// アイテムの効果を適用
function applyItemEffect(type) {
  score += 50;
  if (type === "status_up") {
    StatusUp();
    playSound("status-up.mp3");
  } else if (type === "life") {
    playSound("heal.mp3");
    if (life >= "3") {
      score += 100;
    } else {
      life++;
    }
  } else if (type === "status_dawn") {
    StatusDawn();
    playSound("status-dawn.mp3");
  }
}

function StatusUp() {
  if (status_up == false) {
    return;
  }

  status_up = false;
  BallColor = "yellow";
  breakPower = 3;
  BallRadius += 5;

  // 10秒後無効果
  setTimeout(() => {
    status_up = true;
    BallColor = "white";
    breakPower = 1;
    BallRadius -= 5;
  }, 10000);
}

function StatusDawn() {
  if (status_dawn == false) {
    return;
  }
  status_dawn = false;
  PaddleColor = "blue";
  PaddleWidth -= 30;
  PaddleSpeed -= 3;

  // 10秒後無効果
  setTimeout(() => {
    status_dawn = true;
    PaddleColor = "white";
    PaddleWidth += 30;
    PaddleSpeed += 3;
  }, 2000);
}

// マウス操作
function mouseMoveHandler(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;

  let relativeX = (e.clientX - rect.left) * scaleX;
  setPaddlePosition(relativeX);
}

// タッチした移動の間の処理
function touchMoveHandler(e) {
  e.preventDefault(); // スクロール防止

  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;

  let relativeX = (e.touches[0].clientX - rect.left) * scaleX;
  setPaddlePosition(relativeX);
}

// タッチとマウスの共通
function setPaddlePosition(relativeX) {
  const minX = PaddleWidth / 2;
  const maxX = canvas.width - PaddleWidth / 2;

  if (relativeX < minX) {
    relativeX = minX;
  } else if (relativeX > maxX) {
    relativeX = maxX;
  }

  PaddleX = relativeX - PaddleWidth / 2;
}
