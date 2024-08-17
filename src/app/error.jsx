'use client'

function ErrorBoundary({ error }) {
  return (
    <div>{error.message}</div>
  )
}

export default ErrorBoundary