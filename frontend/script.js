// Current language (default: English)
let currentLanguage = 'en';

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Check for saved language preference
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage && translations[savedLanguage]) {
        currentLanguage = savedLanguage;
        updateLanguageButtons();
    }
    
    // Apply translations
    applyTranslations(currentLanguage);
    
    // Set document language
    document.documentElement.lang = currentLanguage;
});

// Change language function
function changeLanguage(language) {
    if (translations[language]) {
        currentLanguage = language;
        applyTranslations(language);
        updateLanguageButtons();
        
        // Save language preference
        localStorage.setItem('preferredLanguage', language);
        
        // Update document language
        document.documentElement.lang = language;
    }
}

// Update language button states
function updateLanguageButtons() {
    const buttons = document.querySelectorAll('.lang-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase().includes(currentLanguage === 'en' ? 'english' : 
                                                   currentLanguage === 'fr' ? 'français' : 'español')) {
            btn.classList.add('active');
        }
    });
}

// Apply translations to the page
function applyTranslations(language) {
    const t = translations[language];
    
    // Update title
    document.getElementById('title').textContent = t.title;
    
    // Update welcome message
    document.getElementById('welcome').textContent = t.welcome;
    
    // Update question titles
    document.getElementById('question1-title').textContent = t.question1_title;
    document.getElementById('question2-title').textContent = t.question2_title;
    document.getElementById('question3-title').textContent = t.question3_title;
    
    // Update placeholders
    document.getElementById('question1').placeholder = t.question1_placeholder;
    document.getElementById('question2').placeholder = t.question2_placeholder;
    document.getElementById('question3').placeholder = t.question3_placeholder;
    
    // Update submit button
    document.getElementById('submit-btn').textContent = t.submit_btn;
    
    // Update footer
    document.getElementById('footer-text').textContent = t.footer_text;
}

// Submit reflection function
function submitReflection() {
    const question1 = document.getElementById('question1').value.trim();
    const question2 = document.getElementById('question2').value.trim();
    const question3 = document.getElementById('question3').value.trim();
    
    // Validate that all fields are filled
    if (!question1 || !question2 || !question3) {
        showMessage(translations[currentLanguage].validation_error, 'error');
        return;
    }
    
    // Create reflection object
    const reflection = {
        language: currentLanguage,
        timestamp: new Date().toISOString(),
        responses: {
            question1: question1,
            question2: question2,
            question3: question3
        }
    };
    
    // Simulate submission (in a real application, this would send to a server)
    console.log('Reflection submitted:', reflection);
    
    // Show success message
    showMessage(translations[currentLanguage].submit_success, 'success');
    
    // Clear form
    clearForm();
    
    // Store in localStorage for demo purposes
    const reflections = JSON.parse(localStorage.getItem('reflections') || '[]');
    reflections.push(reflection);
    localStorage.setItem('reflections', JSON.stringify(reflections));
}

// Clear form function
function clearForm() {
    document.getElementById('question1').value = '';
    document.getElementById('question2').value = '';
    document.getElementById('question3').value = '';
}

// Show message function
function showMessage(message, type) {
    // Remove existing message
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Style the message
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;
    
    // Set background color based on type
    if (type === 'success') {
        messageDiv.style.backgroundColor = '#27ae60';
    } else if (type === 'error') {
        messageDiv.style.backgroundColor = '#e74c3c';
    }
    
    // Add to page
    document.body.appendChild(messageDiv);
    
    // Remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Auto-save functionality
let autoSaveTimeout;
function autoSave() {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
        const question1 = document.getElementById('question1').value;
        const question2 = document.getElementById('question2').value;
        const question3 = document.getElementById('question3').value;
        
        if (question1 || question2 || question3) {
            const draft = {
                question1,
                question2,
                question3,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('reflectionDraft', JSON.stringify(draft));
        }
    }, 1000);
}

// Load draft on page load
document.addEventListener('DOMContentLoaded', function() {
    const draft = localStorage.getItem('reflectionDraft');
    if (draft) {
        const draftData = JSON.parse(draft);
        document.getElementById('question1').value = draftData.question1 || '';
        document.getElementById('question2').value = draftData.question2 || '';
        document.getElementById('question3').value = draftData.question3 || '';
    }
    
    // Add auto-save listeners
    document.getElementById('question1').addEventListener('input', autoSave);
    document.getElementById('question2').addEventListener('input', autoSave);
    document.getElementById('question3').addEventListener('input', autoSave);
});

// Clear draft after successful submission
function clearDraft() {
    localStorage.removeItem('reflectionDraft');
} 