// Load the previously saved default speed (if any)
chrome.storage.sync.get('defaultSpeed', (data) => {
    const speedSelector = document.getElementById('speedSelector');
    if (data.defaultSpeed) {
      speedSelector.value = data.defaultSpeed;
    }
  });
  
  // Save the selected speed when the button is clicked
  document.getElementById('saveButton').addEventListener('click', () => {
    const speed = document.getElementById('speedSelector').value;
    chrome.storage.sync.set({ defaultSpeed: speed }, () => {
      document.getElementById('statusMessage').innerText = `Default speed set to ${speed}`;
    });
  });
  