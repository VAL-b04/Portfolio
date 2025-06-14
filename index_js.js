function handleLogin() {
    const password = document.getElementById('passwordInput').value;
    if (password.length > 0) {
        window.location.href = 'bureau.html';
    }
}

document.getElementById('passwordInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        handleLogin();
    }
});

window.onload = function() {
    document.getElementById('passwordInput').focus();
};
