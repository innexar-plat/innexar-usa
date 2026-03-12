'use client'

import { useState, useEffect, useRef } from 'react'
import { useLocale } from 'next-intl'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const AIChat = () => {
  const locale = useLocale()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Gerar ou recuperar session_id do localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let storedSessionId = localStorage.getItem('helena_session_id')
      if (!storedSessionId) {
        // Use crypto.randomUUID with fallback for compatibility
        storedSessionId = typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
        localStorage.setItem('helena_session_id', storedSessionId)
      }
      setSessionId(storedSessionId)
    }
  }, [])

  // Detectar idioma do navegador
  const getBrowserLanguage = () => {
    if (typeof window === 'undefined') return locale
    const browserLang = navigator.language || (navigator as any).userLanguage
    if (browserLang.startsWith('pt')) return 'pt'
    if (browserLang.startsWith('es')) return 'es'
    return 'en'
  }

  // Formatar conteúdo da mensagem (converter markdown para HTML)
  const formatMessageContent = (content: string) => {
    // Converter links markdown [text](url) para HTML
    let formatted = content.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">$1</a>'
    )
    // Converter **bold** para HTML
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // Converter *italic* para HTML (mas não se for **)
    formatted = formatted.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')
    // Converter URLs simples para links clicáveis
    formatted = formatted.replace(
      /(?<!href="|>)(https?:\/\/[^\s<]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">$1</a>'
    )
    return formatted
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Mensagem inicial baseada no idioma do SITE (não do browser)
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Usar locale do site (da URL) em vez do browser
      const lang = locale || 'en'
      const welcomeMessages: Record<string, string> = {
        pt: 'Olá! Sou Helena, assistente virtual da Innexar. Como posso ajudá-lo hoje?',
        es: '¡Hola! Soy Helena, asistente virtual de Innexar. ¿Cómo puedo ayudarte hoy?',
        en: 'Hello! I\'m Helena, Innexar\'s virtual assistant. How can I help you today?'
      }
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: welcomeMessages[lang] || welcomeMessages.en,
        timestamp: new Date()
      }])
    }
  }, [isOpen, locale])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          session_id: sessionId,
          language: locale || 'en',
          context: {
            source: 'website',
            page: typeof window !== 'undefined' ? window.location.pathname : '/',
            visitor_hash: typeof window !== 'undefined' ? btoa(navigator.userAgent).slice(0, 32) : ''
          }
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao comunicar com a IA')
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || data.message || (getBrowserLanguage() === 'pt'
          ? 'Desculpe, não consegui processar sua mensagem.'
          : getBrowserLanguage() === 'es'
            ? 'Lo siento, no pude procesar tu mensaje.'
            : 'Sorry, I couldn\'t process your message.'),
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getBrowserLanguage() === 'pt'
          ? 'Desculpe, ocorreu um erro. Por favor, tente novamente ou entre em contato conosco através do formulário.'
          : getBrowserLanguage() === 'es'
            ? 'Lo siento, ocurrió un error. Por favor, intente nuevamente o contáctenos a través del formulario.'
            : 'Sorry, an error occurred. Please try again or contact us through the form.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Botão Flutuante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[9999] bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full p-4 shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center group hover:scale-110 active:scale-95"
        style={{
          width: isOpen ? '48px' : 'auto',
          height: '48px',
          minWidth: '48px'
        }}
        aria-label="Abrir chat com IA"
      >
        {isOpen ? (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg className="h-6 w-6 mr-2 group-hover:animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="hidden sm:inline-block font-semibold">Helena</span>
          </>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed z-[9998] bg-white shadow-2xl flex flex-col overflow-hidden border border-gray-200 inset-0 sm:inset-auto sm:bottom-24 sm:right-6 sm:rounded-2xl sm:w-full sm:max-w-md sm:h-[500px] md:h-[600px]"
          style={{
            animation: 'slideUp 0.3s ease-out'
          }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg">Helena</h3>
                <p className="text-xs text-blue-100">Assistente Virtual IA</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-blue-100 transition-colors"
              aria-label="Fechar chat"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                style={{
                  animation: 'fadeIn 0.3s ease-out'
                }}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-900 shadow-sm border border-gray-200'
                    }`}
                >
                  <div
                    className="text-sm whitespace-pre-wrap break-words prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }}
                  />
                  <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-900 rounded-2xl px-4 py-3 shadow-sm border border-gray-200">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  getBrowserLanguage() === 'pt'
                    ? 'Digite sua mensagem...'
                    : getBrowserLanguage() === 'es'
                      ? 'Escribe tu mensaje...'
                      : 'Type your message...'
                }
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl px-4 py-2 transition-colors flex items-center justify-center"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              {getBrowserLanguage() === 'pt'
                ? 'Helena pode ajudar com informações sobre nossos serviços e projetos.'
                : getBrowserLanguage() === 'es'
                  ? 'Helena puede ayudar con información sobre nuestros servicios y proyectos.'
                  : 'Helena can help with information about our services and projects.'}
            </p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </>
  )
}

export default AIChat
