-- 1. ANA KULLANICI TABLOSU (SUPER-TYPE)
CREATE TABLE SYSTEM_USER (
    TC_NO VARCHAR(11) PRIMARY KEY,
    USERNAME VARCHAR(50) NOT NULL,
    EMAIL VARCHAR(100) NOT NULL,
    PASSWORD_HASH VARCHAR(255) NOT NULL,
    USER_TYPE VARCHAR(20) NOT NULL, -- 'ADMIN', 'STUDENT', 'TEACHER'
    REGISTRATION_DATE DATETIME NOT NULL
) ENGINE=InnoDB;

-- 2. ALT TIP TABLOLARI (SUB-TYPES)
CREATE TABLE TEACHER (
    TC_NO VARCHAR(11) PRIMARY KEY,
    ACADEMIC_TITLE VARCHAR(50) NULL, -- 'o' olduğu için NULL
    FOREIGN KEY (TC_NO) REFERENCES SYSTEM_USER(TC_NO) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE STUDENT (
    TC_NO VARCHAR(11) PRIMARY KEY,
    TOTAL_SCORE INT DEFAULT 0,
    GRADE_LEVEL VARCHAR(20) NULL, -- 'o' olduğu için NULL
    STD_NO VARCHAR(20) NOT NULL,
    FOREIGN KEY (TC_NO) REFERENCES SYSTEM_USER(TC_NO) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. KATEGORİ TABLOSU
CREATE TABLE CATEGORY (
    CATEGORY_ID INT AUTO_INCREMENT PRIMARY KEY,
    CATEGORY_NAME VARCHAR(100) NOT NULL,
    DESCRIPTION TEXT NULL
) ENGINE=InnoDB;

-- 4. QUIZ TABLOSU 
CREATE TABLE QUIZ (
    QUIZ_ID INT AUTO_INCREMENT PRIMARY KEY,
    TITLE VARCHAR(255) NOT NULL,
    DIFFICULTY_LEVEL INT NOT NULL,
    TIME_LIMIT INT NOT NULL,
    TEACHER_TC_NO VARCHAR(11) NOT NULL, 
    CATEGORY_ID INT NOT NULL,
    FOREIGN KEY (TEACHER_TC_NO) REFERENCES TEACHER(TC_NO),
    FOREIGN KEY (CATEGORY_ID) REFERENCES CATEGORY(CATEGORY_ID)
) ENGINE=InnoDB;

-- 5. SORU TABLOSU 
CREATE TABLE QUESTION (
    QUESTION_ID INT AUTO_INCREMENT PRIMARY KEY,
    QUIZ_ID INT NOT NULL, 
    QUESTION_TEXT TEXT NOT NULL,
    FOREIGN KEY (QUIZ_ID) REFERENCES QUIZ(QUIZ_ID) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. SEÇENEK TABLOSU
CREATE TABLE CHOICE (
    CHOICE_ID INT AUTO_INCREMENT PRIMARY KEY,
    QUESTION_ID INT NOT NULL,
    CHOICE_TEXT VARCHAR(255) NOT NULL,
    IS_CORRECT BOOLEAN NOT NULL DEFAULT 0,
    FOREIGN KEY (QUESTION_ID) REFERENCES QUESTION(QUESTION_ID) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. SONUÇ LOG TABLOSU 
CREATE TABLE RESULT_LOG (
    LOG_ID INT AUTO_INCREMENT PRIMARY KEY,
    USER_TC VARCHAR(11) NOT NULL,
    QUIZ_ID INT NOT NULL,
    SCORE INT NOT NULL,
    COMPLETED_AT DATETIME NOT NULL,
    FOREIGN KEY (USER_TC) REFERENCES SYSTEM_USER(TC_NO),
    FOREIGN KEY (QUIZ_ID) REFERENCES QUIZ(QUIZ_ID)
) ENGINE=InnoDB;

-- 8. KULLANICI CEVAPLARI (Tüm CASCADE kuralları baştan entegre edildi)
CREATE TABLE USER_ANSWER (
    ANSWER_ID INT AUTO_INCREMENT PRIMARY KEY,
    LOG_ID INT NOT NULL,
    QUESTION_ID INT NOT NULL,
    SELECTED_CHOICE_ID INT NULL, 
    RESPONSE_TIME INT NOT NULL,
    FOREIGN KEY (LOG_ID) REFERENCES RESULT_LOG(LOG_ID) ON DELETE CASCADE,
    FOREIGN KEY (QUESTION_ID) REFERENCES QUESTION(QUESTION_ID) ON DELETE CASCADE,
    FOREIGN KEY (SELECTED_CHOICE_ID) REFERENCES CHOICE(CHOICE_ID) ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO SYSTEM_USER (TC_NO, USERNAME, EMAIL, PASSWORD_HASH, USER_TYPE, REGISTRATION_DATE) 
VALUES ('11111111111', 'Admin_Hoca', 'admin@kbu.edu.tr', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'TEACHER', NOW());

INSERT INTO TEACHER (TC_NO, ACADEMIC_TITLE) 
VALUES ('11111111111', 'Prof. Dr.');

-- 7 Adet Kategori Eklenmesi
INSERT INTO CATEGORY (CATEGORY_ID, CATEGORY_NAME, DESCRIPTION) VALUES 
(1, 'Database Systems (CPE210)', 'Database concepts'),
(2, 'Internet Based Programming (CPE212)', 'Web programming concepts'),
(3, 'General Culture', 'General knowledge'),
(4, 'Physics', 'Fundamental physics principles and laws'),
(5, 'Mathematics', 'Calculus, linear algebra and discrete math'),
(6, 'C Programming', 'Low-level programming and memory management'),
(7, 'Python', 'High-level scripting and data science');

-- Her Kategori İçin 1 Adet Sınav (Quiz) Taslağı Eklenmesi
INSERT INTO QUIZ (QUIZ_ID, TITLE, DIFFICULTY_LEVEL, TIME_LIMIT, TEACHER_TC_NO, CATEGORY_ID) VALUES 
(1, 'Midterm Exam - Database Systems', 3, 10, '11111111111', 1),
(2, 'Final Exam - Web Programming', 4, 10, '11111111111', 2),
(3, 'General Culture Quiz', 1, 10, '11111111111', 3),
(4, 'Physics General Test', 2, 10, '11111111111', 4),
(5, 'Math Practice', 3, 10, '11111111111', 5),
(6, 'C Programming Entry', 3, 10, '11111111111', 6),
(7, 'Python Basics', 2, 10, '11111111111', 7);

-- İlk 3 Sınav İçin Toplam 15 Soru Eklenmesi
INSERT INTO QUESTION (QUESTION_ID, QUIZ_ID, QUESTION_TEXT) VALUES
(1, 1, 'Which SQL command is used to retrieve data from a database?'),
(2, 1, 'Which type of key uniquely identifies each record in a database table?'),
(3, 1, 'What does SQL stand for?'),
(4, 1, 'What is the most distinct advantage of Oracle over MySQL?'),
(5, 1, 'According to Oracle (Barker) standards, which line type in an ERD represents an ''optional'' relationship?'),
(6, 2, 'Which technology allows a web page to update data asynchronously without reloading the entire page?'),
(7, 2, 'Which HTML tag is used to create the largest heading?'),
(8, 2, 'What does CSS stand for?'),
(9, 2, 'Which symbol is used to define a variable in PHP?'),
(10, 2, 'What is the organization that validates and controls HTML standards?'),
(11, 3, 'Who is the best football player on planet Earth?'),
(12, 3, 'What is the universally accepted first step to fix any computer problem?'),
(13, 3, 'Which beverage is an engineering student''s primary fuel source?'),
(14, 3, 'What is the largest planet in our solar system?'),
(15, 3, 'Who painted the famous masterpiece "Mona Lisa"?');

-- Bu 15 Sorunun 60 Şıkkının Eklenmesi
INSERT INTO CHOICE (QUESTION_ID, CHOICE_TEXT, IS_CORRECT) VALUES
(1, 'SELECT', 1), (1, 'INSERT', 0), (1, 'UPDATE', 0), (1, 'DELETE', 0),
(2, 'Primary Key', 1), (2, 'Foreign Key', 0), (2, 'Candidate Key', 0), (2, 'Super Key', 0),
(3, 'Structured Query Language', 1), (3, 'Standard Question Language', 0), (3, 'System Query Logic', 0), (3, 'Simple Query Language', 0),
(4, 'Better handling of massive enterprise-scale databases', 1), (4, 'Being completely free and open-source', 0), (4, 'Easier to learn for beginners', 0), (4, 'Native integration with PHP', 0),
(5, 'Dashed line', 1), (5, 'Solid line', 0), (5, 'Dotted line', 0), (5, 'Double line', 0),
(6, 'AJAX', 1), (6, 'HTML', 0), (6, 'CSS', 0), (6, 'Bootstrap', 0),
(7, '<h1>', 1), (7, '<head>', 0), (7, '<h6>', 0), (7, '<title>', 0),
(8, 'Cascading Style Sheets', 1), (8, 'Computer Style Sheets', 0), (8, 'Creative Style System', 0), (8, 'Colorful Style Sheets', 0),
(9, '$', 1), (9, '@', 0), (9, '#', 0), (9, '%', 0),
(10, 'W3C (World Wide Web Consortium)', 1), (10, 'IEEE', 0), (10, 'ICANN', 0), (10, 'ISO', 0),
(11, 'Messi', 1), (11, 'Ronaldo', 0), (11, 'Kenan Karaman', 0), (11, 'Ismail Cipe', 0),
(12, 'Turn it off and on again', 1), (12, 'Hit the monitor', 0), (12, 'Cry silently', 0), (12, 'Delete System32', 0),
(13, 'Coffee', 1), (13, 'Water', 0), (13, 'Apple Juice', 0), (13, 'Green Tea', 0),
(14, 'Jupiter', 1), (14, 'Mars', 0), (14, 'Venus', 0), (14, 'Saturn', 0),
(15, 'Leonardo da Vinci', 1), (15, 'Pablo Picasso', 0), (15, 'Vincent van Gogh', 0), (15, 'Michelangelo', 0);