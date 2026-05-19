<?php
include 'db_connect.php';
header('Content-Type: application/json');
try {
    // SYSTEM_USER ve STUDENT tablolarını birleştirip en yüksek puanlı 10 kişiyi çekmek için.
    $query = "SELECT u.USERNAME, s.TOTAL_SCORE  
              FROM SYSTEM_USER u 
              JOIN STUDENT s ON u.TC_NO = s.TC_NO 
              ORDER BY s.TOTAL_SCORE DESC LIMIT 10";
    $stmt = $db->query($query);
    $leaderboard = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($leaderboard);
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>