import { nanoid } from 'nanoid';

// Array in-memory untuk menyimpan data buku
const books = [];

// Menambah buku baru
const addBookHandler = (request, h) => {
  const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;

  // Cek jika nama buku tidak disertakan
  if (!name) {
    return h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku',
    }).code(400);
  }

  // Cek jika nilai readPage lebih besar dari pageCount
  if (readPage > pageCount) {
    return h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
    }).code(400);
  }

  // Menambahkan buku baru
  const id = nanoid();
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;
  const finished = readPage === pageCount;

  const newBook = {
    id, name, year, author, summary, publisher, pageCount, readPage, finished, reading, insertedAt, updatedAt,
  };

  books.push(newBook);

  return h.response({
    status: 'success',
    message: 'Buku berhasil ditambahkan',
    data: { bookId: id },
  }).code(201);
};

// Mendapatkan semua buku
const getAllBooksHandler = (request, h) => {
  let filteredBooks = books;

  const { name, reading, finished } = request.query;

  // Filter berdasarkan nama (tidak peka huruf besar/kecil)
  if (name) {
    filteredBooks = filteredBooks.filter((book) =>
      book.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  // Filter berdasarkan status membaca
  if (reading !== undefined) {
    const isReading = reading === '1';
    filteredBooks = filteredBooks.filter((book) => book.reading === isReading);
  }

  // Filter berdasarkan status selesai
  if (finished !== undefined) {
    const isFinished = finished === '1';
    filteredBooks = filteredBooks.filter((book) => book.finished === isFinished);
  }

  // Mengambil hanya id, name, dan publisher dalam respons
  const responseBooks = filteredBooks.map(({ id, name, publisher }) => ({ id, name, publisher }));

  return h.response({
    status: 'success',
    data: { books: responseBooks },
  }).code(200);
};

// Mendapatkan satu buku berdasarkan ID
const getBookByIdHandler = (request, h) => {
  const { bookId } = request.params;
  const book = books.find((b) => b.id === bookId);

  if (!book) {
    return h.response({
      status: 'fail',
      message: 'Buku tidak ditemukan',
    }).code(404);
  }

  return {
    status: 'success',
    data: { book },
  };
};

// Mengubah data buku berdasarkan ID
const updateBookHandler = (request, h) => {
  const { bookId } = request.params;
  const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;

  const bookIndex = books.findIndex((b) => b.id === bookId);

  if (bookIndex === -1) {
    return h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Id tidak ditemukan',
    }).code(404);
  }

  // Cek jika nama buku tidak disertakan
  if (!name) {
    return h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku',
    }).code(400);
  }

  // Cek jika nilai readPage lebih besar dari pageCount
  if (readPage > pageCount) {
    return h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
    }).code(400);
  }

  // Mengubah detail buku
  books[bookIndex] = {
    ...books[bookIndex],
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
    finished: readPage === pageCount,
    updatedAt: new Date().toISOString(),
  };

  return {
    status: 'success',
    message: 'Buku berhasil diperbarui',
  };
};

// Menghapus buku berdasarkan ID
const deleteBookHandler = (request, h) => {
  const { bookId } = request.params;
  const bookIndex = books.findIndex((book) => book.id === bookId);

  if (bookIndex === -1) {
    return h.response({
      status: 'fail',
      message: 'Buku gagal dihapus. Id tidak ditemukan',
    }).code(404);
  }

  books.splice(bookIndex, 1);

  return {
    status: 'success',
    message: 'Buku berhasil dihapus',
  };
};

// Definisikan rute
const routes = [
  { method: 'POST', path: '/books', handler: addBookHandler },
  { method: 'GET', path: '/books', handler: getAllBooksHandler },
  { method: 'GET', path: '/books/{bookId}', handler: getBookByIdHandler },
  { method: 'PUT', path: '/books/{bookId}', handler: updateBookHandler },
  { method: 'DELETE', path: '/books/{bookId}', handler: deleteBookHandler },
];

export default routes;
