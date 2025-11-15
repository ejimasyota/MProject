<?php
/* ==========================================================
 * プレイヤー詳細データ取得API
 * ----------------------------------------------------------
 * ・指定されたプレイヤーIDに紐づくプレイヤー情報、
 *   セーブ情報、バックログ情報を取得する。
 * ・取得結果が存在しない場合は空配列を返却。
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
// 1.POSTデータを取得
$PostData = json_decode(file_get_contents("php://input"), true);
// 2.プレイヤーIDを取得
$PlayerId    = $PostData["PlayerId"]    ?? null;
// 3.セーブスロットIDを取得
$SaveSlotId  = $PostData["SaveSlotId"]  ?? null;

/* ==========================================================
 * 3. データ取得処理
 * ========================================================== */
try {
    /* --------------------------------
     * 1. PlayerInfo取得
     * -------------------------------- */
    // 1. クエリ定義
    $stmt1 = $pdo->prepare("SELECT 
                                playername
                            FROM PlayerInfo
                            WHERE playerid = :playerid
                            LIMIT 1");

    // 2. パラメータ設定
    $stmt1->bindValue(":playerid", $PlayerId, PDO::PARAM_STR);

    // 3. 実行
    $stmt1->execute();

    // 4. 取得内容を保持
    $PlayerInfoRow = $stmt1->fetch(PDO::FETCH_ASSOC);

    /* --------------------------------
     * 2. SaveInfo取得
     * -------------------------------- */
    // 1. クエリ定義
    $stmt2 = $pdo->prepare("SELECT 
                                storyid
                            FROM SaveInfo
                            WHERE playerid = :playerid
                              AND saveslotid = :saveslotid
                            LIMIT 1");

    // 2. パラメータ設定
    $stmt2->bindValue(":playerid",   $PlayerId,   PDO::PARAM_STR);
    $stmt2->bindValue(":saveslotid", $SaveSlotId, PDO::PARAM_STR);

    // 3. 実行
    $stmt2->execute();

    // 4. 取得内容を保持
    $SaveInfoRows = $stmt2->fetch(PDO::FETCH_ASSOC);

    /* --------------------------------
     * 3. BackLogInfo取得
     * -------------------------------- */
    // 1. クエリ定義
    $stmt3 = $pdo->prepare("SELECT 
                                logid,
                                narrator,
                                storytext
                            FROM BackLogInfo
                            WHERE playerid = :playerid
                              AND saveslotid = :saveslotid
                            ORDER BY logid ASC");

    // 2. パラメータ設定
    $stmt3->bindValue(":playerid",   $PlayerId,   PDO::PARAM_STR);
    $stmt3->bindValue(":saveslotid", $SaveSlotId, PDO::PARAM_STR);

    // 3. 実行
    $stmt3->execute();

    // 4. 取得内容を保持
    $BackLogRows = $stmt3->fetchAll(PDO::FETCH_ASSOC);

    /* ==========================================================
     * 4. レスポンス生成
     * ========================================================== */
    // 1. 何か1つでもデータが存在するかをチェック
    $DateCheckFlg = $PlayerInfoRow || $SaveInfoRows || $BackLogRows;

    // 2. 取得内容が存在する場合は取得内容を返す
    if ($DateCheckFlg) {
        echo json_encode([
            "success" => true,
            "message" => "プレイヤー詳細データの取得に成功しました。",
            "items"   => [
                "PlayerInfo"  => $PlayerInfoRow  ?: [],
                "SaveInfo"    => $SaveInfoRows   ?: [],
                "BackLogInfo" => $BackLogRows    ?: []
            ]
        ]);
    // 3. 取得内容が存在しない場合は空配列を返す
    } else {
        echo json_encode([
            "success" => true,
            "message" => "データが存在しません。",
            "items"   => [
                "PlayerInfo"  => [],
                "SaveInfo"    => [],
                "BackLogInfo" => []
            ]
        ]);
    }
/* ==========================================================
 * 5. 例外処理
 * ========================================================== */
} catch (PDOException $e) {
    // 1.ログ書き込み
    writeLog("プレイヤー詳細データ取得エラー | error : " . $e->getMessage());
    // 2.レスポンス返却
    echo json_encode([
        "success" => false,
        "message" => "DBエラーが発生しました。システム管理者にお問い合わせください。"
    ]);
}
