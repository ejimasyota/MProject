<?php
/* ==========================================================
 * セーブデータ削除API
 * ----------------------------------------------------------
 * ・指定されたプレイヤーIDとセーブスロットIDに紐づく
 *   セーブデータとバックログを削除する。
 * ・削除完了後、結果メッセージを返却する。
 * ----------------------------------------------------------
 * 更新履歴：
 * 2025-11-12 作成
 * ========================================================== */

/* ==========================================================
 * 1. 共通モジュール読み込み
 * ========================================================== */
// 1.ヘッダ情報
require_once "../../Cors/Header.php";
// 2.接続設定
require_once "../../DB/DB.php";
// 3.ログ関数
require_once "../../Utility/LogWrite.php";

/* ==========================================================
 * 2. リクエストデータ取得
 * ========================================================== */
// 1.POSTデータを取得
$PostData = json_decode(file_get_contents("php://input"), true);
// 2.プレイヤーIDを取得
$PlayerId = $PostData["PlayerId"] ?? null;
// 3.セーブスロットIDを取得
$SlotId = $PostData["SlotId"] ?? null;

/* ==========================================================
 * 3. 削除処理
 * ========================================================== */
try {
    /* ------------------------------
     * トランザクション開始
     * ------------------------------ */
    $pdo->beginTransaction();

    /* ------------------------------
     * 1. SaveInfoテーブル削除
     * ------------------------------ */
    $stmt = $pdo->prepare("
        DELETE FROM SaveInfo
        WHERE playerid = :playerid
          AND saveslotid = :slotid
    ");
    // 1.プレイヤーID設定
    $stmt->bindValue(":playerid", $PlayerId, PDO::PARAM_STR);
    // 2.セーブスロットID設定
    $stmt->bindValue(":slotid", $SlotId, PDO::PARAM_INT);
    // 3.SQL実行
    $stmt->execute();

    /* ------------------------------
     * 2. BackLogInfoテーブル削除
     * ------------------------------ */
    $stmt = $pdo->prepare("
        DELETE FROM BackLogInfo
        WHERE playerid = :playerid
          AND saveslotid = :slotid
    ");
    // 1.プレイヤーID設定
    $stmt->bindValue(":playerid", $PlayerId, PDO::PARAM_STR);
    // 2.セーブスロットID設定
    $stmt->bindValue(":slotid", $SlotId, PDO::PARAM_INT);
    // 3.SQL実行
    $stmt->execute();

    /* ------------------------------
     * 3. PlayerInfoテーブル削除
     * ------------------------------ */
    $stmt = $pdo->prepare("
        DELETE FROM PlayerInfo
        WHERE playerid = :playerid
          AND saveslotid = :slotid
    ");
    // 1.プレイヤーID設定
    $stmt->bindValue(":playerid", $PlayerId, PDO::PARAM_STR);
    // 2.セーブスロットID設定
    $stmt->bindValue(":slotid", $SlotId, PDO::PARAM_INT);
    // 3.SQL実行
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
        "message" => "セーブデータの削除が完了しました。"
    ]);

/* ==========================================================
 * 4. 例外処理
 * ========================================================== */
} catch (PDOException $e) {
    // 1.ロールバック
    $pdo->rollBack();
    // 2.ログ書き込み
    writeLog("セーブデータ削除エラー | error : " . $e->getMessage());
    // 3.レスポンスを返却
    echo json_encode([
        "success" => false,
        "message" => "DBエラーが発生しました。システム管理者にお問い合わせください。"
    ]);
}
