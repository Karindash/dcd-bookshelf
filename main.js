// main.js dengan fitur tambahan: pencarian, edit buku, dan styling

const books = [];
const STORAGE_KEY = 'BOOKSHELF_APPS';
const RENDER_EVENT = 'render-book';

function isStorageExist() {
  return typeof(Storage) !== 'undefined';
}

function saveData() {
  if (isStorageExist()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  if (serializedData !== null) {
    const data = JSON.parse(serializedData);
    books.push(...data);
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year: Number(year),
    isComplete,
  };
}

function findBook(bookId) {
  return books.find(book => book.id === bookId);
}

function findBookIndex(bookId) {
  return books.findIndex(book => book.id === bookId);
}

function makeBookElement(book) {
  const bookContainer = document.createElement('div');
  bookContainer.setAttribute('data-bookid', book.id);
  bookContainer.setAttribute('data-testid', 'bookItem');
  bookContainer.classList.add('book-item');

  const title = document.createElement('h3');
  title.setAttribute('data-testid', 'bookItemTitle');
  title.innerText = book.title;

  const author = document.createElement('p');
  author.setAttribute('data-testid', 'bookItemAuthor');
  author.innerText = `Penulis: ${book.author}`;

  const year = document.createElement('p');
  year.setAttribute('data-testid', 'bookItemYear');
  year.innerText = `Tahun: ${book.year}`;

  const actionContainer = document.createElement('div');
  actionContainer.classList.add('action-buttons');

  const toggleButton = document.createElement('button');
  toggleButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
  toggleButton.innerText = book.isComplete ? 'Belum selesai dibaca' : 'Selesai dibaca';
  toggleButton.addEventListener('click', function () {
    book.isComplete = !book.isComplete;
    saveData();
    document.dispatchEvent(new Event(RENDER_EVENT));
  });

  const deleteButton = document.createElement('button');
  deleteButton.setAttribute('data-testid', 'bookItemDeleteButton');
  deleteButton.innerText = 'Hapus buku';
  deleteButton.addEventListener('click', function () {
    const index = findBookIndex(book.id);
    if (index !== -1) {
      books.splice(index, 1);
      saveData();
      document.dispatchEvent(new Event(RENDER_EVENT));
    }
  });

  const editButton = document.createElement('button');
  editButton.setAttribute('data-testid', 'bookItemEditButton');
  editButton.innerText = 'Edit buku';
  editButton.addEventListener('click', function () {
    const titleInput = prompt('Judul baru:', book.title);
    const authorInput = prompt('Penulis baru:', book.author);
    const yearInput = prompt('Tahun baru:', book.year);

    if (titleInput && authorInput && yearInput) {
      book.title = titleInput;
      book.author = authorInput;
      book.year = Number(yearInput);
      saveData();
      document.dispatchEvent(new Event(RENDER_EVENT));
    }
  });

  actionContainer.append(toggleButton, deleteButton, editButton);
  bookContainer.append(title, author, year, actionContainer);

  return bookContainer;
}

document.addEventListener('DOMContentLoaded', function () {
  const inputBookForm = document.getElementById('bookForm');
  const searchBookForm = document.getElementById('searchBook');

  inputBookForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const title = document.getElementById('bookFormTitle').value;
    const author = document.getElementById('bookFormAuthor').value;
    const year = document.getElementById('bookFormYear').value;
    const isComplete = document.getElementById('bookFormIsComplete').checked;

    const generatedID = generateId();
    const bookObject = generateBookObject(generatedID, title, author, year, isComplete);
    books.push(bookObject);
    saveData();
    document.dispatchEvent(new Event(RENDER_EVENT));
    inputBookForm.reset();
  });

  searchBookForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const query = document.getElementById('searchBookTitle').value.toLowerCase();
    document.dispatchEvent(new CustomEvent(RENDER_EVENT, { detail: { query } }));
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(RENDER_EVENT, function (e) {
  const incompleteBookshelfList = document.getElementById('incompleteBookList');
  const completeBookshelfList = document.getElementById('completeBookList');

  incompleteBookshelfList.innerHTML = '';
  completeBookshelfList.innerHTML = '';

  const query = e.detail?.query || '';

  for (const book of books) {
    const isMatching = book.title.toLowerCase().includes(query);
    if (!isMatching && query !== '') continue;

    const bookElement = makeBookElement(book);
    if (book.isComplete) {
      completeBookshelfList.append(bookElement);
    } else {
      incompleteBookshelfList.append(bookElement);
    }
  }
});
