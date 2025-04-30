// Image service for handling image-related operations
const ImageService = {
  // Check if an image is a GIF
  isGif(imageData) {
    return imageData.startsWith('data:image/gif');
  },

  // Create a new image element
  createImageElement(imageData, index, position = null) {
    const img = document.createElement('img');
    img.src = imageData;
    img.className = 'draggable-image';
    img.dataset.index = index;
    
    // Set initial position
    img.style.position = 'fixed';
    if (position && typeof position.x === 'number' && typeof position.y === 'number') {
      img.style.left = position.x + 'px';
      img.style.top = position.y + 'px';
    } else {
      // Center the image if no position is provided
      img.style.left = '50%';
      img.style.top = '50%';
      img.style.transform = 'translate(-50%, -50%)';
    }
    
    img.style.cursor = 'move';
    img.style.zIndex = '1000';
    img.style.maxWidth = '200px';
    img.style.maxHeight = '200px';
    img.style.objectFit = 'contain';
    
    // Add specific styles for GIFs
    if (this.isGif(imageData)) {
      img.style.imageRendering = 'auto'; // Allow GIF animation
    }
    
    // Force a reflow to ensure styles are applied
    img.offsetHeight;
    
    return img;
  },

  // Create a stored image container
  createStoredImageContainer(imageData, position, index, isVisible = true) {
    const container = document.createElement('div');
    container.className = 'stored-image-container';
    
    const img = document.createElement('img');
    img.src = imageData;
    img.className = 'stored-image';
    img.title = 'Click to use this image';
    
    const positionInfo = document.createElement('div');
    positionInfo.className = 'position-info';
    positionInfo.textContent = `Position: (${position?.x || 'center'}, ${position?.y || 'center'})`;
    
    const removeButton = document.createElement('button');
    removeButton.className = 'remove-button';
    removeButton.textContent = 'x';
    removeButton.title = 'Remove this image';
    removeButton.dataset.index = index;
    
    const visibilityToggle = document.createElement('div');
    visibilityToggle.className = 'visibility-toggle';
    visibilityToggle.dataset.index = index;
    
    const toggleInput = document.createElement('input');
    toggleInput.type = 'checkbox';
    toggleInput.id = `visibility-toggle-${index}`;
    toggleInput.checked = isVisible;
    
    const toggleLabel = document.createElement('label');
    toggleLabel.htmlFor = `visibility-toggle-${index}`;
    toggleLabel.textContent = isVisible ? 'Visible' : 'Hidden';
    
    visibilityToggle.appendChild(toggleInput);
    visibilityToggle.appendChild(toggleLabel);
    
    container.appendChild(img);
    container.appendChild(positionInfo);
    container.appendChild(visibilityToggle);
    container.appendChild(removeButton);
    
    return { container, img, removeButton, visibilityToggle };
  },

  // Read file as data URL
  readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }
}; 