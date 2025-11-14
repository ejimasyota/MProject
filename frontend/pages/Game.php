<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <link rel="stylesheet" href="../asetts/css/style.css">
  <title>ゲーム画面</title>
  <style>
  </style>
</head>
<body>
  <!-- ゲームコンテナ -->
  <div class="GameContainer" role="application" aria-label="ゲーム画面"
     style="background: url('../asetts/img/bg/Bg1.jpg') no-repeat center center fixed; background-size: cover;">
    <!-- メニューコンテナ -->
    <div class="MenuContainer">
      <!-- 1. バックログ表示ボタン -->
      <button class="MenuButton" data-tooltip="バックログを見る" aria-label="バックログ">
        <svg xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24" width="100" height="100" fill="currentColor">
          <rect x="4" y="5" width="14" height="15" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="2"/>
          <line x1="4"  y1="7" x2="18" y2="7" stroke="currentColor" stroke-width="2"/>
          <line x1="7" y1="11" x2="15" y2="11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <line x1="7" y1="14" x2="15" y2="14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <line x1="7" y1="17" x2="12" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>

      <!-- 3. セーブボタン -->
      <button class="MenuButton" data-tooltip="セーブする" aria-label="セーブ">
        <svg xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" width="100" height="100" fill="currentColor">
          <path d="M4 3h12l4 4v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/>
          <rect x="7" y="3.5" width="7" height="5" fill="#ffffff"/>
          <rect x="6" y="12" width="12" height="8" rx="1" ry="1" fill="#ffffff"/>
          <circle cx="12" cy="16" r="2.5"/>
        </svg>
      </button>

      <!-- 4. 設定ボタン -->
      <button class="MenuButton" data-tooltip="設定を開く" aria-label="設定">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 -1 2 2" width="100" height="100" fill="currentColor">
          <path d="M0,-1A1,1,0,0,1,0.17365,-0.98481L0.27362,-0.75175A0.80000,0.80000,0,0,1,0.33809,-0.72505L0.57358,-0.81915A1,1,0,0,1,0.70711,-0.70711A1,1,0,0,1,0.81915,-0.57358L0.72505,-0.33809A0.80000,0.80000,0,0,1,0.75175,-0.27362L0.98481,-0.17365A1,1,0,0,1,1.00000,-0.00000A1,1,0,0,1,0.98481,0.17365L0.75175,0.27362A0.80000,0.80000,0,0,1,0.72505,0.33809L0.81915,0.57358A1,1,0,0,1,0.70711,0.70711A1,1,0,0,1,0.57358,0.81915L0.33809,0.72505A0.80000,0.80000,0,0,1,0.27362,0.75175L0.17365,0.98481A1,1,0,0,1,0.00000,1.00000A1,1,0,0,1,-0.17365,0.98481L-0.27362,0.75175A0.80000,0.80000,0,0,1,-0.33809,0.72505L-0.57358,0.81915A1,1,0,0,1,-0.70711,0.70711A1,1,0,0,1,-0.81915,0.57358L-0.72505,0.33809A0.80000,0.80000,0,0,1,-0.75175,0.27362L-0.98481,0.17365A1,1,0,0,1,-1.00000,0.00000A1,1,0,0,1,-0.98481,-0.17365L-0.75175,-0.27362A0.80000,0.80000,0,0,1,-0.72505,-0.33809L-0.81915,-0.57358A1,1,0,0,1,-0.70711,-0.70711A1,1,0,0,1,-0.57358,-0.81915L-0.33809,-0.72505A0.80000,0.80000,0,0,1,-0.27362,-0.75175L-0.17365,-0.98481A1,1,0,0,1,-0.00000,-1.00000L0,-0.3A0.3,0.3,0,1,0,0,0.3A0.3,0.3,0,1,0,0,-0.3Z" />
        </svg>
      </button>

      <!-- 5. ホームへ戻るボタン -->
      <button class="MenuButton" data-tooltip="ホームに戻る" aria-label="ホーム">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100" height="100">
          <path d="M12 3l9 8h-3v8h-12v-8H3l9-8z"/>
        </svg>
      </button>
    </div>
  </div>

  <!-- 各JavaScriptの読み込み -->
  <!-- 1. コンファームダイアログ -->
  <script src="../script/dialog/ConfirmDialog.js"></script>
  <!-- 2. スピナーダイアログ -->
  <script src="../script/dialog/SpinnerDialod.js"></script>
  <!-- 3. 名前入力ダイアログ -->
  <script src="../script/dialog/InputPlayerNameDialog.js"></script>
  <!-- 4. メッセージボックスダイアログ -->
  <script src="../script/dialog/MessageBoxDialog.js"></script>
  <!-- 5. 共通関数 -->
  <script src="../script/utility/util.js"></script>
  <!-- 6. 当該画面のJS -->
  <script src="../script/page/Game.js"></script>
</body>
</html>
