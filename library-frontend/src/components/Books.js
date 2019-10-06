import React, { useState } from 'react'

const Books = (props) => {
  const [genre, setGenre] = useState(null)

  if (!props.show || !props.result.data) {
    return null
  }

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


  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          {filteredBooks(books).map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          )}
        </tbody>
      </table>
      <div>
        <p>current genre: <strong>{genre}</strong></p>
        {genres.map(g =>
          <button key={g} onClick={() => setGenre(g)}>{g}</button>
        )}
      </div>
    </div>
  )
}

export default Books
