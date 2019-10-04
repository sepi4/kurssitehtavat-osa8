import React, { useState } from 'react'

const SetAuthor = (props) => {
  const [name, setName] = useState('')
  const [born, setBorn] = useState('')

  const submit = async (e) => {
    e.preventDefault()

    try {
      await props.updateBirthyear({
        variables: { name, born }
      })
      console.log('update birthyear')

      setName('')
      setBorn('')
    }
    catch {
      console.log('wrong name or born year')
    }
  }

  return (
    <div>
      <h3>Set birthyear</h3>
      <form onSubmit={submit}>
        <div>
          name
          <select value={name} onChange={({target}) => setName(target.value)}>
            {props.authors.map((a, i) => <option key={`${a.name}${i}`} value={a.name}>{a.name}</option>)}
          </select>
        </div>
        <div>
          born
          <input
            type='number'
            value={born}
            onChange={({ target }) => setBorn(Number(target.value))}
          />
        </div>
        <button type='submit'>update author</button>
      </form>
    </div>
  )
}

export default SetAuthor
