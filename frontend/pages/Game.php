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
      gap: 12px;
      background-color: rgba(0, 0, 0, 0.3);
      padding: 10px 15px;
      border-radius: 10px;
    }

    /* 各ボタン */
    .menu-button {
      color: #fff;
      font-size: 22px;
      cursor: pointer;
      transition: transform 0.2s, color 0.2s;
    }

    .menu-button:hover {
      color: #ffcc00;
      transform: scale(1.15);
    }
  </style>
</head>
<body>

  <div class="menu-container">
    <i class="fas fa-book menu-button" title="バックログ表示"></i>
    <i class="fas fa-save menu-button" title="セーブ"></i>
    <i class="fas fa-cog menu-button" title="設定"></i>
    <i class="fas fa-home menu-button" title="ホームへ戻る"></i>
  </div>

</body>
</html>
