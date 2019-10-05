const { ApolloServer, UserInputError, gql } = require('apollo-server')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')
const config = require('./utils/config')

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
    allBooks(author: String, genre: String): [Book]!
    me: User
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
`

const resolvers = {
  Query: {
    bookCount: () => Book.countDocuments(),
    authorCount: () => Author.countDocuments(),
    allBooks: async (root, args) => {
      const allBooks = await Book.find({})
        .populate('author', { name: true })
      return allBooks
    },
    allAuthors: () => Author.find({}),
    me: (root, args, context) => {
      return context.currentUser
    }
  },
  /*
{
  "Authorization": "bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InNlcGkiLCJpZCI6IjVkOThiYTEwZmMwZDQ2MDlmZGYzNmZhOSIsImlhdCI6MTU3MDI5MTYxM30.0C1ej25oc-xkpfvsxecPekH49DaIhmgkwfiiLnVdsMw"
}
*/

  Author: {
    bookCount: async (a) => {
      const books = await Book.find({ author: a._id })
      return books.length
    },
  },

  Mutation: {
    addBook: async (root, args, context) => {
      // console.log('addBook context.currentUser', context.currentUser)
      if (!context.currentUser) {
        throw new UserInputError('not logged in')
      }

      let author = await Author.findOne({ name: args.name })

      try {
        if (!author) {
          author = new Author({ name: args.name })
        }
        const book = new Book({ ...args, author })
        await book.save()

        // create author only if creation of book is ok
        await author.save()
        return book
      }
      catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
    },

    editAuthor: async (root, args, context) => {
      if (!context.currentUser) {
        throw new UserInputError('not logged in')
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

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})

