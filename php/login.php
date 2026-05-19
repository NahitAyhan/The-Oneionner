<?php
include 'db_connect.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $tc_no = $_POST['tcNo'] ?? '';
    $password = hash('sha256', $_POST['password'] ?? '');

    try {
        $stmt = $db->prepare("
            SELECT su.USERNAME, su.USER_TYPE, s.STD_NO
            FROM SYSTEM_USER su
            LEFT JOIN STUDENT s ON su.TC_NO = s.TC_NO
            WHERE su.TC_NO = ? AND su.PASSWORD_HASH = ?
        ");        
        $stmt->execute([$tc_no, $password]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            echo json_encode([
                "status" => "success",
                "username" => $user['USERNAME'],
                "user_type" => $user['USER_TYPE'],
                "student_number" => $user['STD_NO'] ?? NULL
            ]);
            
        } else {
            echo json_encode(["status" => "error", "message" => "Hatalı TC veya Şifre!"]);
        }
    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}
?>
