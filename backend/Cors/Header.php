<?php
/* JSON通信として設定 */
header("Content-Type: application/json; charset=UTF-8");

/* CORSの設定 */
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");