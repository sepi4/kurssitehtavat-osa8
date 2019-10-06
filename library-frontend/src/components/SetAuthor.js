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

      setName('')
      setBorn('')
    }
    catch (err) {
      console.log(err)
    }
  }

  return (
    <div>
      <h3>Set birthyear</h3>
      <form onSubmit={submit}>
        <div>
          name
          <select 
            value={name} 
            onChange={({target}) => setName(target.value)}
          >
            <option defaultValue disabled hidden></option>
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
        <button type='submit' disabled={!props.token}>update author</button>
      </form>
    </div>
  )
}

export default SetAuthor
