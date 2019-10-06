import React from 'react'
function BooksTable(props) {
  return (
    <table>
      <tbody>
        <tr>
          <th></th><th>author</th><th>published</th>
        </tr>
        {props.books.map(a =>
          <tr key={a.title}>
            <td>{a.title}</td>
            <td>{a.author.name}</td>
            <td>{a.published}</td>
          </tr>
        )}
      </tbody>
    </table>
  )
}
export default BooksTable
