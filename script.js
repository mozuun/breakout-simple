// Canvas要素の取得
const canvas = document.getElementById("canvas");
/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext("2d");

// BgCanvas要素の取得
const bgcanvas = document.getElementById("bgcanvas");
const bgctx = bgcanvas.getContext("2d");

const StartBtn = document.getElementById("title");

//　Canvasサイズ
const CanvasWidth = 350;
const CanvasHeight = 300;

canvas.width = CanvasWidth;
canvas.height = CanvasHeight;

// BgCanvasサイズ
bgcanvas.width = 700;
bgcanvas.height = 300;

// スクリーンサイズ(描画サイズ)
const ScreenWidth = CanvasWidth;
const ScreenHeight = CanvasHeight;

// アニメーションIDを定義
let animationId;

//　keyの真偽
let RightPressed = false;
let LeftPressed = false;

// ボールのサイズ
const BallRadius = 6;

//　ボールの座標
let BallX = ScreenWidth / 2;
let BallY = ScreenHeight - 50;

// ボールの移動量
let dx = 3;
let dy = -3;

// パドルのサイズ
const PaddleWidth = 60;
const PaddleHeight = 10;

// パドルの座標
let PaddleX = (ScreenWidth - PaddleWidth) / 2;
let PaddleY = ScreenHeight - PaddleHeight;

//　ブロック変数の定義
let blockRowCount = 2; // ブロックの行数（3行）
let blockColumnCount = 10; // ブロックの列数（5列）
const blockWidth = 35; // ブロックの幅（75ピクセル）
const blockHeight = 20; // ブロックの高さ（20ピクセル)

// スコア
let score = 0;

// ライフ
let life = 3;

// レベル
let level = 1;

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
images[0].src = "./image/赤ブロック.png";
images[1].src = "./image/青ブロック.png";
images[2].src = "./image/緑ブロック.png";
images[3].src = "./image/紫ブロック.png";
images[4].src = "./image/黄色ブロック.png";
images[5].src = "./image/赤ブロック.png";
images[6].src = "./image/青ブロック.png";
images[7].src = "./image/緑ブロック.png";
images[8].src = "./image/紫ブロック.png";
images[9].src = "./image/黄色ブロック.png";
images[10].src = "./image/黒ブロック.png";

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

// 各ステージの配列(最大列数10)
const stages = [
  // ステージ1の配置
  [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1]],
  [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ],
  [
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ],
  [
    [10, 2, 2, 2, 2, 2, 3, 3, 3, 3],
    [1, 1, 10, 1, 1, 1, 1, 1, 1, 1],
  ],
  [
    [10, 2, 2, 2, 2, 2, 3, 3, 3, 3],
    [1, 1, 10, 1, 1, 1, 1, 10, 1, 1],
    [1, 1, 0, 1, 1, 10, 1, 1, 1, 1],
  ],
  [
    [10, 2, 2, 2, 2, 2, 3, 3, 3, 3],
    [5, 1, 10, 1, 1, 5, 1, 10, 1, 1],
    [1, 1, 0, 1, 1, 10, 1, 1, 1, 1],
    [5, 1, 0, 1, 1, 10, 1, 1, 1, 1],
  ],
  [
    [10, 2, 2, 2, 2, 6, 3, 3, 3, 3],
    [1, 5, 10, 5, 1, 1, 1, 10, 1, 1],
    [1, 1, 0, 1, 1, 10, 1, 1, 1, 1],
    [2, 4, 0, 1, 1, 10, 1, 1, 1, 1],
  ],
  [
    [10, 10, 2, 2, 10, 5, 3, 3, 3, 3],
    [1, 1, 10, 1, 1, 1, 1, 10, 1, 1],
    [1, 5, 0, 1, 1, 10, 1, 1, 1, 1],
    [1, 10, 10, 1, 1, 1, 1, 10, 1, 1],
  ],
  [
    [10, 2, 2, 2, 2, 2, 3, 3, 3, 3],
    [1, 2, 10, 1, 1, 1, 1, 10, 1, 1],
    [1, 1, 10, 1, 1, 10, 10, 10, 1, 1],
    [10, 2, 2, 2, 2, 2, 3, 3, 3, 3],
    [1, 2, 10, 1, 1, 1, 1, 10, 1, 1],
    [1, 1, 10, 1, 1, 10, 10, 10, 1, 1],
  ],
  [
    [2, 10, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 10, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 10, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 10, 2, 2, 2, 2, 2, 10, 2, 2],
    [10, 10, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  ],
];

// 初期化処理
function init() {
  initBlocks();
  draw();
}

// ブロックの再生成関数
function initBlocks() {
  // ブロックの配置をstageDataから持ってくる
  const stageData = stages[level - 1];
  blockRowCount = stageData.length;
  blockColumnCount = stageData[0].length;

  blocks = [];
  for (let y = 0; y < blockRowCount; y++) {
    blocks[y] = [];
    for (let x = 0; x < blockColumnCount; x++) {
      const durability = stageData[y][x];
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
  playSound("クリア.mp3");

  // 全てクリアした時
  if (level > stages.length) {
    alert("全てのステージをクリアしました！");
    cancelAnimationFrame(animationId);
    return; // ゲーム終了
  }

  // ボールの速度を少し上げる
  dy *= 1.2;

  BallX = ScreenWidth / 2; // ボールの位置をリセット
  BallY = ScreenHeight - 50;
  PaddleX = (ScreenWidth - PaddleWidth) / 2; // パドルの位置をリセット
  initBlocks(); // 新しい配置のブロックを生成
}

// ボールを描く関数
function drawBall() {
  ctx.beginPath(); //　新しくパスを開始
  ctx.fillStyle = "#fff";
  ctx.arc(BallX, BallY, BallRadius, 0, Math.PI * 2);
  ctx.fill();
}

// パドルを描く関数
function drawPaddle() {
  ctx.beginPath(); //　新しくパスを開始
  ctx.fillStyle = "#fff";
  ctx.fillRect(PaddleX, PaddleY, PaddleWidth, PaddleHeight);
}

// ブロックを描く関数
function drawBlocks() {
  for (let y = 0; y < blockRowCount; y++) {
    for (let x = 0; x < blockColumnCount; x++) {
      if (blocks[y][x].isVisible === true) {
        // 座標を定義
        let printX = blocks[y][x].x;
        let printY = blocks[y][x].y;

        // 各ブロックの耐久度を取得
        const durability = blocks[y][x].durability;
        const maxDurability = blocks[y][x].maxDurability;

        // 耐久度に基づいて色のフィルターを設定
        const filter = getColorFilter(durability, maxDurability);

        // フィルターを適用
        ctx.filter = filter;

        // 列インデックスに基づいて色を選択
        let color = images[y % images.length];
        if (maxDurability == 10) {
          color = images[10];
        }

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
        const blockY = blocks[y][x].y;
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
          if (maxDurability !== 10) {
            // 耐久度を減らす
            blocks[y][x].durability -= 1;

            // 耐久度が0以下になったらブロックを消す
            if (blocks[y][x].durability <= 0) {
              blocks[y][x].isVisible = false; // ブロックを消す
              score++; // スコア加算
            }
          }
        }
      }
    }
  }

  if (hasCollidedX) {
    dx = -dx;
    playSound("ボール反転.mp3");
  }

  // ループ終了後にボールの速度を反転
  if (hasCollidedY) {
    dy = -dy;
    dx += (Math.random() - 0.5) * 0.5;
    playSound("ボール反転.mp3");
  }

  // 全てのブロックが壊れていたら次のレベルへ
  if (checkAllBlocksDestroyed()) {
    nextLevel();
  }
}

// ブロックを全て壊したか確認する関数
function checkAllBlocksDestroyed() {
  for (let y = 0; y < blockRowCount; y++) {
    for (let x = 0; x < blockColumnCount; x++) {
      if (blocks[y][x].isVisible && blocks[y][x].durability !== 10) {
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
  bgctx.beginPath(); // パスの開始
  bgctx.strokeStyle = "#fff";
  bgctx.strokeRect(40, 60, 95, 70);
  bgctx.closePath(); // パスの終了

  // スコアの文字
  bgctx.beginPath(); // パスの開始
  const text = "Score";
  const textWidth = bgctx.measureText(text).width; // 文字の幅
  const centerX = (175 - textWidth) / 2; //　中央に配置
  bgctx.font = "20px Arial";
  bgctx.fillStyle = "#fff";
  bgctx.fillText(text, centerX, 40);
  bgctx.closePath(); // パスの終了

  // スコア自体
  bgctx.beginPath(); // パスの開始
  const ScoreText = score;
  const ScoreTextWidth = bgctx.measureText(ScoreText).width; // 文字の幅
  const ScoreCenterX = (175 - ScoreTextWidth) / 2; //　中央に配置
  bgctx.font = "22px Arial";
  bgctx.fillStyle = "#fff";
  bgctx.fillText(ScoreText, ScoreCenterX, 105);
  bgctx.closePath(); // パスの終了
}

// ライフの関数
function drawLife() {
  // スコア自体
  bgctx.beginPath(); // パスの開始
  bgctx.strokeStyle = "#fff";
  bgctx.strokeRect(40, 205, 95, 70);
  bgctx.closePath(); // パスの終了

  // ライフの文字
  bgctx.beginPath(); // パスの開始
  const text = "Life";
  const textWidth = bgctx.measureText(text).width; // 文字の幅
  const centerX = (175 - textWidth) / 2; //　中央に配置
  bgctx.font = "20px Arial";
  bgctx.fillStyle = "#fff";
  bgctx.fillText(text, centerX, 190);
  bgctx.closePath(); // パスの終了

  // ライフ自体
  bgctx.beginPath(); // パスの開始
  const LifeText = life;
  const LifeTextWidth = bgctx.measureText(LifeText).width; // 文字の幅
  const LifeCenterX = (175 - LifeTextWidth) / 2; //　中央に配置
  bgctx.font = "22px Arial";
  bgctx.fillStyle = "#fa4747";
  bgctx.fillText(LifeText, LifeCenterX, 250);
  bgctx.closePath(); // パスの終了
}

// レベルの関数
function drawLevel() {
  // レベル自体
  bgctx.beginPath(); // パスの開始
  bgctx.strokeStyle = "#fff";
  bgctx.strokeRect(565, 60, 95, 70);
  bgctx.closePath(); // パスの終了

  // スコアの文字
  bgctx.beginPath(); // パスの開始
  const text = "Level";
  const textWidth = bgctx.measureText(text).width; // 文字の幅
  const centerX = 560 + textWidth / 2; //　中央に配置
  bgctx.font = "20px Arial";
  bgctx.fillStyle = "#fff";
  bgctx.fillText(text, centerX, 40);
  bgctx.closePath(); // パスの終了

  // スコア自体
  bgctx.beginPath(); // パスの開始
  const ScoreText = level;
  const ScoreTextWidth = bgctx.measureText(ScoreText).width; // 文字の幅
  const ScoreCenterX = 596 + ScoreTextWidth; //　中央に配置
  bgctx.font = "22px Arial";
  bgctx.fillStyle = "#fff";
  bgctx.fillText(ScoreText, ScoreCenterX, 105);
  bgctx.closePath(); // パスの終了
}

//　描画処理
function draw() {
  ctx.clearRect(0, 0, ScreenWidth, ScreenHeight);
  bgctx.clearRect(0, 0, bgcanvas.width, bgcanvas.height);
  drawBall();
  drawPaddle();
  drawBlocks();
  collisionDetection();
  drawScore();
  drawLife();
  drawLevel();
  BallX += dx;
  BallY += dy;

  //　パドルの移動
  if (RightPressed) {
    PaddleX = Math.min(PaddleX + 7, ScreenWidth - PaddleWidth);
  } else if (LeftPressed) {
    PaddleX = Math.max(PaddleX - 7, 0);
  }

  //　水平方向の反転
  if (BallX + dx > ScreenWidth - BallRadius || BallX + dx < BallRadius) {
    dx = -dx;
    playSound("ボール反転.mp3");
  }

  // 垂直方向の反転
  if (BallY + dy < BallRadius) {
    dy = -dy;
    playSound("ボール反転.mp3");
  } else if (
    BallY + dy > ScreenHeight - BallRadius - PaddleHeight &&
    PaddleX < BallX + dx + BallRadius &&
    PaddleX + PaddleWidth > BallX + dx - BallRadius
  ) {
    dy = -dy;
    dx += (Math.random() - 0.5) * 0.5;
    BallY = ScreenHeight - BallRadius - PaddleHeight; //　すり抜け禁止
    playSound("ボール反転.mp3");
  } else if (BallY + dy > ScreenHeight) {
    playSound("失敗.mp3");
    life--;
    BallX = ScreenWidth / 2;
    BallY = ScreenHeight - 50;
    dy = -3;
    dx = 3;
    PaddleX = (ScreenWidth - PaddleWidth) / 2;
    if (life === 0) {
      const text = "Game Over";
      ctx.font = "35px Arial";
      const textWidth = ctx.measureText(text).width;
      const centerX = (CanvasWidth - textWidth) / 2; //　中央に配置
      ctx.fillStyle = "#fff";
      ctx.fillText(text, centerX, 150);
      const text2 = "Enterでもう一度";
      ctx.font = "20px Arial";
      const textWidth2 = ctx.measureText(text2).width; // 文字の幅
      const centerX2 = (CanvasWidth - textWidth2) / 2; //　中央に配置
      ctx.fillText(text2, centerX2, 190);
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

//　スタートボタンが押された時
StartBtn.addEventListener("click", () => {
  StartBtn.classList.toggle("hidden");
  init();
});

//　keyが押された時の関数
function keyDownHandler(e) {
  if (e.key === "ArrowRight") {
    RightPressed = true;
  } else if (e.key === "ArrowLeft") {
    LeftPressed = true;
  } else if (e.key === "Enter") {
    location.reload();
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
