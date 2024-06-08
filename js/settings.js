document.addEventListener('DOMContentLoaded', () => {
    const settingsForm = document.getElementById('settings-form');

    if (settingsForm) {
        settingsForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const defaultGenre = document.getElementById('default-genre').value;
            const theme = document.getElementById('theme').value;
            const language = document.getElementById('language').value;
            const country = document.getElementById('country').value;
            const state = document.getElementById('state').value;
            const city = document.getElementById('city').value;
            
            // Get the userId from the localStorage (Assuming it's stored there upon login)
            const userId = localStorage.getItem('userId');
            if (!userId) {
                alert('User not logged in');
                return;
            }

            try {
                const response = await fetch('http://localhost:5500/api/auth/update-settings', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}` // Include the JWT token
                    },
                    body: JSON.stringify({
                        userId,
                        defaultGenre,
                        theme,
                        language,
                        country,
                        state,
                        city
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    alert('Settings updated successfully');
                    // Redirect to the homepage after updating settings
                    window.location.href = './index.html';
                } else {
                    alert(data.message || 'Failed to update settings');
                }
            } catch (error) {
                console.error('Error updating settings:', error);
                alert('An error occurred. Please try again.');
            }
        });
    }
});
