<?php
include 'db_connect.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $q_id = $_POST['question_id'] ?? '';
    $new_text = $_POST['question_text'] ?? '';
    $choices = $_POST['choices'] ?? []; // choice_id => yeni_metin formatında dizi

    if (empty($q_id) || empty($new_text) || empty($choices)) {
        echo json_encode(["status" => "error", "message" => "Soru metni veya şıklar boş olamaz!"]);
        exit;
    }

    try {
        $db->beginTransaction();

        // 1. Önce QUESTION tablosunu güncelle
        $stmt = $db->prepare("UPDATE QUESTION SET QUESTION_TEXT = ? WHERE QUESTION_ID = ?");
        $stmt->execute([$new_text, $q_id]);

        // 2. Döngüye girip CHOICE tablosundaki şıkları kendi ID'lerine göre güncelle
        $stmtChoice = $db->prepare("UPDATE CHOICE SET CHOICE_TEXT = ? WHERE CHOICE_ID = ? AND QUESTION_ID = ?");
        foreach ($choices as $choice_id => $choice_text) {
            // WHERE şartına QUESTION_ID eklemek, güvenlik açısından başkasının şıkkını değiştirmeyi engeller.
            $stmtChoice->execute([$choice_text, $choice_id, $q_id]);
        }

        $db->commit();
        echo json_encode(["status" => "success", "message" => "Soru ve şıklar başarıyla güncellendi!"]);
    } catch (Exception $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        echo json_encode(["status" => "error", "message" => "Veritabanı Hatası: " . $e->getMessage()]);
    }
}
?>