<?php
include 'db_connect.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $tc_no = $_POST['tcNo'] ?? ''; 
    $username = $_POST['username'] ?? '';
    $email = $_POST['email'] ?? '';
    // Şifreyi SHA-256 ile hash'liyoruz 
    $password_hash = hash('sha256', $_POST['password'] ?? '');
    $user_type = $_POST['userType'] ?? 'STUDENT';
    
    $student_no = $_POST['studentNumber'] ?? $tc_no; 
    $academic_title = $_POST['academicTitle'] ?? NULL;

    // --- PHP DOĞRULAMASI: Email Domain Kontrolü (Whitelist) ---
    // Kabul edilen domainler listesi
    $allowed_domains = [
        'gmail.com', 
        'hotmail.com', 
        'outlook.com', 
        'yahoo.com', 
        'icloud.com', 
        'yandex.com', 
        'protonmail.com',
        'proton.me',
        'zoho.com',
        'karabuk.edu.tr',
        'ogrenci.karabuk.edu.tr'
    ];
    
    // Mail adresini @ işaretinden böl
    $email_parts = explode('@', $email);
    
    if (count($email_parts) !== 2) {
        echo json_encode(["status" => "error", "message" => "Geçersiz email formatı!"]);
        exit;
    }

    $domain = strtolower(end($email_parts));

    // Domain bizim listemizin içinde yoksa işlemi durdur
    if (!in_array($domain, $allowed_domains)) {
        echo json_encode(["status" => "error", "message" => "Sadece bilinen mail sağlayıcıları veya Karabük Üniversitesi uzantılı mailler ile kayıt olabilirsiniz!"]);
        exit;
    }

    // --- PHP DOĞRULAMASI: Rol Bazlı Domain Kontrolü ---
    if ($user_type === 'TEACHER' && $domain === 'ogrenci.karabuk.edu.tr') {
        echo json_encode(["status" => "error", "message" => "Akademisyenlerin öğrenci hesabı bulunamaz!"]);
        exit;
    }

    if ($user_type === 'STUDENT' && $domain === 'karabuk.edu.tr') {
        echo json_encode(["status" => "error", "message" => "Öğrencilerin personel hesabı bulunamaz!"]);
        exit;
    }

    try {
        $db->beginTransaction();

        // Ana tabloya (Super-type) kayıt
        $stmt = $db->prepare("INSERT INTO SYSTEM_USER (TC_NO, USERNAME, EMAIL, PASSWORD_HASH, USER_TYPE, REGISTRATION_DATE) VALUES (?, ?, ?, ?, ?, NOW())");
        $stmt->execute([$tc_no, $username, $email, $password_hash, $user_type]);

        // Alt tiplere (Sub-type) göre kayıt
        if ($user_type === 'TEACHER') {
            $stmt2 = $db->prepare("INSERT INTO TEACHER (TC_NO, ACADEMIC_TITLE) VALUES (?, ?)");
            $stmt2->execute([$tc_no, $academic_title]);
        } else {
            // Öğrenci numarası 10 hane olarak STD_NO sütununa yazılır
            $stmt2 = $db->prepare("INSERT INTO STUDENT (TC_NO, TOTAL_SCORE, STD_NO) VALUES (?, 0, ?)");
            $stmt2->execute([$tc_no, $student_no]); 
        }

        $db->commit();
        echo json_encode(["status" => "success"]);
    } catch (Exception $e) {
        if ($db->inTransaction()) $db->rollBack();
        echo json_encode(["status" => "error", "message" => "Kayıt hatası: " . $e->getMessage()]);
    }
}
?>