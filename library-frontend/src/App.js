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

//  <ApolloConsumer>
//    {(client =>
//      <Query query={ALL_PERSONS}>
//        {(result) =>
//          <Persons result={result} client={client} />
//        }
//      </Query>
//    )}
//  </ApolloConsumer>

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
          <Query query={ALL_AUTHORS}>
            {result =>
              <Authors 
                result={result} 
                client={client} 
                show={page === 'authors'} 
              />
            }
          </Query>
        }
      </ApolloConsumer>


      <Books
        show={page === 'books'}
      />

      <NewBook
        show={page === 'add'}
      />

    </div>
  )
}

export default App
