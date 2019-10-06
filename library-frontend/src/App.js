import React, { useState } from 'react'

import { Query, ApolloConsumer, Mutation } from 'react-apollo'
import { gql } from 'apollo-boost'

import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'

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

const App = () => {
  const [token, setToken] = useState(null)
  const [page, setPage] = useState('authors')



  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
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

      <Mutation mutation={ADD_BOOK} refetchQueries={[{ query: ALL_BOOKS }]}>
        {addBook => <NewBook show={page === 'add'} addBook={addBook} />}
      </Mutation>
    </div>
  )
}
export default App
