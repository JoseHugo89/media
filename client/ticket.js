document.addEventListener('DOMContentLoaded', async function() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const mediaId = urlParams.get('id');
  
      if (mediaId) {
        const response = await fetch(`/dd/${mediaId}`);
        const media = await response.json();
  
        document.getElementById('qrCode').src = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(`http://localhost:3000/dd.html?id=${media._id}`)}`;
        document.getElementById('fullName').textContent = media.fullName;
        document.getElementById('emailAddress').textContent = media.emailAddress;
        document.getElementById('phoneNumber').textContent = media.phoneNumber;
        document.getElementById('type').textContent = media.type;
        document.getElementById('instagramUsername').textContent = media.instagramUsername;
        document.getElementById('status').textContent = media.status;
        document.getElementById('day').textContent = media.day;
        document.getElementById('time').textContent = media.time;
        document.getElementById('participationNumber').textContent = media.participationNumber;
      } else {
        console.error('No media ID provided in the URL.');
      }
    } catch (error) {
      console.error('Error fetching media data:', error);
    }
  });
  