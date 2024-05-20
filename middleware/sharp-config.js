const sharp = require("sharp")
const fs = require("fs")

const compressedImage = async (req, res, next) => {
  if (req.file) {
    sharp(req.file.path)
      .webp({ quality: 80 })
      .resize(463)
      .toFile(req.file.path + ".webp")
      .then(() => {
        fs.unlink(req.file.path, () => {
          req.file.path = req.file.path + ".webp"
          next()
        })
      })
      .catch((error) => {
        console.log(error)
        return next()
      })
  } else {
    next()
  }
}

module.exports = compressedImage
