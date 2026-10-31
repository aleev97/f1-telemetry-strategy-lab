import type { ComponentType } from 'react'
import { createBrowserRouter } from 'react-router'
import { Layout } from '@/components/layout/layout'
import OverviewPage from '@/pages/overviewpage'
import RouteError from '@/pages/routeerror'

/** Carga diferida: el código de cada pantalla se descarga solo al visitarla */
const lazyPage = (load: () => Promise<{ default: ComponentType }>) => async () => ({
  Component: (await load()).default,
})

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        // Ruta sin path: captura errores de las páginas y deja el Layout (navbar) visible
        errorElement: <RouteError />,
        children: [
          { index: true, element: <OverviewPage />, handle: { title: 'Calendario' } },
          {
            path: 'telemetry',
            lazy: lazyPage(() => import('@/pages/telemetrypage')),
            handle: { title: 'Telemetría' },
          },
          {
            path: 'strategy-lab',
            lazy: lazyPage(() => import('@/pages/strategylabpage')),
            handle: { title: 'Strategy Lab' },
          },
          {
            path: 'race/:round',
            lazy: lazyPage(() => import('@/pages/racedetailpage')),
            handle: { title: 'Detalle de carrera' },
          },
          {
            path: '*',
            lazy: lazyPage(() => import('@/pages/notfoundpage')),
            handle: { title: 'No encontrada' },
          },
        ],
      },
    ],
  },
])