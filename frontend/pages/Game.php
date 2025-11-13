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
  <div class="GameContainer" role="application" aria-label="ゲーム画面"
     style="background: url('../asetts/img/bg/Bg1.jpg') no-repeat center center fixed; background-size: cover;">
    <div class="MenuContainer">
        <button class="MenuButton" data-tooltip="バックログを見る" aria-label="バックログ">
        <svg viewBox="0 0 24 24">
            <path d="M6 2h9a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 2v14h9V4H6zM19 6h2v12a1 1 0 0 1-1 1h-1v-2h1V6z"/>
        </svg>
        </button>

      <button class="MenuButton" data-tooltip="セーブする" aria-label="セーブ">
        <svg viewBox="0 0 24 24"><path d="M17 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14V7l-4-4zM12 19a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm3-11H6V5h9v3z"/></svg>
      </button>

        <button class="MenuButton" data-tooltip="設定を開く" aria-label="設定">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 -1 2 2" width="100" height="100" fill="currentColor">
                <path d="M0,-1A1,1,0,0,1,0.17365,-0.98481L0.27362,-0.75175A0.80000,0.80000,0,0,1,0.33809,-0.72505L0.57358,-0.81915A1,1,0,0,1,0.70711,-0.70711A1,1,0,0,1,0.81915,-0.57358L0.72505,-0.33809A0.80000,0.80000,0,0,1,0.75175,-0.27362L0.98481,-0.17365A1,1,0,0,1,1.00000,-0.00000A1,1,0,0,1,0.98481,0.17365L0.75175,0.27362A0.80000,0.80000,0,0,1,0.72505,0.33809L0.81915,0.57358A1,1,0,0,1,0.70711,0.70711A1,1,0,0,1,0.57358,0.81915L0.33809,0.72505A0.80000,0.80000,0,0,1,0.27362,0.75175L0.17365,0.98481A1,1,0,0,1,0.00000,1.00000A1,1,0,0,1,-0.17365,0.98481L-0.27362,0.75175A0.80000,0.80000,0,0,1,-0.33809,0.72505L-0.57358,0.81915A1,1,0,0,1,-0.70711,0.70711A1,1,0,0,1,-0.81915,0.57358L-0.72505,0.33809A0.80000,0.80000,0,0,1,-0.75175,0.27362L-0.98481,0.17365A1,1,0,0,1,-1.00000,0.00000A1,1,0,0,1,-0.98481,-0.17365L-0.75175,-0.27362A0.80000,0.80000,0,0,1,-0.72505,-0.33809L-0.81915,-0.57358A1,1,0,0,1,-0.70711,-0.70711A1,1,0,0,1,-0.57358,-0.81915L-0.33809,-0.72505A0.80000,0.80000,0,0,1,-0.27362,-0.75175L-0.17365,-0.98481A1,1,0,0,1,-0.00000,-1.00000L0,-0.3A0.3,0.3,0,1,0,0,0.3A0.3,0.3,0,1,0,0,-0.3Z" />
            </svg>
        </button>


      <button class="MenuButton" data-tooltip="ホームに戻る" aria-label="ホーム">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100" height="100">
          <path d="M12 3l9 8h-3v8h-12v-8H3l9-8z"/>
        </svg>
      </button>
    </div>
  </div>
</body>
</html>
