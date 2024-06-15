document.getElementById('uploadButton').addEventListener('click', () => {
    document.getElementById('videoFile').click();
  });
  
  document.getElementById('videoFile').addEventListener('change', async (event) => {
    const videoFile = event.target.files[0];
    if (!videoFile) {
      alert('Please select a video file.');
      return;
    }
  
    const formData = new FormData();
    formData.append('video', videoFile);
  
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
  
    const data = await response.json();
    const videoPath = data.videoPath;
  
    const gallery = document.getElementById('gallery');
    const videoItem = document.createElement('div');
    videoItem.className = 'video-item';
    videoItem.innerHTML = `
      <video controls>
        <source src="${videoPath}" type="video/mp4">
        Your browser does not support the video tag.
      </video>
    `;
    videoItem.addEventListener('click', () => openModal(videoPath));
    gallery.appendChild(videoItem);
  });
  
  function openModal(videoPath) {
    const modal = document.getElementById('videoModal');
    const modalVideo = document.getElementById('modalVideo');
    const modalVideoSource = document.getElementById('modalVideoSource');
    modal.style.display = 'block';
    modalVideoSource.src = videoPath;
    modalVideo.load();
    modalVideo.play();
  
    const span = document.getIt seems the message got cut off. Let me complete it for you. The provided script allows users to open a modal and play a video upon clicking a thumbnail. Here's the rest of the script, including the event listener for closing the modal:
  
  ### Complete `renderer.js`
  
  ```javascript
  document.getElementById('uploadButton').addEventListener('click', () => {
    document.getElementById('videoFile').click();
  });
  
  document.getElementById('videoFile').addEventListener('change', async (event) => {
    const videoFile = event.target.files[0];
    if (!videoFile) {
      alert('Please select a video file.');
      return;
    }
  
    const formData = new FormData();
    formData.append('video', videoFile);
  
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
  
    const data = await response.json();
    const videoPath = data.videoPath;
  
    const gallery = document.getElementById('gallery');
    const videoItem = document.createElement('div');
    videoItem.className = 'video-item';
    videoItem.innerHTML = `
      <video controls>
        <source src="${videoPath}" type="video/mp4">
        Your browser does not support the video tag.
      </video>
    `;
    videoItem.addEventListener('click', () => openModal(videoPath));
    gallery.appendChild(videoItem);
  });
  
  function openModal(videoPath) {
    const modal = document.getElementById('videoModal');
    const modalVideo = document.getElementById('modalVideo');
    const modalVideoSource = document.getElementById('modalVideoSource');
    modal.style.display = 'block';
    modalVideoSource.src = videoPath;
    modalVideo.load();
    modalVideo.play();
  
    const span = document.getElementsByClassName('close')[0];
    span.onclick = () => {
      modal.style.display = 'none';
      modalVideo.pause();
    };
  
    window.onclick = (event) => {
      if (event.target === modal) {
        modal.style.display = 'none';
        modalVideo.pause();
      }
    };
  }
  