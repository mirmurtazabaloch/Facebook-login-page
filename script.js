// Login Validation and Handling
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const togglePassword = document.getElementById('togglePassword');
const loginBtn = document.getElementById('loginBtn');
const btnText = document.getElementById('btnText');
const btnLoader = document.getElementById('btnLoader');
const captchaGroup = document.getElementById('captchaGroup');
const twoFAGroup = document.getElementById('twoFAGroup');
const createBtn = document.getElementById('createBtn');
const refreshCaptcha = document.getElementById('refreshCaptcha');

// Security state
let captchaRequired = false;
let captchaAnswer = '';
let twoFARequired = false;
let loginAttempts = 0;
const MAX_LOGIN_ATTEMPTS = 3;

// Generate CAPTCHA
function generateCaptcha() {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    captchaAnswer = '';
    for (let i = 0; i < 5; i++) {
        captchaAnswer += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    displayCaptcha();
}

function displayCaptcha() {
    const captchaText = document.getElementById('captchaText');
    captchaText.textContent = captchaAnswer;
    // Add some styling to make it look more like a CAPTCHA
    captchaText.style.fontSize = '28px';
    captchaText.style.fontWeight = 'bold';
    captchaText.style.letterSpacing = '4px';
}

// Password visibility toggle
togglePassword.addEventListener('click', (e) => {
    e.preventDefault();
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePassword.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
});

// Refresh CAPTCHA
refreshCaptcha.addEventListener('click', (e) => {
    e.preventDefault();
    generateCaptcha();
});

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9\-\+\(\)\s]{10,}$/;
    return emailRegex.test(email) || phoneRegex.test(email);
}

// Password validation
function isValidPassword(password) {
    return password.length >= 6;
}

// Show error message
function showError(inputElement, message) {
    inputElement.classList.add('error');
    const errorElement = inputElement.parentElement.querySelector('.error-message');
    if (errorElement) {
        errorElement.textContent = message;
    }
}

// Clear error message
function clearError(inputElement) {
    inputElement.classList.remove('error');
    const errorElement = inputElement.parentElement.querySelector('.error-message');
    if (errorElement) {
        errorElement.textContent = '';
    }
}

// Real-time validation
emailInput.addEventListener('blur', () => {
    if (emailInput.value && !isValidEmail(emailInput.value)) {
        showError(emailInput, 'Please enter a valid email or phone number');
    } else {
        clearError(emailInput);
    }
});

passwordInput.addEventListener('blur', () => {
    if (passwordInput.value && !isValidPassword(passwordInput.value)) {
        showError(passwordInput, 'Password must be at least 6 characters');
    } else {
        clearError(passwordInput);
    }
});

// Form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear previous errors
    clearError(emailInput);
    clearError(passwordInput);

    // Validate email
    const email = emailInput.value.trim();
    if (!email) {
        showError(emailInput, 'Email or phone number is required');
        emailInput.focus();
        return;
    }

    if (!isValidEmail(email)) {
        showError(emailInput, 'Please enter a valid email or phone number');
        emailInput.focus();
        return;
    }

    // Validate password
    const password = passwordInput.value;
    if (!password) {
        showError(passwordInput, 'Password is required');
        passwordInput.focus();
        return;
    }

    if (!isValidPassword(password)) {
        showError(passwordInput, 'Password must be at least 6 characters');
        passwordInput.focus();
        return;
    }

    // Check if CAPTCHA is required and validate
    if (captchaRequired) {
        const captchaInput = document.getElementById('captcha');
        if (!captchaInput.value) {
            document.getElementById('captchaError').textContent = 'Please complete the CAPTCHA';
            document.getElementById('captchaError').style.display = 'block';
            return;
        }
        if (captchaInput.value !== captchaAnswer) {
            document.getElementById('captchaError').textContent = 'CAPTCHA is incorrect. Try again.';
            document.getElementById('captchaError').style.display = 'block';
            generateCaptcha();
            captchaInput.value = '';
            return;
        }
        document.getElementById('captchaError').style.display = 'none';
    }

    // Check if 2FA is required
    if (twoFARequired) {
        const twoFACode = document.getElementById('twoFACode').value;
        if (!twoFACode || twoFACode.length !== 6) {
            document.getElementById('twoFAError').textContent = 'Please enter a valid 6-digit code';
            document.getElementById('twoFAError').style.display = 'block';
            return;
        }
        document.getElementById('twoFAError').style.display = 'none';
    }

    // Show loading state
    loginBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'block';

    // Simulate API call
    await simulateLoginAttempt(email, password);
});

// Simulate login attempt
async function simulateLoginAttempt(email, password) {
    try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        loginAttempts++;

        // Simulate different scenarios
        const random = Math.random();

        if (loginAttempts === 1 && random < 0.3) {
            // First attempt might trigger CAPTCHA (30% chance)
            captchaRequired = true;
            captchaGroup.style.display = 'block';
            generateCaptcha();
            showNotification('Verification required. Please complete the CAPTCHA.', 'warning');
        } else if (loginAttempts >= 2 && random < 0.4 && !twoFARequired) {
            // After CAPTCHA, might require 2FA (40% chance)
            twoFARequired = true;
            twoFAGroup.style.display = 'block';
            showNotification('Two-factor authentication required. Check your phone.', 'info');
        } else if (email && password) {
            // Successful login
            showSuccessModal();
            setTimeout(() => {
                // Simulate redirect
                alert('Redirecting to Facebook...');
                // In real scenario: window.location.href = 'https://www.facebook.com';
                resetForm();
            }, 2000);
        }
    } catch (error) {
        showErrorModal('Login Failed', error.message);
    } finally {
        // Reset button state
        loginBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
}

// Show notification (temporary)
function showNotification(message, type = 'info') {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'warning' ? '#ffc107' : '#17a2b8'};
        color: ${type === 'warning' ? '#000' : '#fff'};
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 2000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Show success modal
function showSuccessModal() {
    const modal = document.getElementById('successModal');
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.style.opacity = '1';
    }, 10);
}

// Show error modal
function showErrorModal(title, message) {
    document.getElementById('errorTitle').textContent = title;
    document.getElementById('errorMessage').textContent = message;
    document.getElementById('errorModal').style.display = 'flex';
}

// Close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';
}

// Reset form
function resetForm() {
    loginForm.reset();
    emailInput.focus();
    captchaGroup.style.display = 'none';
    twoFAGroup.style.display = 'none';
    captchaRequired = false;
    twoFARequired = false;
    loginAttempts = 0;
    passwordInput.setAttribute('type', 'password');
}

// Create account button
createBtn.addEventListener('click', () => {
    alert('Redirecting to Facebook account creation...');
    // In real scenario: window.location.href = 'https://www.facebook.com/register';
});

// Forgot password
document.querySelector('.forgot-password').addEventListener('click', (e) => {
    e.preventDefault();
    alert('Redirecting to Facebook password reset...');
    // In real scenario: window.location.href = 'https://www.facebook.com/login/identify/';
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// Password strength indicator
function checkPasswordStrength(password) {
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
        return 'strong';
    } else if (password.length >= 6) {
        return 'medium';
    }
    return 'weak';
}

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        loginForm.dispatchEvent(new Event('submit'));
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    emailInput.focus();
    console.log('Facebook Security Login Page Loaded');
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
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
            transform: translateX(400px);
            opacity: 0;
        }
    }

    .modal {
        animation: fadeIn 0.3s ease;
    }

    .modal-content {
        animation: slideUp 0.3s ease;
    }
`;
document.head.appendChild(style);
