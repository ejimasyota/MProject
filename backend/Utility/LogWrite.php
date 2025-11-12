<?php
/**
 * ログ出力ユーティリティ
 *
 * @param string $message ログメッセージ
 */
function writeLog($message) {
    // ログディレクトリ
    $logDir = __DIR__ . "/../Log";

    // ログタイプごとのサブディレクトリに分ける
    $logDir .= "/Error";

    // ディレクトリがなければ作成
    if (!is_dir($logDir)) {
        mkdir($logDir, 0777, true);
    }

    // 日付ごとのログファイル
    $logFile = $logDir . "/" . "まつのさ恋_" . date("Ymd") . ".log";

    // タイムスタンプ付きメッセージ
    $logMessage = "[" . date("Y-m-d H:i:s") . "] " . $message . PHP_EOL;

    // ファイルへ追記
    file_put_contents($logFile, $logMessage, FILE_APPEND | LOCK_EX);
}