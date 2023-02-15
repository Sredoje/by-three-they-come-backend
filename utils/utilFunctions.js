const Utils = {
  getFileExtension: function (mimeType) {
    switch (mimeType) {
      case 'image/jpeg':
        return 'jpg';
      case 'image/jpg':
        return 'jpg';
      case 'image/png':
        return 'png';
      default:
        return null; // Or throw an error, depending on your use case
    }
  },
};

module.exports = Utils;
