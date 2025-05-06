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

// Handle file selection
fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (!file) return;

  // Preview the image in the upload box
  const reader = new FileReader();
  reader.onload = () => {
    uploadBox.innerHTML = `<img src="${reader.result}" alt="Uploaded Image" style="max-width:100%;" />`;
    // After preview, send to backend for prediction
    sendForPrediction(file);
  };
  reader.readAsDataURL(file);
});

// Function to send image file to backend
function sendForPrediction(file) {
  const formData = new FormData();
  formData.append('image', file);

  // Display loading state
  uploadBox.innerHTML += '<p>Analyzing...</p>';

  fetch('/predict', {
    method: 'POST',
    body: formData
  })
    .then(response => response.json())
    .then(data => displayResult(data))
    .catch(err => {
      console.error('Error:', err);
      uploadBox.innerHTML += '<p>Error analyzing image.</p>';
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
    <p>${data.info}</p>
  `;
  document.querySelector('.page-container').appendChild(resultsSection);
}