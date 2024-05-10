const sharp = require("sharp")
const fs = require("fs")
const compressedImage = async (req, res, next) => {
  sharp(req.file.path)
    .webp({ quality: 80 })
    .resize(463)
    .toFile(req.file.path + ".webp")
    .then(() => {
      // Remplacer le fichier original par le fichier redimensionné
      fs.unlink(req.file.path, () => {
        req.file.path = req.file.path + ".webp"
        next()
      })
    })
    .catch((err) => {
      console.log(err)
      return next()
    })
}

module.exports = compressedImage
