document.addEventListener("DOMContentLoaded", () => {

    // --- ROL SEÇİMİNE GÖRE KUTULARI GİZLE/GÖSTER ---
    const userTypeSelect = document.getElementById('userType');
    const studentNumberInput = document.getElementById('studentNumber');
    const academicTitleInput = document.getElementById('academicTitle');

    if (userTypeSelect) {
        userTypeSelect.addEventListener('change', function () {
            if (this.value === 'STUDENT') {
                studentNumberInput.style.display = 'block';
                academicTitleInput.style.display = 'none';
                academicTitleInput.value = '';
            } else if (this.value === 'TEACHER') {
                academicTitleInput.style.display = 'block';
                studentNumberInput.style.display = 'none';
                studentNumberInput.value = '';
            } else {
                studentNumberInput.style.display = 'none';
                academicTitleInput.style.display = 'none';
                studentNumberInput.value = '';
                academicTitleInput.value = '';
            }
        });
    }

    // Email formatını ve sağlayıcısını kontrol eden fonksiyon (Whitelist Mantığı)
    function validateEmail(email) {
        // Önce email'in genel yapısını (@ ve . var mı) regex ile kontrol et
        const basicRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!basicRe.test(email)) return false;

        // Kabul edilecek mail sağlayıcıları (Beyaz Liste)
        const allowedDomains = [
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

        const domain = email.split('@')[1].toLowerCase();
        return allowedDomains.includes(domain);
    }

    // --- LOGIN FORM KONTROLÜ ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const tcNo = document.getElementById('loginTcNo').value.trim();
            const password = document.getElementById('loginPassword').value.trim();
            const errorElement = document.getElementById('loginError');
            const isIntegerRegex = /^\d+$/;

            if (tcNo === '' || password === '') {
                errorElement.innerText = "Lütfen tüm alanları doldurun.";
                errorElement.style.display = "block";
                return;
            }

            if (!isIntegerRegex.test(tcNo) || tcNo.length !== 11) {
                errorElement.innerText = "TC Kimlik Numarası 11 haneli ve rakam olmalıdır!";
                errorElement.style.display = "block";
                return;
            }

            let loginData = new FormData();
            loginData.append('tcNo', tcNo);
            loginData.append('password', password);

            // Sayfanın http:// üzerinden açılıp açılmadığını kontrol et
            if (window.location.protocol === 'file:') {
                errorElement.innerText = "HATA: Sayfayı doğrudan açıyorsunuz! Lütfen tarayıcıdan http://localhost/Projeeeee/Projeeeee/login.html adresini kullanın.";
                errorElement.style.display = "block";
                return;
            }

            fetch('php/login.php', { method: 'POST', body: loginData })
                .then(r => {
                    if (!r.ok) throw new Error("HTTP " + r.status + " - " + r.statusText);
                    return r.json();
                })
                .then(data => {
                    if (data.status === 'success') {
                        localStorage.setItem("loggedUserTC", tcNo);
                        localStorage.setItem("loggedUsername", data.username);
                        localStorage.setItem("userType", data.user_type);
                        localStorage.setItem("studentNumber", data.student_number ?? '');
                        window.location.href = "home.html";
                    } else {
                        errorElement.innerText = data.message;
                        errorElement.style.display = "block";
                    }
                })
                .catch(err => {
                    errorElement.innerText = "Bağlantı hatası: " + err.message;
                    errorElement.style.display = "block";
                });
        });
    }

    // --- REGISTER FORM KONTROLÜ ---
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const userType = document.getElementById('userType').value;
            const tcNo = document.getElementById('tcNo').value.trim();
            const studentNumber = studentNumberInput ? studentNumberInput.value.trim() : '';
            const username = document.getElementById('username').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            const confirmPassword = document.getElementById('confirmPassword').value.trim();
            const title = academicTitleInput ? academicTitleInput.value.trim() : '';
            const errorElement = document.getElementById('registerError');
            const isIntegerRegex = /^\d+$/;

            // Boş alan kontrolü
            if (userType === '' || tcNo === '' || username === '' || email === '' || password === '') {
                errorElement.innerText = "Lütfen gerekli alanları doldurun.";
                errorElement.style.display = "block";
                return;
            }

            // TC Kimlik Kontrolü
            if (!isIntegerRegex.test(tcNo) || tcNo.length !== 11) {
                errorElement.innerText = "TC Kimlik Numarası 11 haneli olmalıdır!";
                errorElement.style.display = "block";
                return;
            }

            // Email Format ve Sağlayıcı Kontrolü
            if (!validateEmail(email)) {
                errorElement.innerText = "Sadece geçerli sağlayıcılar veya Karabük Üniversitesi uzantılı mailler kullanabilirsiniz!";
                errorElement.style.display = "block";
                return;
            }

            // --- ROL BAZLI DOMAIN KONTROLÜ ---
            const domain = email.split('@')[1].toLowerCase();

            if (userType === 'TEACHER' && domain === 'ogrenci.karabuk.edu.tr') {
                errorElement.innerText = "Akademisyenlerin öğrenci hesabı bulunamaz!";
                errorElement.style.display = "block";
                return;
            }

            if (userType === 'STUDENT' && domain === 'karabuk.edu.tr') {
                errorElement.innerText = "Öğrencilerin personel hesabı bulunamaz!";
                errorElement.style.display = "block";
                return;
            }

            // Öğrenci Numarası Kontrolü (10 Hane)
            if (userType === 'STUDENT') {
                if (!isIntegerRegex.test(studentNumber) || studentNumber.length !== 10) {
                    errorElement.innerText = "Öğrenci Numarası 10 haneli olmalıdır!";
                    errorElement.style.display = "block";
                    return;
                }
            }

            // Şifre eşleşme kontrolü
            if (password !== confirmPassword) {
                errorElement.innerText = "Şifreler uyuşmuyor!";
                errorElement.style.display = "block";
                return;
            }

            let regData = new FormData();
            regData.append('userType', userType);
            regData.append('tcNo', tcNo);
            regData.append('username', username);
            regData.append('email', email);
            regData.append('password', password);
            if (userType === 'STUDENT') regData.append('studentNumber', studentNumber);
            else if (userType === 'TEACHER') regData.append('academicTitle', title);

            fetch('php/register.php', { method: 'POST', body: regData })
                .then(r => r.json())
                .then(data => {
                    if (data.status === 'success') {
                        alert('Kayıt Başarılı!');
                        window.location.href = 'login.html';
                    } else {
                        errorElement.innerText = data.message;
                        errorElement.style.display = "block";
                    }
                });
        });
    }
});