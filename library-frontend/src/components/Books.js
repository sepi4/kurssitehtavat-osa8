import React, { useState } from 'react'
import BooksTable from './BooksTable'

const Books = (props) => {
  const [genre, setGenre] = useState(null)

  const books = props.result.data.allBooks
  if (!books) {
    return null
  }

  let genres = books.reduce( (pre, cur) => pre.concat(cur.genres), [])
  genres = genres.filter((x, i) => genres.indexOf(x) === i)

  const filteredBooks = (books) => {
    if (!genre) {
      return books
    }
    return books.filter(x => x.genres.indexOf(genre) > -1)
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
        <BooksTable books={filteredBooks(books)} />
        <p>current genre: <strong>{genre ? genre : 'ALL'}</strong></p>
        <button onClick={() => setGenre(null)}>all genres</button>
        {genres.map(g =>
          <button key={g} onClick={() => setGenre(g)}>{g}</button>
        )}
      </div>
    )
  }
}

export default Books
