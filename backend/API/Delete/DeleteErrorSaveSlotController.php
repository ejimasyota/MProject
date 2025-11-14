<?php
/* ==========================================================
 * 不要セーブ情報削除API
 * ----------------------------------------------------------
 * ・指定されたプレイヤーIDについて、SaveInfoテーブルで
 *  「登録日があり更新日がなくストーリーIDがNULL」のレコードを
 *   削除する。
 * ・削除対象のプレイヤーID・セーブスロットIDに紐づくPlayerInfoの
 *   レコードも併せて削除する。
 * ・要は、ゲーム初期開始→セーブせず保存時のフローへの対策
 * ----------------------------------------------------------
 * 更新履歴：
 * 2025-11-14 作成
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
// 1.POSTデータ取得
$PostData = json_decode(file_get_contents("php://input"), true);
// 2.プレイヤーID取得
$PlayerId = $PostData["PlayerId"] ?? null;


/* ==========================================================
 * 3. 削除処理
 * ========================================================== */
try {
    /* ------------------------------
     * 1. トランザクション開始
     * ------------------------------ */
    $pdo->beginTransaction();

    /* ------------------------------
     * 2. 削除対象となるレコードを取得
     * ------------------------------ */
    // 1. クエリ定義
    $stmt = $pdo->prepare("
        SELECT saveslotid
        FROM SaveInfo
        WHERE playerid = :playerid
          AND registdate IS NOT NULL
          AND updatedate IS NULL
          AND storyid IS NULL
    ");
    // 2. プレイヤーID設定
    $stmt->bindValue(":playerid", $PlayerId, PDO::PARAM_STR);
    // 3. 実行
    $stmt->execute();
    // 4. 削除対象行をすべて保持
    $DeleteTargets = $stmt->fetchAll(PDO::FETCH_ASSOC);

    /* ------------------------------
     * 2. 対象が存在しない場合
     *    ↳ 削除なしとして終了
     * ------------------------------ */
    if (empty($DeleteTargets)) {
        echo json_encode([
            "success" => true,
            "message" => "削除対象レコードはありません。"
        ]);
        $pdo->commit();
        exit;
    }

    /* ------------------------------
     * 3. SaveInfoから該当データ削除
     * ------------------------------ */
    // 1. クエリを定義
    $stmt = $pdo->prepare("
        DELETE FROM SaveInfo
        WHERE playerid = :playerid
          AND registdate IS NOT NULL
          AND updatedate IS NULL
          AND storyid IS NULL
    ");
    // 2. プレイヤーID設定
    $stmt->bindValue(":playerid", $PlayerId, PDO::PARAM_STR);
    // 3. 実行
    $stmt->execute();

    /* ------------------------------
     * 4. PlayerInfoの削除
     * ------------------------------ */
    // 1. クエリの定義
    $stmtPlayer = $pdo->prepare("
        DELETE FROM PlayerInfo
        WHERE playerid = :playerid AND saveslotid = :saveslotid
    ");

    // 2. 対象レコードをすべて削除
    foreach ($DeleteTargets as $Row) {
        $SaveSlotId = $Row["saveslotid"];
        $stmtPlayer->bindValue(":playerid", $PlayerId, PDO::PARAM_STR);
        $stmtPlayer->bindValue(":saveslotid", $SaveSlotId, PDO::PARAM_INT);
        $stmtPlayer->execute();
    }

    /* ------------------------------
     * 5. コミット処理
     * ------------------------------ */
    $pdo->commit();

    /* ------------------------------
     * 6. レスポンス生成
     * ------------------------------ */
    echo json_encode([
        "success" => true,
        "message" => "不要セーブデータの削除が完了しました。"
    ]);


/* ==========================================================
 * 4. 例外処理
 * ========================================================== */
} catch (PDOException $e) {
    // 1. ロールバック
    $pdo->rollBack();
    // 2. ログ出力
    writeLog("不要セーブ情報削除エラー | error : " . $e->getMessage());
    // 3. レスポンス返却
    echo json_encode([
        "success" => false,
        "message" => "DBエラーが発生しました。システム管理者にお問い合わせください。"
    ]);
}
