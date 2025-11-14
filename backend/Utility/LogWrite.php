<?php
/**
 * ログ出力ユーティリティ
 *
 * @param string $message ログメッセージ
 */
function writeLog($message) {
var_dump(__DIR__);
var_dump(__DIR__ . "/../Log/Error");
var_dump(is_writable(__DIR__ . "/../Log"));
var_dump(is_writable(__DIR__ . "/../Log/Error"));
exit;

}