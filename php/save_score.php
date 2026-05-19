<?php
include 'db_connect.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $tc = $_POST['tcNo'] ?? '';
    $score = $_POST['score'] ?? 0;

    if (empty($tc)) {
        echo json_encode(["status" => "error", "message" => "TC numarası eksik."]);
        exit;
    }

    try {
        $db->beginTransaction();

        // Öğrencinin toplam puanını güncelle 
        $stmt = $db->prepare("UPDATE STUDENT SET TOTAL_SCORE = TOTAL_SCORE + ? WHERE TC_NO = ?");
        $stmt->execute([$score, $tc]);

        // Sınav sonucunu log olarak kaydet 
        $log = $db->prepare("INSERT INTO RESULT_LOG (USER_TC, QUIZ_ID, SCORE, COMPLETED_AT) VALUES (?, 1, ?, NOW())");
        $log->execute([$tc, $score]);

        $db->commit();
        echo json_encode(["status" => "success"]);
    } catch (Exception $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}
?>