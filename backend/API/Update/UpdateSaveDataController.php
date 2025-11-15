<?php
/* ==========================================================
 * セーブデータ更新API
 * ----------------------------------------------------------
 * ・SaveInfoテーブルに対してsaveslotid + playeridをキーに
 * 　storyidとupdatedateをUPDATE
 * ・BackLogInfoテーブルはリクエスト配列をループし、LogIdが
 * 　存在する要素は logid + playerid + saveslotid をキーに
 *   UPDATE、存在しない要素はINSERT
 * ----------------------------------------------------------
 * 更新履歴：
 * 2025-11-15 作成
 * ========================================================== */

/* ==========================================================
 * 1. 共通モジュール読み込み
 * ========================================================== */
// 1. ヘッダ情報
require_once "../../Cors/Header.php";
// 2. DB接続設定
require_once "../../DB/DB.php";
// 3. ログ関数
require_once "../../Utility/LogWrite.php";


/* ==========================================================
 * 2. リクエストデータ取得
 * ========================================================== */
// 1. POSTデータを取得
$PostData = json_decode(file_get_contents("php://input"), true);
// 2. プレイヤーID取得
$PlayerId = $PostData["PlayerId"] ?? null;
// 3. ストーリーID取得
$StoryId  = $PostData["StoryId"]  ?? null;
// 4. セーブスロットID取得
$SlotId   = $PostData["SlotId"]   ?? null;
// 5. バックログ配列取得
$BackLog  = $PostData["BackLog"]  ?? null;

try {
    /* ------------------------------
     * 1. トランザクション開始
     * ------------------------------ */
    $pdo->beginTransaction();

    /* ------------------------------
     * 2. SaveInfoテーブルの更新
     * ------------------------------ */
    // 1. クエリ定義
    $stmt = $pdo->prepare("
        UPDATE SaveInfo
        SET storyid = :storyid,
            updatedate = CURRENT_TIMESTAMP
        WHERE saveslotid = :saveslotid
          AND playerid = :playerid
    ");
    // 2. ストーリーIDをセット
    $stmt->bindValue(":storyid", $StoryId, PDO::PARAM_STR);
    // 3. セーブスロットIDをセット
    $stmt->bindValue(":saveslotid", $SlotId, PDO::PARAM_STR);
    // 4. プレイヤーIDをセット
    $stmt->bindValue(":playerid", $PlayerId, PDO::PARAM_STR);
    // 5. 処理実行
    $stmt->execute();

    /* ------------------------------
     * 3. BackLogInfoテーブルの更新処理
     * ------------------------------ */
    if (is_array($BackLog)) {
        /* 1. クエリ定義 */
        // 1. 更新クエリ定義
        $updateStmt = $pdo->prepare("
            UPDATE BackLogInfo
            SET narrator = :narrator,
                storytext = :storytext
            WHERE logid = :logid
              AND playerid = :playerid
              AND saveslotid = :saveslotid
        ");
        // 2. 登録クエリ定義
        $insertStmt = $pdo->prepare("
            INSERT INTO BackLogInfo (playerid, saveslotid, narrator, storytext)
            VALUES (:playerid, :saveslotid, :narrator, :storytext)
        ");

        /* 2. 更新処理実行 */
        foreach ($BackLog as $index => $item) {
            /* 定義 */
            // 1. ログID取得
            $logId     = $item["LogId"] ?? null;
            // 2. ストーリーテキスト取得
            $storyText = $item["StoryText"] ?? "";
            // 3. キャラ名取得
            $narrator  = $item["Narrator"] ?? "";

            /* logIdが存在する場合(更新処理) */
            if ($logId !== null && $logId !== "") {
                // 1. キャラ名設定
                $updateStmt->bindValue(":narrator", $narrator, PDO::PARAM_STR);
                // 2. ストーリーテキスト設定
                $updateStmt->bindValue(":storytext", $storyText, PDO::PARAM_STR);
                // 3. ログID設定
                $updateStmt->bindValue(":logid", $logId, PDO::PARAM_STR);
                // 4. プレイヤーID設定
                $updateStmt->bindValue(":playerid", $PlayerId, PDO::PARAM_STR);
                // 5. セーブスロットID設定
                $updateStmt->bindValue(":saveslotid", $SlotId, PDO::PARAM_STR);
                // 6. 処理実行
                $updateStmt->execute();
            /* logIdが存在しない場合(登録処理) */
            } else {
                // 1. プレイヤーID設定
                $insertStmt->bindValue(":playerid", $PlayerId, PDO::PARAM_STR);
                // 2. ログID設定
                $insertStmt->bindValue(":saveslotid", $SlotId, PDO::PARAM_STR);
                // 3. キャラ名設定
                $insertStmt->bindValue(":narrator", $narrator, PDO::PARAM_STR);
                // 4. ストーリーテキスト設定
                $insertStmt->bindValue(":storytext", $storyText, PDO::PARAM_STR);
                // 5. 処理実行
                $insertStmt->execute();
            }
        }
    }
    /* ------------------------------
     * 4. コミット処理
     * ------------------------------ */
    $pdo->commit();

    /* ------------------------------
     * 5. レスポンス返却
     * ------------------------------ */
    echo json_encode([
        "success" => true,
        "message" => "セーブが完了しました。"
    ]);

/* ==========================================================
 * 5. 例外処理
 * ========================================================== */
} catch (PDOException $e) {
    // 1.ロールバック
    $pdo->rollBack();
    // 2. ログ出力
    writeLog("UpdateSaveDataController エラー | error : " . $e->getMessage());
    // 3. エラーレスポンス
    echo json_encode([
        "success" => false,
        "message" => "DBエラーが発生しました。システム管理者にお問い合わせください。"
    ]);
}
