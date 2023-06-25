import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { mode } from '@chakra-ui/theme-tools'
import { RouterProvider } from 'react-router-dom'
import router from './routing/routes'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3
    }
  }
});

interface Props {
  colorMode: string;
}

const customTheme = extendTheme({
  styles: {
    global: (props: Props) => ({
      body: {
        bg: mode("#150A2A", "#150A2A")(props), // Replace "your-custom-color" with your desired color
      },
    }),
  },
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ChakraProvider theme={customTheme}>
      <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          <ReactQueryDevtools/>
      </QueryClientProvider>
    </ChakraProvider>
  </React.StrictMode>,
)
