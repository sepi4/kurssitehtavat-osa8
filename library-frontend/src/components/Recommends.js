import React, {useEffect, useState} from 'react'
import BooksTable from './BooksTable'
import gql from 'graphql-tag'
import { useApolloClient } from '@apollo/react-hooks'

const BOOKS_OF_GENRE = gql`
 query ($genre: String) {
   booksOfGenre(genre: $genre){
     title
     published
     author {
       name
     }
     genres
   }
 }
`

const Recommends = (props) => {
  const [books, setBooks] = useState([])
  const client = useApolloClient()
  

  const favoriteGenre = props.me.data.me.favoriteGenre
  useEffect(() => {
    const fetchFilteredBooks = async (g) => {
      const {data} = await client.query({
        query: BOOKS_OF_GENRE,
        variables: { genre: g },
        fetchPolicy: 'no-cache'
      })
      setBooks(data.booksOfGenre)
    }
    fetchFilteredBooks(favoriteGenre)
  }, [client, favoriteGenre])

  return (
    <div>
      <h2>recommends</h2>
      <BooksTable books={books} />

      <p>current genre: <strong>{favoriteGenre}</strong></p>
    </div>
  )
}

export default Recommends
