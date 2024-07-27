document.addEventListener('DOMContentLoaded', async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const mediaId = urlParams.get('id');

    if (mediaId) {
        try {
            const response = await fetch(`/media/${mediaId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const media = await response.json();
            displayMediaDetails(media);
        } catch (error) {
            console.error('Error:', error);
            const detailsDiv = document.getElementById('mediaDetails');
            detailsDiv.textContent = 'Error loading media details. Please try again later.';
        }
    } else {
        console.error('No media ID provided');
        const detailsDiv = document.getElementById('mediaDetails');
        detailsDiv.textContent = 'No media ID provided. Unable to load details.';
    }
});

function displayMediaDetails(media) {
    const detailsDiv = document.getElementById('mediaDetails');
    detailsDiv.className = 'media-details-container';

    // Contenedor de los datos
    const dataContainer = document.createElement('div');
    dataContainer.className = 'data-container';

    // Número de participación
    const participationNumber = document.createElement('div');
    participationNumber.className = 'participation-number';
    participationNumber.textContent = `Participation Number: ${media.participationNumber || 'N/A'}`;

    // Nombre
    const name = document.createElement('h3');
    name.textContent = media.fullName;

    dataContainer.appendChild(participationNumber);
    dataContainer.appendChild(name);

    // Resto de los datos
    const dataElements = [
        { label: 'Type', value: media.type },
        { label: 'Day', value: media.day },
        { label: 'Time', value: media.time },
    ];

    dataElements.forEach(el => {
        const p = document.createElement('p');
        p.innerHTML = `<strong>${el.label}:</strong> ${el.value}`;
        dataContainer.appendChild(p);
    });

    // Contenedor para QR Code y Logo
    const qrAndLogoContainer = document.createElement('div');
    qrAndLogoContainer.className = 'qr-and-logo-container';

    // QR Code
    const qrCodeContainer = document.createElement('div');
    qrCodeContainer.className = 'qr-code-container';
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(`http://localhost:3000/mediaDetail.html?id=${media._id}`)}`;
    const qrCodeImg = document.createElement('img');
    qrCodeImg.src = qrCodeUrl;
    qrCodeImg.alt = 'QR Code';
    qrCodeImg.className = 'qr-img';
    qrCodeContainer.appendChild(qrCodeImg);

    // Logo
    const logoContainer = document.createElement('div');
    logoContainer.className = 'logo-container';
    const logoImg = document.createElement('img');
    logoImg.src = 'https://runway7.fashion/wp-content/uploads/2024/07/R7FEMAIL.png';
    logoImg.alt = 'Runway 7 Fashion Logo';
    logoImg.className = 'logo-img';
    logoContainer.appendChild(logoImg);

    // Añadir QR Code y Logo a su contenedor
    qrAndLogoContainer.appendChild(qrCodeContainer);
    qrAndLogoContainer.appendChild(logoContainer);

    dataContainer.appendChild(qrAndLogoContainer);

    // Botón de registro
    const registerButton = document.createElement('button');
    registerButton.textContent = 'REGISTER';
    registerButton.className = 'register-button';
    registerButton.addEventListener('click', async () => {
        try {
            console.log(`Sending PUT request to /media/${media._id}/register`);
            const response = await fetch(`/media/${media._id}/register`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                console.log('Register status updated successfully');
                registerButton.textContent = 'REGISTERED';
                registerButton.style.backgroundColor = 'green';
                registerButton.style.color = 'white';
            } else {
                console.error('Error updating register status');
            }
        } catch (error) {
            console.error('Error updating register status:', error);
        }
    });

    dataContainer.appendChild(registerButton);
    detailsDiv.appendChild(dataContainer);
}
