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
        return null;
    }
  },
};

module.exports = Utils;
