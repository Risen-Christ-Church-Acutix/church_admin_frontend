"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react"

const ToasterContext = createContext()

// this page needs a lot of changes. try to change them as much as possible or use the existing toaster component from the previous project

export const useToaster = () => {
  const context = useContext(ToasterContext)
  if (!context) {
    throw new Error("useToaster must be used within a ToasterProvider")
  }
  return context
}

export const ToasterProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = (message, type = "info", duration = 5000) => {
    const id = Date.now() + Math.random()
    const toast = { id, message, type, duration }

    setToasts((prev) => [...prev, toast])

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const success = (message, duration) => addToast(message, "success", duration)
  const error = (message, duration) => addToast(message, "error", duration)
  const warning = (message, duration) => addToast(message, "warning", duration)
  const info = (message, duration) => addToast(message, "info", duration)

  return (
    <ToasterContext.Provider value={{ success, error, warning, info, removeToast }}>
      {children}
      <ToasterContainer toasts={toasts} removeToast={removeToast} />
    </ToasterContext.Provider>
  )
}

const ToasterContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  )
}

const Toast = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleRemove = () => {
    setIsVisible(false)
    setTimeout(() => onRemove(toast.id), 300)
  }

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-600" />
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      default:
        return <Info className="w-5 h-5 text-blue-600" />
    }
  }

  const getBackgroundColor = () => {
    switch (toast.type) {
      case "success":
        return "bg-green-50 border-green-200"
      case "error":
        return "bg-red-50 border-red-200"
      case "warning":
        return "bg-yellow-50 border-yellow-200"
      default:
        return "bg-blue-50 border-blue-200"
    }
  }

  return (
    <div
      className={`
        ${getBackgroundColor()}
        border rounded-lg px-5 py-4 shadow-lg w-[380px] max-w-full
        transform transition-all duration-300 ease-in-out
        ${isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
      `}
    >
      <div className="flex items-start space-x-3">
        <div>{getIcon()}</div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 break-words">
            {toast.message}
          </p>
        </div>
        <button
          className="text-gray-400 hover:text-gray-600 focus:outline-none"
          onClick={handleRemove}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default ToasterContainer
