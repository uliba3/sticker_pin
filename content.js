// Remove import statements and use global services
class ImageManager {
  constructor() {
    this.imageMap = new Map();
    this.isDragging = false;
    this.currentImage = null;
    this.offset = { x: 0, y: 0 };
    this.initialize();
  }

  async initialize() {
    const stickers = await StorageService.getStoredData();
    
    stickers.forEach((sticker, index) => {
      if (sticker.isVisible) {
        this.addImageToPage(sticker.imageData, sticker.position, index);
      }
    });
    
    this.setupMessageListener();
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'addImage') {
        const newIndex = this.imageMap.size;
        this.addImageToPage(request.imageData, null, newIndex);
      } else if (request.action === 'removeImage') {
        this.removeImageFromPage(request.index);
      } else if (request.action === 'toggleVisibility') {
        this.updateVisibility(request.index, request.isVisible);
      }
    });
  }

  async addImageToPage(imageData, position, index) {
    const img = ImageService.createImageElement(imageData, index, position);
    
    img.addEventListener('mousedown', this.startDragging.bind(this));
    
    img.onload = () => {
      const rect = img.getBoundingClientRect();
      const isInViewport = (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
      
      if (!isInViewport) {
        img.style.left = '50%';
        img.style.top = '50%';
        img.style.transform = 'translate(-50%, -50%)';
      }
      
      document.body.appendChild(img);
      this.imageMap.set(index, img);
    };
    
    img.onerror = (error) => {
      console.error('Error loading image:', error);
    };
  }

  startDragging(e) {
    if (e.button !== 0) return;
    
    this.isDragging = true;
    this.currentImage = e.target;
    this.offset = {
      x: e.clientX - this.currentImage.offsetLeft,
      y: e.clientY - this.currentImage.offsetTop
    };
    
    document.addEventListener('mousemove', this.dragImage.bind(this));
    document.addEventListener('mouseup', this.stopDragging.bind(this));
  }

  dragImage(e) {
    if (!this.isDragging) return;
    
    this.currentImage.style.left = (e.clientX - this.offset.x) + 'px';
    this.currentImage.style.top = (e.clientY - this.offset.y) + 'px';
  }

  async stopDragging() {
    if (this.currentImage) {
      const index = this.currentImage.dataset.index;
      const position = {
        x: parseInt(this.currentImage.style.left),
        y: parseInt(this.currentImage.style.top)
      };
      await StorageService.savePosition(index, position);
    }
    
    this.isDragging = false;
    this.currentImage = null;
    document.removeEventListener('mousemove', this.dragImage);
    document.removeEventListener('mouseup', this.stopDragging);
  }

  removeImageFromPage(index) {
    const img = this.imageMap.get(index);
    if (img) {
      img.remove();
      this.imageMap.delete(index);
      this.reindexImages();
    }
  }

  updateVisibility(index, isVisible) {
    const img = this.imageMap.get(index);
    if (img) {
      if (isVisible) {
        img.style.display = 'block';
      } else {
        img.style.display = 'none';
      }
    } else if (isVisible) {
      const stickers = StorageService.getStoredData();
      if (stickers[index]) {
        this.addImageToPage(stickers[index].imageData, stickers[index].position, index);
      }
    }
  }

  reindexImages() {
    const newMap = new Map();
    let newIndex = 0;
    
    this.imageMap.forEach((img, oldIndex) => {
      img.dataset.index = newIndex;
      newMap.set(newIndex, img);
      newIndex++;
    });
    
    this.imageMap = newMap;
  }
}

// Initialize the ImageManager when the content script loads
const imageManager = new ImageManager(); 