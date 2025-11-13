<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ゲーム画面</title>
    <!-- Font Awesome CDN -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">

    <style>
        /* ページ全体設定 */
        body {
            margin: 0;
            padding: 0;
            height: 100vh;
            width: 100vw;
            background: url("../assets/img/bg/Bg1.jpg") no-repeat center center/cover;
            position: relative;
            font-family: "Yu Gothic", sans-serif;
        }

        /* 右上ボタンコンテナ */
        .menu-container {
            position: absolute;
            top: 20px;
            right: 20px;
            display: flex;
            gap: 15px;
            background: rgba(0, 0, 0, 0.4);
            padding: 10px 15px;
            border-radius: 10px;
        }

        /* 各ボタンの基本デザイン */
        .menu-button {
            color: #fff;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 8px;
            padding: 10px 12px;
            font-size: 1.2rem;
            cursor: pointer;
            transition: background 0.2s, transform 0.2s;
        }

        .menu-button:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: scale(1.1);
        }

        /* アイコンにラベルを追加 */
        .menu-button span {
            font-size: 0.8rem;
            display: block;
            text-align: center;
            margin-top: 4px;
        }
    </style>
</head>
<body>

    <!-- 右上メニューコンテナ -->
    <div class="menu-container">
        <div class="menu-button" title="バックログ">
            <i class="fas fa-comments"></i>
            <span>ログ</span>
        </div>
        <div class="menu-button" title="セーブ">
            <i class="fas fa-save"></i>
            <span>セーブ</span>
        </div>
        <div class="menu-button" title="設定">
            <i class="fas fa-cog"></i>
            <span>設定</span>
        </div>
        <div class="menu-button" title="ホームへ戻る">
            <i class="fas fa-home"></i>
            <span>ホーム</span>
        </div>
    </div>

</body>
</html>
