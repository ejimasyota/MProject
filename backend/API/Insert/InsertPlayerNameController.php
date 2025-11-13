<?php
/* ==========================================================
 * プレイヤー名登録API
 * ----------------------------------------------------------
 * ・指定されたプレイヤーIDに対応するプレイヤー名を登録する。
 * ・同時に SaveInfo テーブルに現在日時を登録する。
 * ・登録成功時は成功メッセージを返却。
 * ----------------------------------------------------------
 * 更新履歴：
 * 2025-11-13 作成
 * ========================================================== */

/* ==========================================================
 * 1. 共通モジュール読み込み
 * ========================================================== */
// 1.ヘッダ情報
require_once "../../Cors/Header.php";
// 2.DB接続設定
require_once "../../DB/DB.php";
// 3.ログ関数
require_once "../../Utility/LogWrite.php";

/* ==========================================================
 * 2. リクエストデータ取得
 * ========================================================== */
// 1.POSTデータを取得
$PostData = json_decode(file_get_contents("php://input"), true);
// 2.プレイヤー名を取得
$PlayerName = $PostData["PlayerName"] ?? null;
// 3.プレイヤーIDを取得
$PlayerId = $PostData["PlayerId"] ?? null;

/* ==========================================================
 * 3. 入力チェック
 * ========================================================== */
if (empty($PlayerName) || empty($PlayerId)) {
    echo json_encode([
        "success" => false,
        "message" => "入力データが不足しています。"
    ]);
    exit;
}

/* ==========================================================
 * 4. 登録処理
 * ========================================================== */
try {
    /* ------------------------------
     * トランザクション開始
     * ------------------------------ */
    $pdo->beginTransaction();

    /* ------------------------------
     * 1. PlayerInfo テーブル更新処理
     * ------------------------------ */
    $stmt = $pdo->prepare("
        INSERT INTO PlayerInfo (playerid, playername)
        VALUES (:playerid, :playername)
        ON DUPLICATE KEY UPDATE playername = :playername_update
    ");
    // 1.プレイヤーID設定
    $stmt->bindValue(":playerid", $PlayerId, PDO::PARAM_STR);
    // 2.プレイヤー名設定
    $stmt->bindValue(":playername", $PlayerName, PDO::PARAM_STR);
    // 3.重複時更新用のプレイヤー名設定
    $stmt->bindValue(":playername_update", $PlayerName, PDO::PARAM_STR);
    // 4.SQL実行
    $stmt->execute();

    /* ------------------------------
     * 2. SaveInfo テーブル登録処理
     * ------------------------------ */
    $stmt = $pdo->prepare("
        INSERT INTO SaveInfo (playerid, registdate)
        VALUES (:playerid, CURRENT_TIMESTAMP)
    ");
    // 1.プレイヤーID設定
    $stmt->bindValue(":playerid", $PlayerId, PDO::PARAM_STR);
    // 2.SQL実行
    $stmt->execute();

    /* ------------------------------
     * コミット処理
     * ------------------------------ */
    $pdo->commit();

    /* ------------------------------
     * レスポンス生成
     * ------------------------------ */
    echo json_encode([
        "success" => true,
        "message" => "プレイヤー名の登録が完了しました。"
    ]);

/* ==========================================================
 * 5. 例外処理
 * ========================================================== */
} catch (PDOException $e) {
    // 1.ロールバック
    $pdo->rollBack();
    // 2.ログ書き込み
    writeLog("プレイヤー名登録エラー | error : " . $e->getMessage());
    // 3.レスポンス返却
    echo json_encode([
        "success" => false,
        "message" => "DBエラーが発生しました。システム管理者にお問い合わせください。"
    ]);
}
