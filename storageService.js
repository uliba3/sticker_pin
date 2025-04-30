// Storage service for handling chrome.storage.local operations
const StorageService = {
  // Keys used in storage
  KEYS: {
    STICKERS: 'stickers'
  },

  // Get stored stickers
  async getStoredData() {
    const result = await chrome.storage.local.get('stickers');
    return result.stickers || [];
  },

  // Save a new image
  async saveImage(imageData, position = null) {
    const stickers = await this.getStoredData();
    const newIndex = stickers.length;
    stickers.push({
      imageData,
      position,
      isVisible: true
    });
    await chrome.storage.local.set({ stickers });
    return newIndex;
  },

  // Toggle image visibility
  async toggleVisibility(index) {
    const stickers = await this.getStoredData();
    if (stickers[index]) {
      stickers[index].isVisible = !stickers[index].isVisible;
      await this.saveStickers(stickers);
    }
  },

  // Save image position
  async savePosition(index, position) {
    const stickers = await this.getStoredData();
    if (stickers[index]) {
      stickers[index].position = position;
      await this.saveStickers(stickers);
    }
  },

  // Remove an image by index
  async removeImage(index) {
    const stickers = await this.getStoredData();
    stickers.splice(index, 1);
    await this.saveStickers(stickers);
  },

  async saveStickers(stickers) {
    await chrome.storage.local.set({ stickers });
  }
}; 