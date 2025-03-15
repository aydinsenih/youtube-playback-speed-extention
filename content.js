// Function to apply the selected speed
function applySpeed(speed) {
  const video = document.querySelector('video');
  if (video) {
    video.playbackRate = parseFloat(speed);
  }
}

// Get default speed from chrome storage
chrome.storage.sync.get('defaultSpeed', (data) => {
  if (data.defaultSpeed) {
    applySpeed(data.defaultSpeed);  // Apply default speed if it's set
  }
});

function addSpeedControlButtons() {
  const titleContainer = document.querySelector('#above-the-fold #title');
  const activeVideo = document.querySelector('video');

  if (activeVideo && titleContainer && !document.getElementById('speed-control-btn')) {


    const container = document.createElement('div');
    container.id = 'speed-control-container';
    container.style.display = 'inline-flex';
    container.style.gap = '5px';
    container.style.marginLeft = '10px';

    const speeds = [1, 1.5, 2];

    speeds.forEach(speed => {
      const currentSpeed = activeVideo.playbackRate;

      const button = document.createElement('button');
      const div = document.createElement('div');
      div.id = 'speed-control-button' + speed;
      div.classList.add('yt-spec-button-shape-next__button-text-content');
      const span = document.createElement('span');
      span.id = 'speed-control-button-text' + speed;
      span.innerText = `${speed}x`;
      span.classList.add(["yt-core-attributed-string", "yt-core-attributed-string--white-space-no-wrap"]);
      button.style.padding = '5px 10px';
      button.style.fontSize = '14px';
      button.style.cursor = 'pointer';
      // button.style.border = '1px #f1f1f1 solid';
      button.style.border = 'none';
      button.style.borderRadius = '8px';
      if (currentSpeed === speed) {
        button.style.color = '#0f0f0f';
        button.style.background = '#f1f1f1';
      } else {
        button.style.color = '#f1f1f1';
        button.style.background = '#0f0f0f';
      }

      button.addEventListener('click', () => {
        let video = document.querySelector('video');
        if (video) {
          video.playbackRate = speed;
        }
        const allButtons = container.querySelectorAll('button');
        allButtons.forEach(btn => { btn.style.background = '#0f0f0f'; btn.style.color = '#f1f1f1' });
        // Set background of selected button to indicate it's active
        button.style.background = '#f1f1f1';
        button.style.color = '#0f0f0f';
      });

      div.appendChild(span);
      button.appendChild(div);
      container.appendChild(button);
    });

    titleContainer.appendChild(container);
    titleContainer.style.display = 'flex';
    titleContainer.style.justifyContent = 'space-between';
  }
}

// Run only when the title section appears
function observeTitle() {
  const observer = new MutationObserver((mutations, obs) => {
    if (document.querySelector('#above-the-fold #title')) {
      addSpeedControlButtons();
      obs.disconnect(); // Stop observing once buttons are added
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// Ensure script runs after YouTube fully loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', observeTitle);
} else {
  observeTitle();
}