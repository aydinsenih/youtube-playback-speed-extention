// Global variable to keep track of the video element currently being monitored for rate changes.
// This is crucial for ensuring that event listeners are correctly managed (added/removed)
// when the video element changes, such as during YouTube's Single Page Application (SPA) navigations
// or when ads cause the video player to be temporarily replaced.
let currentVideoElement = null;

/**
 * Determines whether the current page is a YouTube Short.
 * Shorts URLs contain "/shorts/" in their path (e.g. youtube.com/shorts/abc123).
 * @returns {boolean} True if the user is watching a Short.
 */
function isShortsPage() {
    return window.location.pathname.includes("/shorts/");
}

// --- Button UI Functions ---

/**
 * Updates the visual style of the speed control buttons to reflect the current video playback rate.
 * The button corresponding to the current speed is given an "active" appearance.
 * @param {number} currentRate - The current playback rate of the video.
 */
function updateButtonStyles(currentRate) {
    const container = document.getElementById("speed-control-container");
    if (container) {
        const buttons = container.querySelectorAll("button");
        buttons.forEach((button) => {
            // Compare speed with a tolerance due to potential floating point inaccuracies.
            if (
                Math.abs(parseFloat(button.dataset.speed) - currentRate) < 0.01
            ) {
                button.style.color = "#0f0f0f"; // Active button text color (dark)
                button.style.background = "#f1f1f1"; // Active button background (light)
            } else {
                button.style.color = "#f1f1f1"; // Inactive button text color (light)
                button.style.background = "#0f0f0f"; // Inactive button background (dark)
            }
        });
    }
}

/**
 * Creates and adds the speed control buttons to the YouTube video title area.
 * This function is idempotent; it checks if the buttons' container (`speed-control-container`)
 * already exists before creating new buttons, preventing duplicates.
 */
function addSpeedControlButtons() {
    const titleContainer = document.querySelector("#above-the-fold #title");
    // Use `currentVideoElement` if it's already known (e.g., from a previous `applySpeed` call).
    // Otherwise, query the DOM for a video element. This `activeVideo` is primarily for
    // determining the initial playback rate to style buttons correctly if `currentVideoElement` isn't set yet.
    const activeVideo = currentVideoElement || document.querySelector("video");

    // Proceed only if:
    // 1. An active video element is found.
    // 2. The YouTube title container is found.
    // 3. The speed control button container has not already been added (idempotency check).
    if (
        activeVideo &&
        titleContainer &&
        !document.getElementById("speed-control-container")
    ) {
        const container = document.createElement("div");
        container.id = "speed-control-container"; // Used for idempotency and potentially for styling via CSS.
        container.style.display = "inline-flex"; // Align buttons horizontally.
        container.style.gap = "5px"; // Space between buttons.
        container.style.marginLeft = "15px"; // Space from the title text.

        const speeds = [1, 1.5, 2]; // Define the available speed options.

        speeds.forEach((speed) => {
            const button = document.createElement("button");
            // Store the speed value on the button's dataset for easy access in event listeners and styling.
            button.dataset.speed = speed;

            // Structure attempts to mimic YouTube's button styling classes for visual consistency.
            const div = document.createElement("div");
            div.id = "speed-control-button-" + speed; // Unique ID for each button's inner div.
            div.classList.add("yt-spec-button-shape-next__button-text-content");
            const span = document.createElement("span");
            span.id = "speed-control-button-text-" + speed; // Unique ID for each button's text span.
            span.innerText = `${speed}x`;
            span.classList.add(
                "yt-core-attributed-string",
                "yt-core-attributed-string--white-space-no-wrap"
            );

            // Basic styling for the button appearance.
            button.style.padding = "5px 10px";
            button.style.fontSize = "14px";
            button.style.cursor = "pointer";
            button.style.border = "none";
            button.style.borderRadius = "8px";
            // Initial active/inactive styling will be set by the `updateButtonStyles` call further down.

            button.addEventListener("click", () => {
                // When a button is clicked, apply its speed to the `currentVideoElement`.
                // `currentVideoElement` should be the most up-to-date reference to the active video.
                if (currentVideoElement) {
                    applySpeed(speed, currentVideoElement);
                } else {
                    // Fallback: if `currentVideoElement` isn't set (e.g., very early script execution),
                    // try to find the video element directly. This scenario should be rare.
                    const videoForClick = document.querySelector("video");
                    if (videoForClick) {
                        applySpeed(speed, videoForClick);
                    }
                }
            });

            div.appendChild(span);
            button.appendChild(div);
            container.appendChild(button);
        });

        // Add the newly created container with all its buttons to the title area.
        // `appendChild` is used to place our buttons after the title text.
        titleContainer.appendChild(container);
        titleContainer.style.display = "flex";
        titleContainer.style.justifyContent = "space-between";

        // Set initial button styles based on the current video's playback rate.
        // `activeVideo` (derived from `currentVideoElement` or a fresh query) is used here.
        updateButtonStyles(activeVideo.playbackRate);
    }
}

// --- Speed Control Logic & Event Handling ---

/**
 * Event handler for the video's 'ratechange' event.
 * This is triggered when the video's playbackRate changes, whether initiated by
 * these custom speed buttons, YouTube's own speed controls, or other means (e.g., ads).
 * Its role is to ensure the custom button UI accurately reflects the video's actual speed.
 */
function handleRateChange() {
    if (currentVideoElement) {
        updateButtonStyles(currentVideoElement.playbackRate);
    }
}

/**
 * Applies the selected speed to a given video element and manages 'ratechange' event listeners.
 * This function is central to ensuring that:
 * 1. The correct playback speed is set on the `videoElement`.
 * 2. The `handleRateChange` listener is attached to only one video element at a time (the `currentVideoElement`).
 *    This prevents multiple listeners accumulating or listeners attached to stale video elements.
 * 3. Button styles are updated immediately after setting the speed to reflect the change.
 * @param {number} speedValue - The playback speed to apply (e.g., 1, 1.5, 2).
 * @param {HTMLVideoElement} videoElement - The video element to control.
 */
function applySpeed(speedValue, videoElement) {
    if (videoElement) {
        // If the target `videoElement` is different from the `currentVideoElement` we are tracking
        // (e.g., a new video has loaded after SPA navigation or an ad finished):
        // 1. Remove the 'ratechange' listener from the old `currentVideoElement` (if one exists and is tracked).
        // 2. Update `currentVideoElement` to point to the new `videoElement`.
        // 3. Add the 'ratechange' listener to the new `currentVideoElement`.
        if (currentVideoElement !== videoElement) {
            if (currentVideoElement) {
                currentVideoElement.removeEventListener(
                    "ratechange",
                    handleRateChange
                );
            }
            currentVideoElement = videoElement; // Update the global reference.
            currentVideoElement.addEventListener(
                "ratechange",
                handleRateChange
            );
        }

        videoElement.playbackRate = parseFloat(speedValue); // Set the actual playback speed on the video.

        // Update button styles immediately. The 'ratechange' event might not fire if the
        // speed is set to its current value, or if the change is very small.
        // This direct call ensures the UI always reflects the intended state.
        updateButtonStyles(videoElement.playbackRate);
    }
}

/**
 * Retrieves the user's stored default speed from `chrome.storage.sync` and applies it.
 * If a video element isn't immediately available (e.g., page is still loading),
 * it sets up a MutationObserver (`videoObserver`) to apply the speed once a video element
 * appears or if the video element is dynamically replaced (common after ads).
 */
function applyDefaultSpeedSettings() {
    // Shorts always play at 1x, regardless of the saved default speed.
    if (isShortsPage()) {
        const video = document.querySelector("video");
        if (video) {
            applySpeed(1, video);
        } else {
            const shortsObserver = new MutationObserver(() => {
                if (!isShortsPage()) return; // User navigated away from Shorts.
                const newVideo = document.querySelector("video");
                if (newVideo && newVideo.playbackRate !== 1) {
                    applySpeed(1, newVideo);
                }
            });
            shortsObserver.observe(document.body, {
                childList: true,
                subtree: true,
            });
        }
        return;
    }

    chrome.storage.sync.get("defaultSpeed", (data) => {
        if (data.defaultSpeed) {
            const defaultSpeedValue = parseFloat(data.defaultSpeed);
            const video = document.querySelector("video"); // Attempt to find an existing video element.

            if (video) {
                // If a video element is found, apply the default speed to it.
                applySpeed(defaultSpeedValue, video);
            } else {
                // If no video element is initially found, set up a MutationObserver.
                // This observer watches for additions to the DOM, specifically looking for a video element.
                const videoObserver = new MutationObserver((mutations, obs) => {
                    // This observer persists across SPA navigations. If the user has moved
                    // to a Shorts page, do nothing here so the video speed never overwrites
                    // the 1x that Shorts are forced to.
                    if (isShortsPage()) return;
                    const newVideo = document.querySelector("video"); // Check again for a video element.
                    if (newVideo) {
                        // When a video element appears:
                        // 1. Apply the default speed.
                        // 2. Also re-apply if it's the same `currentVideoElement` but its speed was reset
                        //    (e.g., by YouTube after an ad finishes, or by other extensions).
                        if (
                            newVideo !== currentVideoElement ||
                            newVideo.playbackRate !== defaultSpeedValue
                        ) {
                            applySpeed(defaultSpeedValue, newVideo);
                        }
                        // This observer should remain active for the lifetime of the content script on the page.
                        // `applySpeed` will handle listener re-attachment if `newVideo` is different from `currentVideoElement`.
                        // This persistence ensures default speed is re-applied if YouTube replaces the
                        // video element (e.g., after some types of ads) without a full page navigation.
                        // No `obs.disconnect()` here.
                    }
                });
                videoObserver.observe(document.body, {
                    childList: true,
                    subtree: true,
                });
            }
        }
    });
}

// --- Initialization and Page Lifecycle Management ---

/**
 * Main function to initialize or re-initialize the extension's features on a page.
 * This includes adding speed control buttons and applying the default speed settings.
 * It's designed to be called on initial page load and after YouTube SPA navigations
 * (via the `yt-navigate-finish` event).
 */
function initializeExtensionFeatures() {
    const video = document.querySelector("video");

    // Shorts don't have the regular watch-page title container where the speed
    // buttons are mounted, so we skip the button UI and only apply the saved
    // default Shorts speed once a video element is present.
    if (isShortsPage()) {
        if (video) {
            applyDefaultSpeedSettings();
        } else {
            setTimeout(initializeExtensionFeatures, 300); // Player not ready yet; retry shortly.
        }
        return;
    }

    const titleContainer = document.querySelector("#above-the-fold #title");

    // Only proceed if essential elements (title container and video) are found.
    // This check helps ensure that the logic primarily runs on actual video watch pages.
    if (titleContainer && video) {
        addSpeedControlButtons(); // Idempotent: adds buttons if they are not already present.
        applyDefaultSpeedSettings(); // Applies stored default speed and sets up necessary video observers.
    } else if (document.querySelector("ytd-watch-flexy[video-id]")) {
        // Fallback for video pages where elements might load with a slight delay.
        // `ytd-watch-flexy[video-id]` is a more specific selector for YouTube's main video watch page container
        // that has a video-id attribute, indicating it's very likely a video page.
        // If this container is present but title/video aren't yet found, retry initialization shortly.
        // This helps catch cases where the page structure is partially loaded when the script first runs.
        setTimeout(initializeExtensionFeatures, 300); // Retry after 300ms.
    }
}

// MutationObserver for detecting the *initial* appearance of the YouTube player.
// This is primarily for the first time a video page loads, ensuring features are set up
// as soon as the player is ready. It's designed to run once and then disconnect.
let initialPlayerObserver = null;

/**
 * Sets up a MutationObserver (`initialPlayerObserver`) to watch for the YouTube title
 * container and video element to appear in the DOM for the first time on a page load.
 * Once detected, it initializes the extension features and disconnects itself,
 * as further page changes will be handled by `yt-navigate-finish`.
 */
function observeInitialPlayer() {
    // Prevent setting up multiple observers if this function is somehow called multiple times.
    if (initialPlayerObserver) return;

    initialPlayerObserver = new MutationObserver((mutations, obs) => {
        const titleContainer = document.querySelector("#above-the-fold #title");
        const video = document.querySelector("video");

        // When both title container and a video element are available:
        if (titleContainer && video) {
            initializeExtensionFeatures(); // Set up the extension's UI and speed settings.
            obs.disconnect(); // Stop this observer; its job is done for this initial page load.
            initialPlayerObserver = null; // Clear the observer instance variable.
        }
    });

    // Start observing the entire document body for changes in the DOM structure (additions/removals of nodes).
    initialPlayerObserver.observe(document.body, {
        childList: true,
        subtree: true,
    });
}

// --- Script Execution Start: Handles initial page load and SPA navigation events ---

// Standard handling for script execution:
// If the document is still loading, wait for the DOMContentLoaded event before proceeding.
// Otherwise (if DOMContentLoaded has already fired), proceed with setup immediately.
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        observeInitialPlayer(); // Start observing for the player to appear on the page.
        initializeExtensionFeatures(); // Attempt initialization immediately (elements might be ready by now).
    });
} else {
    observeInitialPlayer(); // Start observing for the player.
    initializeExtensionFeatures(); // Attempt initialization.
}

// Listen for YouTube's 'yt-navigate-finish' event. This is a custom event dispatched by YouTube
// when its internal SPA (Single Page Application) navigation has completed.
// This is crucial for re-initializing features when the user navigates within YouTube
// (e.g., clicking on a related video, search result, or a link in the sidebar)
// without a full, traditional page reload.
document.addEventListener("yt-navigate-finish", () => {
    // When navigation finishes, re-run the initialization logic.
    // `currentVideoElement` is managed by `applySpeed`. If a new video element appears on navigation,
    // `applySpeed` will handle the transition of event listeners correctly.
    // Thus, no explicit reset of `currentVideoElement` to null is strictly needed here before this call.
    initializeExtensionFeatures(); // Re-initialize features for the new page content.
});
