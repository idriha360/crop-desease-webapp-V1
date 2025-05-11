// Grab DOM elements
const uploadBox = document.querySelector('.upload-box');
const chooseFileBtn = document.getElementById('choose-file-btn');

// Create a hidden file input
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = 'image/*';
fileInput.style.display = 'none';
document.body.appendChild(fileInput);

// When upload box is clicked, trigger file input
uploadBox.addEventListener('click', () => fileInput.click());
chooseFileBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  fileInput.click();
});

// ——— New: Handle paste events ———
uploadBox.addEventListener('paste', (event) => {
  const items = event.clipboardData?.items;
  if (!items) return;

  // Find an image file in the clipboard items
  for (const item of items) {
    if (item.kind === 'file' && item.type.startsWith('image/')) {
      const file = item.getAsFile();
      if (file) {
        // Preview & predict exactly as if selected
        const reader = new FileReader();
        reader.onload = () => {
          uploadBox.innerHTML = `<img src="${reader.result}" alt="Pasted Image" style="max-width:100%; border-radius: 1rem;" />`;
          sendForPrediction(file);
        };
        reader.readAsDataURL(file);
        break;  // only process the first image
      }
    }
  }
});


// Handle file selection
fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (!file) return;

  // Preview the image in the upload box
  const reader = new FileReader();
  reader.onload = () => {
    uploadBox.innerHTML = `<img src="${reader.result}" alt="Uploaded Image" style="max-width:100%; border-radius: 1rem;" />`;
    // After preview, send to backend for prediction
    sendForPrediction(file);
  };
  reader.readAsDataURL(file);
});

// Function to send image file to backend
function sendForPrediction(file) {
  // Clear any old results
  const existing = document.querySelector('.results');
  if (existing) existing.remove();

  const formData = new FormData();
  formData.append('file', file);   // ← changed from 'image' to 'file'

  // Display loading state
  const loadingText = document.createElement('p');
  loadingText.textContent = 'Analyzing...';
  loadingText.classList.add('loading-text');
  uploadBox.appendChild(loadingText);

  fetch('/predict', {
    method: 'POST',
    body: formData
  })
    .then(response => {
      loadingText.remove();
      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      return response.json();
    })
    .then(data => displayResult(data))
    .catch(err => {
      console.error('Error:', err);
      const errText = document.createElement('p');
      errText.textContent = 'Error analyzing image.';
      errText.style.color = 'red';
      uploadBox.appendChild(errText);
    });
}

// Function to display prediction results
function displayResult(data) {
  const resultsSection = document.createElement('div');
  resultsSection.classList.add('results');
  resultsSection.innerHTML = `
    <h3>Prediction</h3>
    <p><strong>Disease:</strong> ${data.disease}</p>
    <p><strong>Confidence:</strong> ${data.confidence}%</p>
    <p>${data.info || ''}</p>
  `;
  // Instead, append the results right below the uploadBox:
  uploadBox.parentElement.appendChild(resultsSection);
}

// --- Info Carousel Functionality ---
document.addEventListener('DOMContentLoaded', () => {
    const carouselItems = document.querySelectorAll('.carousel-item');
    const dots = document.querySelectorAll('.carousel-dots .dot');
    let currentIndex = 0;
    let carouselInterval;

    function showItem(index) {
        carouselItems.forEach((item, i) => {
            item.classList.remove('active');
            dots[i].classList.remove('active');
        });
        carouselItems[index].classList.add('active');
        dots[index].classList.add('active');
        currentIndex = index;
    }

    function startCarousel() {
        // Clear existing interval before starting a new one
        if (carouselInterval) clearInterval(carouselInterval);

        carouselInterval = setInterval(() => {
            let nextIndex = (currentIndex + 1) % carouselItems.length;
            showItem(nextIndex);
        }, 7000); // Change slide every 7 seconds
    }

    if (carouselItems.length > 0 && dots.length > 0) {
        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                const slideIndex = parseInt(dot.getAttribute('data-slide'));
                showItem(slideIndex);
                startCarousel(); // Restart interval on manual navigation
            });
        });

        showItem(0); // Show the first item initially
        startCarousel(); // Start automatic sliding
    }
});