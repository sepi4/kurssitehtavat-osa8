import React, { useState } from 'react'

import { Query, ApolloConsumer } from 'react-apollo'
import { gql } from 'apollo-boost'

import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'

const ALL_AUTHORS = gql`{
  allAuthors {
    name
    born
    bookCount
  }
}
`
const ALL_BOOKS = gql`{
  allBooks {
    title
    published
    author
  }
}
`

const App = () => {
  const [page, setPage] = useState('authors')

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
      </div>
      <ApolloConsumer>
        {client => 
          <>

            <Query query={ALL_AUTHORS}>
              {result =>
                <Authors 
                  result={result} 
                  client={client} 
                  show={page === 'authors'} 
                />
              }
            </Query>

            <Query query={ALL_BOOKS}>
              {result =>
                <Books
                  result={result} 
                  client={client} 
                  show={page === 'books'}
                />
              }
            </Query>
          </>
        }
      </ApolloConsumer>



      <NewBook
        show={page === 'add'}
      />

    </div>
  )
}

export default App
