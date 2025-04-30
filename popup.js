// Remove import statements and use global services
class PopupManager {
  constructor() {
    this.uploadButton = document.getElementById('uploadButton');
    this.fileInput = document.getElementById('fileInput');
    this.storedImagesContainer = document.getElementById('storedImages');
    this.lastUploadedImage = null;
    this.initialize();
  }

  async initialize() {
    this.setupEventListeners();
    await this.loadStoredImages();
    this.setupTabActivationListener();
  }

  setupEventListeners() {
    this.uploadButton.addEventListener('click', () => this.fileInput.click());
    this.fileInput.addEventListener('change', this.handleFileUpload.bind(this));
  }

  setupTabActivationListener() {
    chrome.tabs.onActivated.addListener((activeInfo) => {
      if (this.lastUploadedImage) {
        this.sendImageToTab(activeInfo.tabId);
      }
    });
  }

  async sendImageToTab(tabId) {
    try {
      const tab = await chrome.tabs.get(tabId);
      if (tab.url.startsWith('chrome://')) {
        return;
      }

      await chrome.tabs.sendMessage(tabId, {
        action: 'addImage',
        imageData: this.lastUploadedImage
      });
    } catch (error) {
      console.error('Error sending image to tab:', error);
    }
  }

  async loadStoredImages() {
    try {
      const stickers = await StorageService.getStoredData();
      this.storedImagesContainer.innerHTML = '';
      
      stickers.forEach((sticker, index) => {
        const { container, img, removeButton, visibilityToggle } = ImageService.createStoredImageContainer(
          sticker.imageData,
          sticker.position,
          index,
          sticker.isVisible
        );
        
        img.addEventListener('click', () => this.useImage(sticker.imageData));
        removeButton.addEventListener('click', (e) => {
          e.stopPropagation();
          this.removeImage(index);
        });
        
        const toggleInput = visibilityToggle.querySelector('input');
        const toggleLabel = visibilityToggle.querySelector('label');
        
        toggleInput.addEventListener('change', (e) => {
          e.stopPropagation();
          this.toggleVisibility(index, toggleInput, toggleLabel);
        });
        
        this.storedImagesContainer.appendChild(container);
      });
    } catch (error) {
      console.error('Error loading stored images:', error);
    }
  }

  async handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      console.error('Invalid file type. Please upload an image or GIF.');
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.error('File too large. Please upload a file smaller than 5MB.');
      return;
    }

    try {
      const imageData = await ImageService.readFileAsDataURL(file);
      const index = await StorageService.saveImage(imageData);
      await this.loadStoredImages();
      await this.useImage(imageData);
    } catch (error) {
      console.error('Error handling file upload:', error);
    }
  }

  async useImage(imageData) {
    try {
      this.lastUploadedImage = imageData;
      
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!activeTab) {
        return;
      }

      if (activeTab.url.startsWith('chrome://')) {
        return;
      }

      await this.sendImageToTab(activeTab.id);
    } catch (error) {
      console.error('Error using image:', error);
    }
  }

  async removeImage(index) {
    try {
      await StorageService.removeImage(index);
      await this.loadStoredImages();
      
      // Notify all tabs to remove the image
      const tabs = await chrome.tabs.query({});
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          action: 'removeImage',
          index: index
        }).catch(() => {});
      });
    } catch (error) {
      console.error('Error removing image:', error);
    }
  }

  async toggleVisibility(index, toggleInput, toggleLabel) {
    try {
      await StorageService.toggleVisibility(index);
      const isVisible = toggleInput.checked;
      toggleLabel.textContent = isVisible ? 'Visible' : 'Hidden';
      
      // Notify all tabs to update visibility
      const tabs = await chrome.tabs.query({});
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          action: 'toggleVisibility',
          index: index,
          isVisible: isVisible
        }).catch(() => {});
      });
    } catch (error) {
      console.error('Error toggling visibility:', error);
      // Revert the toggle state if there was an error
      toggleInput.checked = !toggleInput.checked;
      toggleLabel.textContent = toggleInput.checked ? 'Visible' : 'Hidden';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
}); 