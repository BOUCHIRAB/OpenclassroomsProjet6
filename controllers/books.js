const Book = require("../models/Book")
const fs = require("fs")

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book)
  delete bookObject._id
  delete bookObject._userId
  bookObject.averageRating = 0
  if (bookObject.ratings.grade === 0) {
    bookObject.ratings = []
  }

  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }.webp`,
  })

  book
    .save()
    .then(() => {
      res.status(201).json({ message: "Livre enregistré !" })
    })
    .catch((error) => {
      res.status(400).json({ error })
    })
}

exports.getOneBook = (req, res, next) => {
  Book.findOne({
    _id: req.params.id,
  })
    .then((book) => {
      res.status(200).json(book)
    })
    .catch((error) => {
      res.status(404).json({
        error: error,
      })
    })
}

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }))
}

exports.modifyBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }.webp`,
      }
    : { ...req.body }

  delete bookObject._userId
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(403).json({ message: "unauthorized request" })
      } else {
        if (req.file) {
          const filename = book.imageUrl.split("/images/")[1]
          fs.unlinkSync(`images/${filename}`)
        }

        Book.updateOne(
          { _id: req.params.id },
          { ...bookObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Livre modifié!" }))
          .catch((error) => res.status(401).json({ error }))
      }
    })
    .catch((error) => {
      res.status(400).json({ error })
    })
}

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(403).json({ message: "unauthorized request" })
      } else {
        const filename = book.imageUrl.split("/images/")[1]
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Objet supprimé !" })
            })
            .catch((error) => res.status(401).json({ error }))
        })
      }
    })
    .catch((error) => {
      res.status(500).json({ error })
    })
}

exports.rateBook = (req, res, next) => {
  Book.findOne({
    _id: req.params.id,
  }).then((book) => {
    book.ratings.push({
      userId: req.auth.userId,
      grade: req.body.rating,
    })

    let cumul = 0
    let UpdateAverageRating =
      book.ratings.reduce(
        (acc, currentValue) => acc + currentValue.grade,
        cumul
      ) / book.ratings.length
    book.averageRating = Math.round(UpdateAverageRating)

    return book
      .save()
      .then((book) => res.status(201).json(book))
      .catch((error) =>
        res
          .status(401)
          .json({ error, message: "You have already rated this book" })
      )
  })
}
exports.getBestBooks = (req, res, next) => {
  Book.find()
    .then((books) => {
      let sortBooks = books.sort((a, b) => b.averageRating - a.averageRating)

      if (sortBooks.length < 3) {
        if (sortBooks.length === 2) {
          res.status(201).json([sortBooks[0], sortBooks[1]])
        } else {
          if (sortBooks.length === 1) {
            res.status(201).json([sortBooks[0]])
          }
        }
      } else {
        res.status(201).json([sortBooks[0], sortBooks[1], sortBooks[2]])
      }
    })
    .catch((error) => {
      res.status(404).json({ error: error })
    })
}
