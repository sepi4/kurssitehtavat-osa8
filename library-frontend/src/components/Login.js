import React, { useState } from 'react'

const Login = (props) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  if (!props.show) {
    return null
  }

  // console.log('login', props)

  const submit = async (e) => {
    e.preventDefault()
    try {
      const result = await props.login({
        variables: { username, password }
      })
      if (result) {
        const token = result.data.login.value
        props.setToken(token)
        localStorage.setItem('library-app-user-token', token)
        props.setPage('authors')
      }
      setUsername('')
      setPassword('')
    }
    catch (err) {
      console.log(err)
    }
  }

  return (
    <div>
      <h3>Login</h3>
      <form onSubmit={submit}>
        <div>
          username
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} />
        </div>
        <div>
          password
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <button type='submit'>login</button>
      </form>
    </div>
  )
}

export default Login
