import React, { useState } from 'react'

import { 
  useQuery, 
  useMutation, 
  useApolloClient,
  useSubscription,
} from '@apollo/react-hooks'

import gql from 'graphql-tag'

import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Login from './components/Login'
import Navbar from './components/Navbar'
import Recommends from './components/Recommends'

const BOOK_ADDED = gql`
subscription {
  bookAdded {
      title
      author {
        name
        born
      }
      published
      genres
      id
    }
}
`

const ME = gql`
  {
    me {
      username
      favoriteGenre
    }
  }
`

const ALL_AUTHORS = gql`
  {
    allAuthors {
      name
      born
      bookCount
      id
    }
  }
`

const ALL_BOOKS = gql`
  {
    allBooks {
      title
      author {
        name
        born
      }
      published
      genres
      id
    }
  }
`

const ADD_BOOK = gql`
  mutation(
    $title: String!
    $author: String!
    $published: Int!
    $genres: [String!]!
  ) {
    addBook(
      title: $title
      name: $author
      born: null
      published: $published
      genres: $genres
    ) {
      title
      author {
        name
        born
      }
      published
      genres
      id
    }
  }
`
const LOGIN = gql`
  mutation login(
    $username: String!, 
    $password: String!
  ) {
    login(
      username: $username, 
      password: $password)  
    {
      value
    }
  }
`

const App = () => {
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [token, setToken] = useState(localStorage
    .getItem('library-app-user-token')
  )
  const [page, setPage] = useState('authors')

  const notify = (message) => {
    setMessage(message)
    setTimeout(() => {
      setMessage(null)
    }, 5000)
  }
  const handleError = (error) => {
    // console.log(Object.keys(error))
    setError(error['message'])
    setTimeout(() => {
      setError(null)
    }, 5000)
  }

  const client = useApolloClient()

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  const allBooks = useQuery(ALL_BOOKS)
  const allAuthors = useQuery(ALL_AUTHORS)
  const me = useQuery(ME)
  const [login] = useMutation(LOGIN)

  const updateCacheWith = (addedBook) => {

    const dataInStore = client.readQuery({ query: ALL_BOOKS })
    // console.log(addedBook)
    // console.log(dataInStore)
    const alreadyInArr = (arr, object) => 
      arr.map(p => p.id).includes(object.id)
    // console.log(alreadyInArr)
    
    if (!alreadyInArr(dataInStore.allBooks, addedBook)) {
      dataInStore.allBooks.push(addedBook)
      client.writeQuery({
        query: ALL_BOOKS,
        data: dataInStore,
      })
    }

  }

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const addedBook= subscriptionData.data.bookAdded
      notify(`new book added ${addedBook.title}`)
      updateCacheWith(addedBook)
    }
  })

  const [addBook] = useMutation(ADD_BOOK, {
    onError: (err) => handleError(err),
    update: (store, response) => {

      // const dataInStore = store.readQuery({ query: ALL_BOOKS })
      // dataInStore.allBooks.push(response.data.addBook)
      // store.writeQuery({
      //   query: ALL_BOOKS,
      //   data: dataInStore
      // })

      updateCacheWith(response.data.addBook)
    }
  })

  

  const pageToShow = () => {
    switch (page) {
      case 'books':
        return (
          <Books
            result={allBooks}
            type='books'
          />
        )
      case 'recommend':
        return (
          <Recommends
            me={me}
          />
        )
      case 'authors':
        return ( 
          <Authors
            result={allAuthors}
            token={token}
            ALL_AUTHORS={ALL_AUTHORS}
          />
        )
      case 'add':
        return (
          <NewBook 
            addBook={addBook}
          />
        )
      case 'login':
        return (
          <Login 
            setToken={setToken}
            setPage={setPage}
            login={login}
            me={me}
          />
        )
      default:
        return null
    }
  }

    
  const username = (me.data && me.data.me) 
    ? me.data.me.username 
    : null

  return (
    <div>

      <Navbar 
        setPage={setPage}
        token={token}
        username={username}
        logout={logout}
      />
      {message && <p style={{color: 'green'}}>{message}</p>}
      {error && <p style={{color: 'red'}}>{error}</p>}
      {pageToShow()}    
    </div>
  )
}
export default App
