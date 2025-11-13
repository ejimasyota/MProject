<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>ゲーム画面</title>

  <style>
    /* --- ゲーム全体コンテナ --- */
    .game-container {
      margin: 0;
      padding: 0;
      height: 100vh;
      width: 100vw;
      background: url("../asetts/img/bg/Bg1.jpg") no-repeat center center fixed;
      background-size: cover;
      font-family: "Segoe UI", sans-serif;
      overflow: hidden;
      position: relative;
    }

    /* --- メニューコンテナ --- */
    .menu-container {
      position: absolute;
      top: 15px;
      right: 15px;
      display: flex;
      gap: 16px;
      background-color: rgba(255, 255, 255, 0.35);
      padding: 12px 18px;
      border-radius: 12px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      backdrop-filter: blur(4px);
    }

    /* --- ボタン --- */
    .menu-button {
      color: rgba(0, 0, 0, 0.75); /* 通常時：黒（半透明） */
      width: 48px;
      height: 48px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      transition: transform 0.2s ease, color 0.25s ease;
      border-radius: 8px;
      user-select: none;
    }

    .menu-button svg {
      width: 28px;
      height: 28px;
      fill: currentColor;
      transition: transform 0.2s ease;
    }

    /* --- ホバー時（淡いピンクに） --- */
    .menu-button:hover {
      color: #ffb6c1;
      transform: scale(1.1);
    }

    /* --- ツールチップ --- */
    .menu-button::after {
      content: attr(data-tooltip);
      position: absolute;
      bottom: -42px;
      left: 50%;
      transform: translateX(-50%) scale(0.95);
      background: rgba(255,192,203,0.95);
      color: #fff;
      font-size: 13px;
      padding: 6px 10px;
      border-radius: 8px;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.22s ease, transform 0.22s ease;
      box-shadow: 0 2px 8px rgba(0,0,0,0.25);
    }

    .menu-button:hover::after {
      opacity: 1;
      transform: translateX(-50%) scale(1);
    }

    .menu-button::before {
      content: "";
      position: absolute;
      bottom: -12px;
      left: 50%;
      transform: translateX(-50%);
      border: 6px solid transparent;
      border-top-color: rgba(255,192,203,0.95);
      opacity: 0;
      transition: opacity 0.22s ease;
    }

    .menu-button:hover::before {
      opacity: 1;
    }

    /* --- キーボードフォーカス対応 --- */
    .menu-button:focus {
      outline: 2px solid rgba(255,182,193,0.5);
      outline-offset: 2px;
    }
  </style>
</head>
<body>
  <!-- 背景・全体コンテナ -->
  <div class="game-container">
    <!-- メニュー -->
    <div class="menu-container">
      <!-- Backlog -->
      <button class="menu-button" data-tooltip="バックログを見る" aria-label="バックログ">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 2h9a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 2v14h9V4H6zM20 7h1v11a1 1 0 0 1-1 1h-1v-2h1V7z"></path>
        </svg>
      </button>

      <!-- Save -->
      <button class="menu-button" data-tooltip="セーブする" aria-label="セーブ">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M17 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14V7l-4-4zM12 19a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm3-11H6V5h9v3z"></path>
        </svg>
      </button>

      <!-- Settings -->
      <button class="menu-button" data-tooltip="設定を開く" aria-label="設定">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19.14 12.94a7.14 7.14 0 0 0 0-1.88l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.02 7.02 0 0 0-1.6-.93l-.36-2.54A.5.5 0 0 0 14.7 2h-3.4a.5.5 0 0 0-.5.42l-.36 2.54c-.57.22-1.1.52-1.6.93L6.44 5.93a.5.5 0 0 0-.6.22L3.92 9.47a.5.5 0 0 0 .12.64L6.07 11.7a7.14 7.14 0 0 0 0 1.88L4 15.16a.5.5 0 0 0-.12.64l1.92 3.32c.14.24.43.35.68.26l2.39-.96c.5.41 1.03.71 1.6.93l.36 2.54c.05.28.29.48.58.48h3.4c.29 0 .53-.2.58-.48l.36-2.54c.57-.22 1.1-.52 1.6-.93l2.39.96c.25.09.54-.02.68-.26l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58zM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5z"></path>
        </svg>
      </button>

      <!-- Home -->
      <button class="menu-button" data-tooltip="ホームに戻る" aria-label="ホーム">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3l9 8h-3v8h-12v-8H3l9-8z"></path>
        </svg>
      </button>
    </div>
  </div>
</body>
</html>
