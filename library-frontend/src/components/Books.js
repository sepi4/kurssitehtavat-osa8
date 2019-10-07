import React, { useState, useEffect } from 'react'
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

function Books(props) {
  const client = useApolloClient()
  
  const [genre, setGenre] = useState(null)
  const [books, setBooks] = useState([])

  useEffect(() => {
    setBooks(props.result.data.allBooks)
  }, [props.result.data.allBooks])

  if (!props.result.data.allBooks) {
    return null
  }
  const allBooks = props.result.data.allBooks

  let genres = allBooks.reduce( (pre, cur) => pre.concat(cur.genres), [])
  genres = genres.filter((x, i) => genres.indexOf(x) === i)


  const fetchFilteredBooks = async (g) => {
    setGenre(g)
    const {data} = await client.query({
      query: BOOKS_OF_GENRE,
      variables: { genre: g }
    })
    setBooks(data.booksOfGenre)
  }


  if (props.type === 'recommend' && props.me.data.me) {
    const favoriteGenre = props.me.data.me.favoriteGenre
    return (
      <div>
        <h2>recommends</h2>
        <BooksTable books={books.filter(b => b.genres.includes(favoriteGenre))} />
        <p>current genre: <strong>{favoriteGenre}</strong></p>
      </div>
    )
  }
  else {
    return (
      <div>
        <h2>books</h2>
        <BooksTable books={books} />
        <p>current genre: <strong>{genre ? genre : 'ALL'}</strong></p>
        <button onClick={() => fetchFilteredBooks('')}>all genres</button>
        {genres.map(g =>
          <button key={g} onClick={() => fetchFilteredBooks(g)}>{g}</button>
        )}
      </div>
    )
  }
}

export default Books
