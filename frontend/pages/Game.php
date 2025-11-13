<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ゲーム画面</title>
  <!-- Font Awesome CDN -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">

  <style>
    body {
      margin: 0;
      padding: 0;
      height: 100vh;
      background: url("../asetts/img/bg/Bg1.jpg") no-repeat center center fixed;
      background-size: cover;
      font-family: "Segoe UI", sans-serif;
      overflow: hidden;
    }

    /* 右上ボタンコンテナ */
    .menu-container {
      position: absolute;
      top: 15px;
      right: 15px;
      display: flex;
      gap: 16px;
      background-color: rgba(0, 0, 0, 0.35);
      padding: 12px 18px;
      border-radius: 12px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(4px);
    }

    /* 各ボタン */
    .menu-button {
      color: #fff;
      font-size: 28px;
      cursor: pointer;
      position: relative;
      transition: transform 0.2s ease, color 0.3s ease;
    }

    .menu-button:hover {
      color: #ffb6c1;
      transform: scale(1.2);
    }

    /* --- ツールチップ --- */
    .menu-button::after {
      content: attr(data-tooltip);
      position: absolute;
      bottom: -40px;
      left: 50%;
      transform: translateX(-50%) scale(0.9);
      background: rgba(255, 192, 203, 0.9);
      color: #fff;
      font-size: 13px;
      padding: 6px 10px;
      border-radius: 8px;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s ease, transform 0.25s ease;
      box-shadow: 0 2px 8px rgba(0,0,0,0.25);
    }

    .menu-button:hover::after {
      opacity: 1;
      transform: translateX(-50%) scale(1);
    }

    /* ツールチップに矢印を付ける */
    .menu-button::before {
      content: "";
      position: absolute;
      bottom: -10px;
      left: 50%;
      transform: translateX(-50%);
      border: 6px solid transparent;
      border-top-color: rgba(255, 192, 203, 0.9);
      opacity: 0;
      transition: opacity 0.25s ease;
    }

    .menu-button:hover::before {
      opacity: 1;
    }
  </style>
</head>
<body>

  <div class="menu-container">
    <i class="fas fa-book menu-button" data-tooltip="バックログを見る"></i>
    <i class="fas fa-save menu-button" data-tooltip="セーブする"></i>
    <i class="fas fa-cog menu-button" data-tooltip="設定を開く"></i>
    <i class="fas fa-home menu-button" data-tooltip="ホームに戻る"></i>
  </div>

</body>
</html>
