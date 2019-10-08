const { ApolloServer, UserInputError, gql } = require('apollo-server')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')
const config = require('./utils/config')
const { PubSub } = require('apollo-server')

const pubsub = new PubSub()

const JWT_SECRET = config.JWT_SECRET

mongoose.set('useFindAndModify', false)

const MONGODB_URI = config.MONGODB_URI

mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

// allBooks(author: String, genre: String): [Book]!
const typeDefs = gql` 
  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allAuthors: [Author]!
    allBooks: [Book]!
    me: User
    booksOfGenre(genre: String): [Book]!
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

    createUser(
      username: String!
      favoriteGenre: String!
    ): User

    login(
      username: String!
      password: String!
    ): Token
  }

  type Subscription {
    bookAdded: Book!
  }
`

const resolvers = {
  Query: {
    bookCount: () => Book.countDocuments(),
    authorCount: () => Author.countDocuments(),
    allBooks: async () => {
      const allBooks = await Book.find({})
        .populate('author', { name: true })
      return allBooks
    },
    allAuthors: async () => {
      const all = await Author.find({})
      return all
    },
    me: (root, args, context) => {
      return context.currentUser
    },
    booksOfGenre: async (root, args) => {
      // console.log('booksOfGenre args', args)
      let allBooks = await Book.find({})
        .populate('author', { name: true })
      if (args.genre.length !== 0) {
        allBooks = allBooks.filter(b => b.genres.includes(args.genre))
      }
      // console.log('booksOfGenre books', allBooks)
      return allBooks
    }
  },

  Author: {
    bookCount: async (a) => {
      const books = await Book.find({ author: a._id })
      return books.length
    },
  },

  Mutation: {
    addBook: async (root, args, context) => {
      // console.log('addBook')
      if (!context.currentUser) {
        throw new UserInputError('not logged in to add book')
      }

      let author = await Author.findOne({ name: args.name })

      try {
        // console.log('addBook try')
        if (!author) {
          author = new Author({ name: args.name })
        }
        const book = new Book({ ...args, author })
        await book.save()
        // create author only if creation of book is ok
        await author.save()

        pubsub.publish('BOOK_ADDED',
          { bookAdded: book },
        )

        return book
      }
      catch (error) {
        // console.log('addBook catch')
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
    },


    editAuthor: async (root, args, context) => {
      if (!context.currentUser) {
        throw new UserInputError('not logged in to edit author data')
      }
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

    createUser: (root, args) => {
      const user = new User({
        username: args.username,
        favoriteGenre: args.favoriteGenre,
      })


      return user.save()
        .catch(error => {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if ( !user || args.password !== 'secret' ) {
        throw new UserInputError('wrong credentials')
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return {
        value: jwt.sign(userForToken, JWT_SECRET)
      }
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(['BOOK_ADDED']),
    }
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(auth.substring(7), JWT_SECRET)
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  }
})

server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`Server ready at ${url}`)
  console.log(`Subcriptions ready at ${subscriptionsUrl}`)
})

