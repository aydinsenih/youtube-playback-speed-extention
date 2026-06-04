const speedButtons = document.querySelectorAll('.speed-btn');
let selectedSpeed = '1';

function selectSpeed(speed) {
  selectedSpeed = speed;
  speedButtons.forEach((btn) => {
    btn.classList.toggle('selected', btn.dataset.speed === speed);
  });
}

// Load the previously saved default speed (if any)
chrome.storage.sync.get('defaultSpeed', (data) => {
  selectSpeed(data.defaultSpeed || '1');
});

// Highlight the speed when a button is clicked
speedButtons.forEach((btn) => {
  btn.addEventListener('click', () => selectSpeed(btn.dataset.speed));
});

// Save the selected speed when the Save button is clicked
document.getElementById('saveButton').addEventListener('click', () => {
  chrome.storage.sync.set({ defaultSpeed: selectedSpeed }, () => {
    document.getElementById('statusMessage').innerText = `Default speed set to ${selectedSpeed}`;
  });
});
