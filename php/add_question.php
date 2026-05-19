<?php
include 'db_connect.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $quiz_id = $_POST['quiz_id'] ?? 1; 
    $question_text = $_POST['question_text'] ?? '';
    
    // Şıkları bir diziye alıyoruz. Öğretmen formda doğru cevabı hep optA'ya giriyor.
    $options = [
        ['text' => $_POST['optA'], 'correct' => 1],
        ['text' => $_POST['optB'], 'correct' => 0],
        ['text' => $_POST['optC'], 'correct' => 0],
        ['text' => $_POST['optD'], 'correct' => 0]
    ];

    // Şıkları veritabanına yazmadan önce rastgele karıştırıyoruz!
    shuffle($options);

    try {
        $db->beginTransaction();
        
        // Soruyu ekle
        $stmt = $db->prepare("INSERT INTO QUESTION (QUIZ_ID, QUESTION_TEXT) VALUES (?, ?)");
        $stmt->execute([$quiz_id, $question_text]);
        $question_id = $db->lastInsertId();

        // Karıştırılmış şıkları veritabanına ekle
        $stmt_choice = $db->prepare("INSERT INTO CHOICE (QUESTION_ID, CHOICE_TEXT, IS_CORRECT) VALUES (?, ?, ?)");
        foreach ($options as $opt) {
            $stmt_choice->execute([$question_id, $opt['text'], $opt['correct']]);
        }

        $db->commit();
        echo json_encode(["status" => "success", "message" => "Soru eklendi ve şıklar başarıyla karıştırıldı!"]);
    } catch (Exception $e) {
        if ($db->inTransaction()) $db->rollBack();
        echo json_encode(["status" => "error", "message" => "Veritabanı Hatası: " . $e->getMessage()]);
    }
}
?>