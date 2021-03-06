import React, { useState, useEffect } from 'react'
import BooksTable from './BooksTable'
import gql from 'graphql-tag'
import { useApolloClient } from '@apollo/react-hooks'


const BOOKS_OF_GENRE = gql`
 query ($genre: String) {
   booksOfGenre(genre: $genre){
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

function Books(props) {
  const client = useApolloClient()
  
  const [genre, setGenre] = useState(null)
  const [books, setBooks] = useState([])

  useEffect(() => {
    setBooks(props.result.data.allBooks)
    return () => {
      console.log('should be cleaning here')
    }
  }, [props.result.data.allBooks])

  if (!props.result.data && !props.result.data.allBooks) {
    return null
  }


  const allBooks = props.result.data.allBooks

  let genres = allBooks.reduce( (pre, cur) => pre.concat(cur.genres), [])
  genres = genres.filter((x, i) => genres.indexOf(x) === i)


  const fetchFilteredBooks = async (g) => {
    const {data} = await client.query({
      query: BOOKS_OF_GENRE,
      variables: { genre: g },
      fetchPolicy: 'no-cache'
    })
    setBooks(data.booksOfGenre)
  }


  return (
    <div>
      <h2>books</h2>
      <BooksTable books={books} />
      <p>current genre: <strong>{genre ? genre : 'ALL'}</strong></p>
      <button onClick={() => fetchFilteredBooks('')}>all genres</button>
      {genres.map(g =>
        <button key={g} onClick={() => {
          setGenre(g)
          fetchFilteredBooks(g)
        }}>{g}</button>
      )}
    </div>
  )
}

export default Books
