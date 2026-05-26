
import { useEffect, useState } from 'react'
import { API_ROOT } from '../../Config'

interface SseEvento {
  id: number
  tipoEvento: string
  severidad: string
  fechaHora: string
  zonaId: number
  sensorId: number | null
  payload: string
}

export const useSseEventos = () => {
  const [eventos, setEventos] = useState<SseEvento[]>([])
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
const eventSource = new EventSource(`${API_ROOT}/api/sse/jardin`)

    eventSource.addEventListener('init', ()=>{
        setConnected(true)
    })

    eventSource.addEventListener('evento', (event) => {
      try {
        const nuevoEvento: SseEvento = JSON.parse(event.data)
        console.log('📡 Evento recibido:', nuevoEvento)
        
        // Agregar al inicio de la lista
        setEventos(prev => [nuevoEvento, ...prev])
      } catch (e) {
        console.error('Error parseando evento SSE:', e)
      }
    })

    eventSource.addEventListener('raw', (event) => {
      console.log('📡 Datos raw:', event.data)
    })

    eventSource.onopen = () => {
      console.log('✅ SSE conectado')
      setConnected(true)
      setError(null)
    }

    eventSource.onerror = (e) => {
      console.error('❌ Error SSE:', e)
      setConnected(false)
      setError('Desconectado del servidor')
      eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }, [])

  return { eventos, connected, error }
}
