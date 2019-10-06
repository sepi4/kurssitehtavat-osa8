import React from 'react'
import SetAuthor from './SetAuthor'
import { Mutation } from 'react-apollo'
import { gql } from 'apollo-boost'

const UPDATE_BIRTHYEAR = gql`
mutation(
  $name: String!,
  $born: Int!
) {
  editAuthor(
    name: $name, 
    setBornTo: $born
  ) {
    name
    born
  }
}
`

const Authors = (props) => {
  if (!props.show || !props.result.data) {
    return null
  }

  const authors = props.result.data.allAuthors
  if (authors === undefined) {
    return null
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
          {authors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          )}
        </tbody>
      </table>

      <Mutation
        mutation={UPDATE_BIRTHYEAR}
        refetchQueries={[{ query: props.ALL_AUTHORS }]}
      >
        {updateBirthyear => 
          <SetAuthor
            updateBirthyear={updateBirthyear}
            authors={authors}
            token={props.token}
          />
        }
      </Mutation>

    </div>
  )
}

export default Authors
