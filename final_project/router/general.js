const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (users.find(u => u.username === username)) {
    return res.status(409).json({ message: "User already exists" });
  }
  users.push({ username, password });
  return res.status(200).send("User successfully registered. Now you can login");
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get the book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn], null, 4));
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const booksByAuthor = {};
  for (let key in books) {
    if (books[key].author === author) {
      booksByAuthor[key] = books[key];
    }
  }
  if (Object.keys(booksByAuthor).length > 0) {
    return res.status(200).send(JSON.stringify(booksByAuthor, null, 4));
  } else {
    return res.status(404).json({ message: "No books found for this author" });
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const booksByTitle = {};
  for (let key in books) {
    if (books[key].title === title) {
      booksByTitle[key] = books[key];
    }
  }
  if (Object.keys(booksByTitle).length > 0) {
    return res.status(200).send(JSON.stringify(booksByTitle, null, 4));
  } else {
    return res.status(404).json({ message: "No books found with this title" });
  }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Task 10: Get all books using async/await with Axios
function getAllBooks() {
  return new Promise((resolve, reject) => {
    resolve(books);
  });
}

public_users.get('/async/books', async function (req, res) {
  try {
    const allBooks = await getAllBooks();
    return res.status(200).send(JSON.stringify(allBooks, null, 4));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Task 11: Get book by ISBN using async/await
function getBookByISBN(isbn) {
  return new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject({ message: "Book not found" });
    }
  });
}

public_users.get('/async/isbn/:isbn', async function (req, res) {
  try {
    const book = await getBookByISBN(req.params.isbn);
    return res.status(200).send(JSON.stringify(book, null, 4));
  } catch (error) {
    return res.status(404).json(error);
  }
});

// Task 12: Get books by author using Promise callbacks
function getBooksByAuthor(author) {
  return new Promise((resolve, reject) => {
    const result = {};
    for (let key in books) {
      if (books[key].author === author) {
        result[key] = books[key];
      }
    }
    if (Object.keys(result).length > 0) {
      resolve(result);
    } else {
      reject({ message: "No books found for this author" });
    }
  });
}

public_users.get('/async/author/:author', function (req, res) {
  getBooksByAuthor(req.params.author)
    .then(data => res.status(200).send(JSON.stringify(data, null, 4)))
    .catch(err => res.status(404).json(err));
});

// Task 13: Get books by title using async/await
async function getBooksByTitle(title) {
  return new Promise((resolve, reject) => {
    const result = {};
    for (let key in books) {
      if (books[key].title === title) {
        result[key] = books[key];
      }
    }
    if (Object.keys(result).length > 0) {
      resolve(result);
    } else {
      reject({ message: "No books found with this title" });
    }
  });
}

public_users.get('/async/title/:title', async function (req, res) {
  try {
    const data = await getBooksByTitle(req.params.title);
    return res.status(200).send(JSON.stringify(data, null, 4));
  } catch (error) {
    return res.status(404).json(error);
  }
});

module.exports.general = public_users;
