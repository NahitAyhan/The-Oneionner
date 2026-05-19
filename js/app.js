let quizData = null;
let currentQuestionIndex = 0;
let score = 0;
let questionStartTime = 0;
let timerInterval = null; 
let timeLeft = 0; // Başlangıçta 0, PHP'den gelecek

document.addEventListener("DOMContentLoaded", () => {
    const selectedCat = localStorage.getItem("selectedCategoryId") || 1;
    const questionElement = document.getElementById("question");

    fetch(`php/get_questions.php?category_id=${selectedCat}`)
        .then(r => r.json())
        .then(data => {
            if (data.questions && data.questions.length > 0) {
                quizData = data; 
                loadQuestion();
            } else {
                questionElement.innerText = "Soru bulunamadı!";
            }
        })
        .catch(err => {
            console.error("Hata:", err);
            questionElement.innerText = "Veritabanı bağlantı hatası!";
        });
});

function startTimer() {
    clearInterval(timerInterval);
    // YENİ DOKUNUŞ: Süreyi artık veritabanından alıyoruz!
    timeLeft = quizData.time_limit; 
    document.getElementById("time").innerText = timeLeft;

    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById("time").innerText = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert("Süre doldu! Sonraki soruya geçiliyor.");
            nextQuestion();
        }
    }, 1000);
}

function loadQuestion() {
    if (currentQuestionIndex >= quizData.questions.length) {
        clearInterval(timerInterval);
        finishQuiz();
        return;
    }

    const q = quizData.questions[currentQuestionIndex];
    document.getElementById("question").innerText = q.text;
    const container = document.getElementById("options-container");
    container.innerHTML = "";
    document.getElementById("nextBtn").style.display = "none";
    
    const progress = ((currentQuestionIndex) / quizData.questions.length) * 100;
    const progressBar = document.getElementById("progressBar");
    if(progressBar) progressBar.style.width = progress + "%";

    questionStartTime = Date.now();
    startTimer();

    // Şıkları karıştır
    let shuffledChoices = [...q.choices].sort(() => Math.random() - 0.5);

    shuffledChoices.forEach((choice) => {
        const btn = document.createElement("button");
        btn.className = "option";
        btn.innerText = choice.text;
        btn.onclick = () => {
            clearInterval(timerInterval); 
            const btns = container.getElementsByTagName("button");
            for (let b of btns) b.disabled = true;

            if (choice.is_correct == 1 || choice.is_correct == true || choice.is_correct == "1") {
                btn.classList.add("correct");
                score += 10;
            } else {
                btn.classList.add("wrong");
                const correctIdx = shuffledChoices.findIndex(c => c.is_correct == 1 || c.is_correct == true || c.is_correct == "1");
                if(correctIdx !== -1) btns[correctIdx].classList.add("correct");
            }
            document.getElementById("nextBtn").style.display = "block";
        };
        container.appendChild(btn);
    });
}

function nextQuestion() {
    currentQuestionIndex++;
    loadQuestion();
}

function finishQuiz() {
    const finalScore = score;
    const userTC = localStorage.getItem("loggedUserTC");

    let formData = new FormData();
    formData.append('tcNo', userTC);
    formData.append('score', finalScore);

    fetch('php/save_score.php', {
        method: 'POST',
        body: formData
    })
    .then(() => {
        localStorage.setItem("quizScore", finalScore);
        window.location.href = "result.html";
    })
    .catch(() => {
        localStorage.setItem("quizScore", finalScore);
        window.location.href = "result.html";
    });
}