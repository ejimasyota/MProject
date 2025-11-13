<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>ゲーム画面</title>
  <style>
    /* -- 全てを包む固定コンテナ（bodyを触らない） -- */
    .game-root {
      position: fixed;    /* ビューポートに固定 */
      inset: 0;           /* top:0; right:0; bottom:0; left:0; と同義 */
      overflow: hidden;
      background: url("../asetts/img/bg/Bg1.jpg") no-repeat center center fixed;
      background-size: cover;
      font-family: "Segoe UI", system-ui, -apple-system, "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    /* メニュー（右上） */
    .menu-container {
      position: absolute;
      top: 20px;
      right: 20px;
      display: flex;
      gap: 12px;
      background-color: rgba(255,255,255,0.35);
      padding: 10px 14px;
      border-radius: 10px;
      box-shadow: 0 6px 18px rgba(0,0,0,0.25);
      backdrop-filter: blur(4px);
    }

    .menu-button {
      color: rgba(0,0,0,0.75);
      width: 48px;
      height: 48px;
      display:inline-flex;
      align-items:center;
      justify-content:center;
      border-radius:8px;
      cursor:pointer;
      transition: transform .16s ease, color .16s ease;
      user-select:none;
      border: none;
      background: transparent;
    }
    .menu-button svg { width:28px; height:28px; fill: currentColor; }
    .menu-button:hover { color: #ffb6c1; transform: scale(1.08); }
    .menu-button:focus { outline: 2px solid rgba(255,182,193,0.45); outline-offset: 3px; }

    /* ツールチップ（同じ仕組み） */
    .menu-button::after {
      content: attr(data-tooltip);
      position: absolute;
      bottom: -44px;
      left: 50%;
      transform: translateX(-50%) scale(.96);
      background: rgba(255,192,203,0.95);
      color:#fff;
      padding:6px 10px;
      border-radius:8px;
      font-size:13px;
      opacity:0; pointer-events:none;
      box-shadow:0 2px 8px rgba(0,0,0,0.2);
      transition: opacity .18s ease, transform .18s ease;
      white-space:nowrap;
    }
    .menu-button:hover::after { opacity:1; transform: translateX(-50%) scale(1); }
    .menu-button::before{ content:""; position:absolute; bottom:-14px; left:50%; transform:translateX(-50%); border:6px solid transparent; border-top-color: rgba(255,192,203,0.95); opacity:0; transition:opacity .18s ease; }
    .menu-button:hover::before{ opacity:1; }
  </style>
</head>
<body>
  <!-- bodyには最小限の何も書かない。すべて .game-root で完結 -->
  <div class="game-root" role="application" aria-label="ゲーム画面">
    <div class="menu-container" aria-hidden="false">
      <button class="menu-button" data-tooltip="バックログを見る" aria-label="バックログ">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2h9a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 2v14h9V4H6zM20 7h1v11a1 1 0 0 1-1 1h-1v-2h1V7z"/></svg>
      </button>
      <button class="menu-button" data-tooltip="セーブする" aria-label="セーブ">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14V7l-4-4zM12 19a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm3-11H6V5h9v3z"/></svg>
      </button>
      <button class="menu-button" data-tooltip="設定を開く" aria-label="設定">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.14 12.94a7.14 7.14 0 0 0 0-1.88l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.02 7.02 0 0 0-1.6-.93l-.36-2.54A.5.5 0 0 0 14.7 2h-3.4a.5.5 0 0 0-.5.42l-.36 2.54c-.57.22-1.1.52-1.6.93L6.44 5.93a.5.5 0 0 0-.6.22L3.92 9.47a.5.5 0 0 0 .12.64L6.07 11.7a7.14 7.14 0 0 0 0 1.88L4 15.16a.5.5 0 0 0-.12.64l1.92 3.32c.14.24.43.35.68.26l2.39-.96c.5.41 1.03.71 1.6.93l.36 2.54c.05.28.29.48.58.48h3.4c.29 0 .53-.2.58-.48l.36-2.54c.57-.22 1.1-.52 1.6-.93l2.39.96c.25.09.54-.02.68-.26l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58zM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5z"/></svg>
      </button>
      <button class="menu-button" data-tooltip="ホームに戻る" aria-label="ホーム">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l9 8h-3v8h-12v-8H3l9-8z"/></svg>
      </button>
    </div>
  </div>
</body>
</html>
