import React, { useState } from 'react'

import { 
  useQuery, 
  useMutation, 
  // useApolloClient,
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
    }
  }
`

const ALL_BOOKS = gql`
  {
    allBooks {
      title
      published
      author {
        name
      }
      genres
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
  const [token, setToken] = useState(localStorage.getItem('library-app-user-token'))
  const [page, setPage] = useState('authors')


  // const client = useApolloClient()

  const logout = () => {
    setToken(null)
    localStorage.clear()
    // client.resetStore()
  }

  const allBooks = useQuery(ALL_BOOKS)
  const allAuthors = useQuery(ALL_AUTHORS)
  const me = useQuery(ME)
  const [login] = useMutation(LOGIN)
  const [addBook] = useMutation(ADD_BOOK, {
    onError: () => console.log('error in addBook useMutation'),
    update: (store, response) => {
      const dataInStore = store.readQuery({ query: ALL_BOOKS })
      dataInStore.allBooks.push(response.data.addBook)
      store.writeQuery({
        query: ALL_BOOKS,
        data: dataInStore
      })
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

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const title = subscriptionData.data.bookAdded.title
      window.alert(`new book added: '${title}'`)
    }
  })
    
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
      {pageToShow()}    
    </div>
  )
}
export default App
