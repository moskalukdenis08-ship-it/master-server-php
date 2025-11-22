<?php
header("Content-Type: application/json");

// 1. Прочитати JSON з Unity
$input = json_decode(file_get_contents("php://input"), true);

if (!$input) {
    echo json_encode(["error" => "Invalid input"]);
    exit;
}

// Дані сервера
$name = $input["name"] ?? "Unknown";
$ip = $input["ip"] ?? "0.0.0.0";
$port = $input["port"] ?? "0000";

// 2. Надсилаємо в JSONBin
$binId = "YOUR_BIN_ID";
$apiKey = "YOUR_JSONBIN_API_KEY";

$url = "https://api.jsonbin.io/v3/b/$binId";

// Формуємо новий список серверів
$servers = [
    "name" => $name,
    "ip" => $ip,
    "port" => $port
];

$options = [
    "http" => [
        "header" => [
            "Content-Type: application/json",
            "X-Master-Key: $apiKey"
        ],
        "method" => "PUT",
        "content" => json_encode(["servers" => [$servers]])
    ]
];

$context = stream_context_create($options);
$result = file_get_contents($url, false, $context);

// 3. Повертаємо відповідь Unity
echo $result;
