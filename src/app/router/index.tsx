import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { HomePage } from '@/pages/home'
import { MontyHallPage } from '@/pages/monty-hall'
import { BirthdayProblemPage } from '@/pages/birthday-problem'

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/monty-hall', element: <MontyHallPage /> },
  { path: '/birthday-problem', element: <BirthdayProblemPage /> },
  // 새 역설 추가 시 여기에만 라우트 추가
])

export const AppRouter = () => <RouterProvider router={router} />
