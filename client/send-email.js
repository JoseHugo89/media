document.getElementById('sendEmailForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const participationNumber = document.getElementById('participationNumber').value;
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const type = document.getElementById('type').value;
    const instagram = document.getElementById('instagram').value;
    const status = document.getElementById('status').value;
    const day = document.getElementById('day').value;
    const time = document.getElementById('time').value;

    const data = {
        email,
        participationNumber,
        name,
        phone,
        type,
        instagram,
        status,
        day,
        time
    };

    try {
        const response = await fetch('/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.text();
        if (response.ok) {
            document.getElementById('responseMessage').textContent = 'Email sent successfully!';
            document.getElementById('responseMessage').style.color = 'green';
        } else {
            throw new Error(result);
        }
    } catch (error) {
        document.getElementById('responseMessage').textContent = 'Failed to send email.';
        document.getElementById('responseMessage').style.color = 'red';
        console.error('Error:', error);
    }
});
