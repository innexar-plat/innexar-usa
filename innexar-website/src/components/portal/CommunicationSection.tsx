'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Paperclip, Link as LinkIcon, Download, ExternalLink, AlertCircle } from 'lucide-react'

interface Message {
  id: number
  sender_type: 'admin' | 'client'
  sender_name: string
  message: string | null
  message_type: string
  files: Array<{ name: string; url: string; size?: number }> | null
  links: Array<{ title: string; url: string; description?: string }> | null
  is_important: boolean
  is_read: boolean
  created_at: string
}

interface CommunicationSectionProps {
  orderId: number
  token: string
}

export default function CommunicationSection({ orderId, token }: CommunicationSectionProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [messageText, setMessageText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const loadMessages = async () => {
    try {
      const response = await fetch(`/api/launch/customer/orders/${orderId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMessages()
    const interval = setInterval(loadMessages, 10000)
    return () => clearInterval(interval)
  }, [orderId, token])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!messageText.trim()) return

    setSending(true)
    try {
      const response = await fetch(`/api/launch/customer/orders/${orderId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: messageText,
          message_type: 'message'
        })
      })

      if (response.ok) {
        setMessageText('')
        loadMessages()
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (loading) {
    return <div className="text-center py-8 text-slate-400">Carregando mensagens...</div>
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages List */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-[300px] max-h-[400px]">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p>Nenhuma mensagem ainda</p>
            <p className="text-sm mt-1">A equipe entrará em contato em breve</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-4 rounded-lg border ${msg.sender_type === 'admin'
                  ? 'bg-blue-500/10 border-blue-500/30'
                  : 'bg-slate-800/50 border-white/10'
                }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{msg.sender_name}</span>
                  {msg.is_important && (
                    <AlertCircle className="w-4 h-4 text-yellow-400" />
                  )}
                  {msg.sender_type === 'admin' && (
                    <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">Equipe</span>
                  )}
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(msg.created_at).toLocaleString('pt-BR')}
                </span>
              </div>

              {msg.message && (
                <p className="text-slate-300 mb-3 whitespace-pre-wrap">{msg.message}</p>
              )}

              {/* Files */}
              {msg.files && msg.files.length > 0 && (
                <div className="space-y-2 mb-3">
                  {msg.files.map((file, idx) => (
                    <a
                      key={idx}
                      href={file.url.startsWith('/api/') ? file.url : file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 bg-white/5 rounded hover:bg-white/10 transition-colors"
                    >
                      <Paperclip className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-blue-400 flex-1">{file.name}</span>
                      {file.size && (
                        <span className="text-xs text-slate-500">{formatFileSize(file.size)}</span>
                      )}
                      <Download className="w-4 h-4 text-slate-400" />
                    </a>
                  ))}
                </div>
              )}

              {/* Links */}
              {msg.links && msg.links.length > 0 && (
                <div className="space-y-2">
                  {msg.links.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-2 p-3 bg-white/5 rounded hover:bg-white/10 transition-colors"
                    >
                      <LinkIcon className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium text-blue-400">{link.title || link.url}</div>
                        {link.description && (
                          <div className="text-sm text-slate-400 mt-1">{link.description}</div>
                        )}
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-white/10 pt-4">
        <div className="flex gap-2">
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 resize-none"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                handleSendMessage()
              }
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={sending || !messageText.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {sending ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-1">Ctrl+Enter para enviar</p>
      </div>
    </div>
  )
}
