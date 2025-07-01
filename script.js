// script.js

// Supabase configuration
const supabaseUrl = 'https://qxluetvkqxillhqsbubl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4bHVldHZrcXhpbGxocXNidWJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5MzIwNTMsImV4cCI6MjA0OTUwNjEwM30.11cD0yE0aJW1OIx0kB4EaWtCvg5nUkj-0QuTVk-C7zg';

const SupabaseLoad = supabase.createClient(supabaseUrl, supabaseAnonKey);

document.addEventListener('DOMContentLoaded', () => {
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const updateButton = document.getElementById('update-password-btn');
    const messageDiv = document.getElementById('message');
    const passwordForm = document.getElementById('password-form');
    const loadingMessage = document.getElementById('loading-message');

    // Function to display messages to the user
    function showMessage(text, isError) {
        messageDiv.textContent = text;
        messageDiv.className = isError ? 'error-message' : 'success-message';
    }

    // Handle Supabase recovery code from query param
    const queryParams = new URLSearchParams(window.location.search);
    const code = queryParams.get('code');
    const emailParam = queryParams.get('email');
    const email = emailParam ? decodeURIComponent(emailParam) : null;

    if (code && email) {
        SupabaseLoad.auth.verifyOtp({
            type: 'recovery',
            token: code,
            email: email
        }).then(({ data, error }) => {
            loadingMessage.style.display = 'none'; // Hide loading message after verification attempt
            if (error) {
                console.error('Error verifying recovery code:', error);
                showMessage('Invalid or expired reset link.', true);
            } else {
                console.log('Session set via recovery code:', data);
                SupabaseLoad.auth.setSession(data.session); // Set session if not automatically done
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        });
    } else {
        loadingMessage.style.display = 'none';
        showMessage('Missing code or email in the reset link.', true);
    }

    // Handle form submission
    if (updateButton) {
        updateButton.addEventListener('click', async (e) => {
            e.preventDefault();

            const newPassword = newPasswordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            if (newPassword.length < 6) {
                showMessage('Password must be at least 6 characters long.', true);
                return;
            }

            if (newPassword !== confirmPassword) {
                showMessage('Passwords do not match.', true);
                return;
            }

            // Show loading message
            loadingMessage.style.display = 'block';
            updateButton.disabled = true;

            try {
                const { data, error } = await SupabaseLoad.auth.updateUser({ password: newPassword });

                if (error) {
                    console.error('Password update error:', error);
                    showMessage(`Password update failed: ${error.message}`, true);
                } else {
                    console.log('Password updated successfully:', data);
                    showMessage('Your password has been updated successfully! You can now close this page.', false);
                }
            } catch (err) {
                console.error('An unexpected error occurred:', err);
                showMessage('An unexpected error occurred. Please try again.', true);
            } finally {
                // Hide loading message and enable button
                loadingMessage.style.display = 'none';
                updateButton.disabled = false;
            }
        });
    }
});
