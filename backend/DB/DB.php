<?php
/* 各接続情報をenvから取得 */
// 1.サーバホスト(仮のIP。本番では別端末のIPを使用する)
$host = "localhost";
// 2.ポート
$port = "5433";
// 3.DB
$dbname = "matu";
// 4.ユーザー
$user = "ejima";
// 5.パスワード
$password = "ejima0902";

/* 接続処理 */
try {
    $pdo = new PDO("pgsql:host=$host;port=$port;dbname=$dbname", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    writeLog("DB接続エラー | error : " . $e->getMessage());
    echo json_encode([
        "success" => false,
        "message" => "DB接続エラーが発生しました。システム管理者にお問い合わせください。"
    ]);
    exit;
}