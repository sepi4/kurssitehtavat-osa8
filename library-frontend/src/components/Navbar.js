import React from 'react'

const Navbar = ({setPage, token, logout, username}) => {
  return (
    <div>
      <button onClick={() => setPage('authors')}>authors</button>
      <button onClick={() => setPage('books')}>books</button>
      <button onClick={() => setPage('add')} disabled={!token}>add book</button>

      {(token) && <button onClick={() => setPage('recommend')}>recommend</button> }

      {!token 
          ? <button onClick={() => { setPage('login') }}>login</button>
          : <button onClick={() => logout()}>logout {username}</button>
      }
    </div>
  )
}

export default Navbar
