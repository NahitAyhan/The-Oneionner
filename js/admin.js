document.addEventListener("DOMContentLoaded", () => {
    // Sayfa açıldığında mevcut soruları listelemek için.
    loadExistingQuestions();

    // Soru eklemek için. (AJAX)
    const addForm = document.getElementById('addQuestionForm');
    if(addForm) {
        addForm.onsubmit = function(e) {
            e.preventDefault();
            let formData = new FormData(this);
            
            fetch('php/add_question.php', { method: 'POST', body: formData })
            .then(r => r.json())
            .then(data => {
                alert(data.message);
                if(data.status === "success") {
                    addForm.reset(); // Formu temizlek için.
                    loadExistingQuestions(); // Sayfayı yenilemeden listeyi güncellemek için.
                }
            })
            .catch(err => console.error("Ekleme Hatası:", err));
        };
    }
});

// HTML özel karakterlerini zararsız hale getiren (escape) fonksiyon
function escapeHTML(str) {
    if (!str) return "";
    return str.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Soruları listeleme fonksiyonu
function loadExistingQuestions() {
    const container = document.getElementById('questionListContainer');
    
    fetch('php/get_admin_questions.php')
    .then(r => r.json())
    .then(data => {
        if (data.length === 0) {
            container.innerHTML = "<p style='font-size: 13px; opacity: 0.7;'>Henüz hiç soru eklenmemiş.</p>";
            return;
        }

        container.innerHTML = ""; 
        
        data.forEach(q => {
            const qDiv = document.createElement('div');
            qDiv.style.background = "rgba(255,255,255,0.05)";
            qDiv.style.padding = "10px";
            qDiv.style.marginBottom = "10px";
            qDiv.style.borderRadius = "8px";
            
            // Soruyu escape et
            let safeQuestionText = escapeHTML(q.QUESTION_TEXT);

            let choicesViewHtml = '<ul style="list-style:none; padding-left:0; margin-top:8px; margin-bottom:10px;">';
            let choicesEditHtml = '<div style="margin-top:10px; margin-bottom:10px;">';
            
            q.CHOICES.forEach(c => {
                let isCorrectColor = c.IS_CORRECT ? '#27ae60' : 'rgba(255,255,255,0.6)';
                let icon = c.IS_CORRECT ? '✅' : '⚪';
                
                // Şıkları escape et
                let safeChoiceText = escapeHTML(c.CHOICE_TEXT);
                
                choicesViewHtml += `<li style="font-size:13px; color:${isCorrectColor}; margin-bottom:4px;">${icon} ${safeChoiceText}</li>`;
                
                choicesEditHtml += `
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                        <span style="font-size:12px;">${icon}</span>
                        <input type="text" class="choice-input" data-choice-id="${c.CHOICE_ID}" value="${safeChoiceText}" 
                               style="flex:1; padding: 6px; border-radius: 4px; border: 1px solid #ccc; color: #333; ${c.IS_CORRECT ? 'border-left: 4px solid #27ae60;' : ''}">
                    </div>
                `;
            });
            
            choicesViewHtml += '</ul>';
            choicesEditHtml += '</div>';

            qDiv.innerHTML = `
                <div id="viewMode_${q.QUESTION_ID}">
                    <p style="margin: 0; font-size: 14px;"><strong>Soru:</strong> ${safeQuestionText}</p>
                    ${choicesViewHtml}
                    <div style="margin-top:10px;">
                        <button onclick="enableEdit(${q.QUESTION_ID})" style="background: #0984e3; padding: 5px 10px; font-size: 12px; margin-right: 5px; border:none; color:white; border-radius:4px; cursor:pointer;">✏️ Düzenle</button>
                        <button onclick="deleteQuestion(${q.QUESTION_ID})" style="background: #d63031; padding: 5px 10px; font-size: 12px; border:none; color:white; border-radius:4px; cursor:pointer;">🗑️ Sil</button>
                    </div>
                </div>
                
                <div id="editMode_${q.QUESTION_ID}" style="display:none;">
                    <p style="margin: 0 0 5px 0; font-size: 12px; color:#f39c12;">Ana Soruyu Düzenle:</p>
                    <input type="text" id="input_${q.QUESTION_ID}" value="${safeQuestionText}" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #ccc; color: #333; font-weight:bold;">
                    
                    <p style="margin: 10px 0 5px 0; font-size: 12px; color:#f39c12;">Şıkları Düzenle:</p>
                    ${choicesEditHtml}
                    
                    <button onclick="saveQuestion(${q.QUESTION_ID})" style="background: #27ae60; padding: 5px 10px; font-size: 12px; margin-right: 5px; border:none; color:white; border-radius:4px; cursor:pointer;">💾 Kaydet</button>
                    <button onclick="cancelEdit(${q.QUESTION_ID})" style="background: #7f8c8d; padding: 5px 10px; font-size: 12px; border:none; color:white; border-radius:4px; cursor:pointer;">❌ İptal</button>
                </div>
            `;
            container.appendChild(qDiv);
        });
    })
    .catch(err => {
        container.innerHTML = "<p style='color:red;'>Sorular yüklenemedi!</p>";
    });
}

// Düzenleme modunu açıp kapatmak için.
function enableEdit(id) {
    document.getElementById(`viewMode_${id}`).style.display = 'none';
    document.getElementById(`editMode_${id}`).style.display = 'block';
}

function cancelEdit(id) {
    document.getElementById(`viewMode_${id}`).style.display = 'block';
    document.getElementById(`editMode_${id}`).style.display = 'none';
}

// Soru güncellemek için.(AJAX)
function saveQuestion(id) {
    let newText = document.getElementById(`input_${id}`).value.trim();
    if(!newText) {
        alert("Soru metni boş bırakılamaz!");
        return;
    }

    let fd = new FormData();
    fd.append('question_id', id);
    fd.append('question_text', newText);

    // Edit modundaki şık inputlarını data-choice-id üzerinden yakalıyoruz
    let choiceInputs = document.querySelectorAll(`#editMode_${id} .choice-input`);
    let allChoicesFilled = true;
    
    choiceInputs.forEach(input => {
        let cid = input.getAttribute('data-choice-id');
        let cText = input.value.trim();
        
        if(!cText) {
            allChoicesFilled = false;
        }
        
        // PHP'nin post array alabilmesi için name yapısını 'choices[CHOICE_ID]' formatında yolluyoruz
        fd.append(`choices[${cid}]`, cText);
    });

    if(!allChoicesFilled) {
        alert("Şıklardan hiçbiri boş bırakılamaz!");
        return;
    }

    fetch('php/update_question.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
        if(data.status === "success") {
            // Hem soru hem şıklar değiştiği için listeyi baştan yükletmek en temizidir
            loadExistingQuestions(); 
        } else {
            alert(data.message);
        }
    })
    .catch(err => console.error("Güncelleme Hatası:", err));
}

// Soru silmek için.(AJAX)
function deleteQuestion(id) {
    if(!confirm("Bu soruyu tamamen silmek istediğinize emin misiniz?")) return;

    let fd = new FormData();
    fd.append('question_id', id);

    fetch('php/delete_question.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
        alert(data.message);
        loadExistingQuestions(); // Sayfayı yenilemeden listeyi güncellemek için.
    });
}