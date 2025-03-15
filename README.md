# YouTube Speed Controller

A Chrome extension that allows you to easily control YouTube video playback speeds with a simple and intuitive interface.

## Features

-   **Speed Control Buttons**: Adds convenient 1x, 1.5x, and 2x speed buttons directly to the YouTube video interface
-   **Default Speed Setting**: Set your preferred default playback speed through the extension popup
-   **Visual Feedback**: Clear visual indication of the currently selected speed
-   **Persistent Settings**: Your default speed preference is saved between browser sessions

## Installation

1. Clone this repository or download the ZIP file
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory
5. The extension is now installed and ready to use!

## How to Use

### Speed Control on YouTube Videos

-   Navigate to any YouTube video
-   You'll see 1x, 1.5x, and 2x speed buttons next to the video title
-   Click on any button to instantly change the playback speed
-   The active speed button will be highlighted

### Setting a Default Speed

1. Click the extension icon in your Chrome toolbar
2. Select your preferred default speed from the dropdown
3. Click "Save"
4. Your selected speed will now be automatically applied to YouTube videos

## Technical Details

The extension consists of:

-   `manifest.json`: Configuration file for the Chrome extension
-   `content.js`: Injects speed control buttons into the YouTube interface
-   `popup.html` & `popup.js`: Provides UI for setting default playback speed
-   `icon.png`: Extension icon

## Permissions

-   `activeTab`: Access to the active tab to modify YouTube's interface
-   `storage`: Store user preferences for default speed
-   `scripting`: Execute scripts in the context of web pages
-   Host permission for `https://www.youtube.com/*`

## Support

If you encounter any issues or have suggestions for improvements, please [open an issue](https://github.com/aydinsenih/youtube-playback-speed-extention/issues).
