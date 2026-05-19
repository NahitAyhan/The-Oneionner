<?php
include 'db_connect.php';
header('Content-Type: application/json');

try {
    // Sadece QUESTION değil, CHOICE tablosunu da JOIN ile çekiyoruz.
    // get_questions.php'de yaptığın doğru mantığı burada da kurmalısın.
    $query = "SELECT q.QUESTION_ID, q.QUESTION_TEXT, c.CHOICE_ID, c.CHOICE_TEXT, c.IS_CORRECT 
              FROM QUESTION q 
              JOIN CHOICE c ON q.QUESTION_ID = c.QUESTION_ID 
              ORDER BY q.QUESTION_ID DESC, c.CHOICE_ID ASC";
    
    $stmt = $db->query($query);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $questions = [];
    foreach ($rows as $row) {
        $q_id = $row['QUESTION_ID'];
        
        // Dizi içinde bu soru henüz yoksa oluştur
        if (!isset($questions[$q_id])) {
            $questions[$q_id] = [
                "QUESTION_ID" => $q_id,
                "QUESTION_TEXT" => $row['QUESTION_TEXT'],
                "CHOICES" => []
            ];
        }
        
        // Şıkları o sorunun altına dizi olarak ekle
        $questions[$q_id]['CHOICES'][] = [
            "CHOICE_ID" => $row['CHOICE_ID'],
            "CHOICE_TEXT" => $row['CHOICE_TEXT'],
            // IS_CORRECT bilgisini JS tarafında doğru şıkkı yeşil göstermek için yolluyoruz
            "IS_CORRECT" => (bool)$row['IS_CORRECT'] 
        ];
    }
    
    // Key'leri sıfırlayıp temiz bir JSON dizisi dönüyoruz
    echo json_encode(array_values($questions));
} catch (Exception $e) {
    echo json_encode([]);
}
?>