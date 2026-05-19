<?php
include 'db_connect.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $q_id = $_POST['question_id'] ?? '';

    try {
        $stmt = $db->prepare("DELETE FROM QUESTION WHERE QUESTION_ID = ?");
        $stmt->execute([$q_id]);
        echo json_encode(["status" => "success", "message" => "Soru silindi."]);
    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}
?>