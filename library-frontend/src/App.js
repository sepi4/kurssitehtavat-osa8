import React, { useState } from 'react'

import { useApolloClient } from 'react-apollo'
import { useQuery, useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'

import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Login from './components/Login'

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
          <Books
            result={allBooks}
            me={me}
            type='recommend'
          />
        )
      case 'authors':
        return ( 
          <Authors
            result={allAuthors}
            token={token}
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
    
  // const username = (me.data && me.data.me && !user) 
  //   ? me.data.me.username 
  //   : user
  const username = (me.data && me.data.me) 
    ? me.data.me.username 
    : null

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')} disabled={!token}>add book</button>
        {(token) && <button onClick={() => setPage('recommend')}>recommend</button> }
        {!token ? <button onClick={() => { setPage('login') }}>login</button>
            : <button onClick={() => logout()}>logout {username}</button>
        }
      </div>
      {pageToShow()}    
    </div>
  )
}
export default App
