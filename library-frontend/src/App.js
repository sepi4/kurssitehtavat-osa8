import React, { useState } from 'react'

import { Query, ApolloConsumer, Mutation, useApolloClient } from 'react-apollo'
import { gql } from 'apollo-boost'

import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Login from './components/Login'


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
  // console.log('client', client)
  // console.log('token', token)

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')} disabled={!token}>add book</button>
        {!token
            ? <button onClick={() => setPage('login')}>login</button>
            : <button onClick={() => logout()}>logout</button>
        }
      </div>
      <ApolloConsumer>
        {client => (
          <>
            <Query query={ALL_AUTHORS}>
              {result => (
                <Authors
                  result={result}
                  client={client}
                  show={page === 'authors'}
                  ALL_AUTHORS={ALL_AUTHORS}
                  token={token}
                />
              )}
            </Query>

            <Query query={ALL_BOOKS}>
              {result => (
                <Books
                  result={result}
                  client={client}
                  show={page === 'books'}
                />
              )}
            </Query>
          </>
        )}
      </ApolloConsumer>

      <Mutation 
        mutation={ADD_BOOK} 
        refetchQueries={[{ query: ALL_BOOKS }]}
      >
        {addBook => <NewBook show={page === 'add'} addBook={addBook} />}
      </Mutation>

      <Mutation
        mutation={LOGIN}
        refetchQueries={[{ query: ALL_AUTHORS }]}
      >
        {login => <Login 
          login={login} 
          show={page === 'login'} 
          setToken={setToken}
          setPage={setPage}
        /> }
      </Mutation>

    </div>
  )
}
export default App
