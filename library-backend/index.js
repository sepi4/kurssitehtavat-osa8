const { ApolloServer, UserInputError, gql } = require('apollo-server')
const mongoose = require('mongoose')
const Book = require('./models/book')
const Author = require('./models/author')
const config = require('./utils/config')

mongoose.set('useFindAndModify', false)

const MONGODB_URI = config.MONGODB_URI

mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

const typeDefs = gql`
  type Query {
    hello: String!
    bookCount: Int!
    authorCount: Int!
    allAuthors: [Author]!
    allBooks(author: String, genre: String): [Book]!
  }

  type Author {
    name: String!
    born: Int
    id: ID
    bookCount: Int
  }
  
  type Book {
    title: String!  
    published: String!  
    author: Author!  
    genres: [String!]!  
    id: ID  
  }

  type Mutation {
    addBook(
      title: String!
      name: String!
      born: Int
      published: Int!
      genres: [String!]!
    ): Book

    editAuthor(
      name: String! 
      setBornTo: Int!
    ): Author
  }
`

const resolvers = {
  Query: {
    hello: () => "hello kissa",
    bookCount: () => Book.countDocuments(),
    authorCount: () => Author.countDocuments(),
    allBooks: async (root, args) => {
      let allBooks = await Book.find({})
      // let allAuthors = await Author.find({})
      // // console.log(allBooks[0])
      // // console.log(allAuthors)

      // allBooks = allBooks.map(book => {
      //   const authorSameId = allAuthors.find(a => a._id.toString() === book.author.toString())
      //   return { 
      //     genres: book.genres,
      //     title: book.title,
      //     published: book.published,
      //     author: authorSameId.name
      //   }
      // })
      // console.log(allBooks)
      return allBooks
    },
    allAuthors: () => Author.find({})
  },
  Author: {
    bookCount: async (a) => {
      const books = await Book.find({author: a._id}) 
      return books.length
    },
  },
  Mutation: {
    addBook: async (root, args) => {
      let author = await Author.findOne({ name: args.name }) //authors.find((a) => a.name === book.author)

      if (!author) {
        author = new Author({ name: args.name })
        await author.save()
      }

      const book = new Book({ ...args, author })
      await book.save()
      return book
    },
    editAuthor: async (root, args) => {
      let author = await Author.findOne({ name: args.name })
      author.born = args.setBornTo
      if (author) {
        try {
          await author.save()
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        }
      }
      return author
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})

