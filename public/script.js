document.addEventListener('DOMContentLoaded', function () {
    const uploadButton = document.getElementById('uploadButton');
    const videoFileInput = document.getElementById('videoFile');
    const gallery = document.getElementById('gallery');
    const videoModal = document.getElementById('videoModal');
    const modalVideo = document.getElementById('modalVideo');
    const modalVideoSource = document.getElementById('modalVideoSource');
    const closeModal = document.querySelector('.close');
  
    uploadButton.addEventListener('click', () => {
      videoFileInput.click();
    });
  
    videoFileInput.addEventListener('change', (event) => {
      const files = event.target.files;
      for (const file of files) {
        const url = URL.createObjectURL(file);
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        const videoThumbnail = `
          <img src="thumbnail.jpg" alt="Video Thumbnail"> <!-- Replace with actual thumbnail -->
          <video>
            <source src="${url}" type="video/mp4">
            Your browser does not support the video tag.
          </video>`;
        galleryItem.innerHTML = videoThumbnail;
        galleryItem.addEventListener('click', () => {
          modalVideoSource.src = url;
          modalVideo.load();
          videoModal.style.display = 'block';
        });
        gallery.appendChild(galleryItem);
      }
    });
  
    closeModal.addEventListener('click', () => {
      videoModal.style.display = 'none';
      modalVideo.pause();
    });
  
    window.addEventListener('click', (event) => {
      if (event.target === videoModal) {
        videoModal.style.display = 'none';
        modalVideo.pause();
      }
    });
  });
  