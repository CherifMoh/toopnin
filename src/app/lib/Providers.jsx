"use client"

import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'


function Providers({children}) {
    const [queryClient] =useState(()=>new QueryClient())
  return (
    <QueryClientProvider client={queryClient}>
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
        {children}
    </QueryClientProvider>
  )
}

export default Providers