# Sticker Pin Browser Extension

A Chrome extension that allows you to upload and display GIFs or images directly in your browser window. Pin your favorite images and GIFs to any webpage for quick access and visual reference.

## Features

- Upload and store images and GIFs (supports JPG, PNG, and GIF formats)
- Display stored images on any webpage
- Simple and intuitive user interface
- Quick access through browser extension popup
- Supports files up to 5MB

## Installation

1. Clone this repository or download the source code
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the directory containing the extension files

## Usage

1. Click the extension icon in your browser toolbar to open the popup
2. Click "Upload Image/GIF" to add new images
3. Select an image or GIF from your computer
4. Your uploaded images will appear in the "Stored Images" section
5. Click on any stored image to display it on the current webpage

## File Structure

- `manifest.json` - Extension configuration and permissions
- `popup.html` - Main extension popup interface
- `popup.js` - Popup functionality and event handlers
- `content.js` - Content script for displaying images on webpages
- `imageService.js` - Image handling and processing
- `storageService.js` - Local storage management
- `styles.css` - Extension styling
- `PRIVACY.md` - Privacy policy

## Permissions

The extension requires the following permissions:
- `storage` - To save and retrieve uploaded images
- `activeTab` - To interact with the current webpage
- `tabs` - To manage browser tabs
- `scripting` - To inject content scripts

## Development

To modify or extend the functionality:
1. Make your changes to the relevant files
2. Reload the extension in `chrome://extensions/`
3. Test your changes

## License

This project is open source and available under the MIT License.

## Privacy

Please review our [Privacy Policy](PRIVACY.md) to understand how we handle your data.

## Support

For any issues or feature requests, please open an issue in the repository.
