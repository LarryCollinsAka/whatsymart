'use client'

import React from 'react'
import Link from 'next/link'
import { WifiOff, RotateCcw } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/context'

export default function OfflinePage() {
  const { t, locale } = useTranslation()

  const isFr = locale === 'fr'
  const isEs = locale === 'es'
  const isPt = locale === 'pt'
  const isNl = locale === 'nl'

  const title = isFr
    ? 'Vous êtes hors ligne'
    : isEs
    ? 'Está sin conexión'
    : isPt
    ? 'Você está offline'
    : isNl
    ? 'U bent offline'
    : 'You are currently offline'

  const desc = isFr
    ? 'WhatsyMart fonctionne toujours pour consulter les pages déjà visitées. Vérifiez votre connexion pour effectuer des commandes.'
    : isEs
    ? 'WhatsyMart sigue funcionando para consultar páginas visitadas. Compruebe su conexión para realizar pedidos.'
    : isPt
    ? 'O WhatsyMart continua funcionando para navegar pelas páginas em cache. Verifique sua conexão para fazer pedidos.'
    : isNl
    ? 'WhatsyMart werkt nog steeds om eerder bezochte pagina’s te bekijken. Controleer uw verbinding om bestellingen te plaatsen.'
    : 'WhatsyMart remains accessible for browsing cached catalog items. Check your internet connection to place live orders.'

  const retryText = isFr ? 'Réessayer' : isEs ? 'Reintentar' : isPt ? 'Tentar novamente' : isNl ? 'Opnieuw proberen' : 'Try Again'
  const homeText = isFr ? 'Retour à l’accueil' : isEs ? 'Volver al inicio' : isPt ? 'Voltar ao início' : isNl ? 'Terug naar start' : 'Back to Home'

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4 text-emerald-800">
        <WifiOff className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-black text-gray-900 mb-2">{title}</h1>
      <p className="text-gray-500 max-w-sm text-sm mb-6">
        {desc}
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={() => {
            if (typeof window !== 'undefined') window.location.reload()
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 text-white font-semibold text-sm shadow hover:bg-emerald-900 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          {retryText}
        </button>
        <Link
          href="/"
          className="inline-flex items-center px-5 py-2.5 rounded-xl bg-white text-gray-700 font-semibold text-sm border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          {homeText}
        </Link>
      </div>
    </div>
  )
}
