const express = require("express")
const router = express.Router()

const auth = require("../middleware/auth")
const multer = require("../middleware/multer-config")
const compressedImage = require("../middleware/sharp-config")

const booksCtrl = require("../controllers/books")

router.get("/", booksCtrl.getAllBooks)
router.get("/bestrating", booksCtrl.getBestBooks)
router.post("/", auth, multer, compressedImage, booksCtrl.createBook)
router.post("/:id/rating", auth, booksCtrl.rateBook)
router.get("/:id", booksCtrl.getOneBook)
router.put("/:id", auth, multer, compressedImage, booksCtrl.modifyBook)
router.delete("/:id", auth, booksCtrl.deleteBook)

module.exports = router
