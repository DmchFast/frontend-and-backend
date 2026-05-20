import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

// Схема
const typeDefs = `#graphql
  type Author {
    id: ID!
    name: String!
    email: String!
    books: [Book!]!
  }

  type Book {
    id: ID!
    title: String!
    genre: String
    author: Author!
  }

  type Query {
    books: [Book!]!
    book(id: ID!): Book
    authors: [Author!]!
  }

  type Mutation {
    addBook(title: String!, genre: String, authorId: ID!): Book!
    addAuthor(name: String!, email: String!): Author!
  }
`;

// Данные в памяти
let authors = [
  { id: '1', name: 'Лев Толстой', email: 'tolstoy@example.com' },
  { id: '2', name: 'Фёдор Достоевский', email: 'dostoevsky@example.com' },
];

let books = [
  { id: '1', title: 'Война и мир', genre: 'Роман-эпопея', authorId: '1' },
  { id: '2', title: 'Анна Каренина', genre: 'Роман', authorId: '1' },
  { id: '3', title: 'Преступление и наказание', genre: 'Роман', authorId: '2' },
];

// Резолверы
const resolvers = {
  Query: {
    books: () => books,
    book: (_, { id }) => books.find(book => book.id === id),
    authors: () => authors,
  },
  Mutation: {
    addAuthor: (_, { name, email }) => {
      const newAuthor = {
        id: String(authors.length + 1),
        name,
        email,
      };
      authors.push(newAuthor);
      return newAuthor;
    },
    addBook: (_, { title, genre, authorId }) => {
      const authorExists = authors.some(author => author.id === authorId);
      if (!authorExists) {
        throw new Error(`Автор с id ${authorId} не найден`);
      }
      const newBook = {
        id: String(books.length + 1),
        title,
        genre: genre || null,
        authorId,
      };
      books.push(newBook);
      return newBook;
    },
  },
  Book: {
    author: (parent) => authors.find(author => author.id === parent.authorId),
  },
  Author: {
    books: (parent) => books.filter(book => book.authorId === parent.id),
  },
};

// Запуск сервера
const startServer = async () => {
  const server = new ApolloServer({ typeDefs, resolvers });
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });
  console.log(`GraphQL сервер: ${url}`);
};

startServer();