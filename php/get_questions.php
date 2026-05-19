<?php
include 'db_connect.php';
header('Content-Type: application/json');

$category_id = $_GET['category_id'] ?? null;

if (!$category_id) {
    echo json_encode(["status" => "error", "message" => "Kategori ID belirtilmedi."]);
    exit;
}

try {
    // Seçilen kategorideki ilk quiz'i ve onun TIME_LIMIT değerini buluyoruz
    $quizStmt = $db->prepare("SELECT QUIZ_ID, TIME_LIMIT FROM QUIZ WHERE CATEGORY_ID = ? LIMIT 1");
    $quizStmt->execute([$category_id]);
    $quiz = $quizStmt->fetch(PDO::FETCH_ASSOC);

    if (!$quiz) {
        echo json_encode(["status" => "error", "message" => "Bu kategoride henüz quiz bulunmamaktadır."]);
        exit;
    }

    $quiz_id = $quiz['QUIZ_ID'];
    // Eğer veritabanında TIME_LIMIT boş (NULL) kalmışsa çökmemesi için varsayılan 10 saniye veriyoruz
    $time_limit = $quiz['TIME_LIMIT'] ? (int)$quiz['TIME_LIMIT'] : 10; 

    // Soruları ve şıkları tek seferde çekiyoruz 
    $query = "SELECT q.QUESTION_ID, q.QUESTION_TEXT, c.CHOICE_ID, c.CHOICE_TEXT, c.IS_CORRECT 
              FROM QUESTION q 
              JOIN CHOICE c ON q.QUESTION_ID = c.QUESTION_ID 
              WHERE q.QUIZ_ID = ? 
              ORDER BY q.QUESTION_ID, c.CHOICE_ID";
    
    $stmt = $db->prepare($query);
    $stmt->execute([$quiz_id]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $questions = [];
    foreach ($rows as $row) {
        $q_id = $row['QUESTION_ID'];
        if (!isset($questions[$q_id])) {
            $questions[$q_id] = [
                "question_id" => $q_id,
                "text" => $row['QUESTION_TEXT'],
                "choices" => []
            ];
        }
        $questions[$q_id]['choices'][] = [
            "choice_id" => $row['CHOICE_ID'],
            "text" => $row['CHOICE_TEXT'],
            "is_correct" => (bool)$row['IS_CORRECT']
        ];
    }

    echo json_encode([
        "status" => "success",
        "quiz_id" => $quiz_id,
        "time_limit" => $time_limit, // YENİ EKLENDİ: Süreyi JS'e yolluyoruz
        "questions" => array_values($questions)
    ]);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>