import { useState, useEffect, useCallback } from "react"
import { Button } from "../../components/ui/Button"
import { X } from "lucide-react"
import apiHandler from "../../api-handler/api-handler"
import { useToaster } from "../../components/Toaster"

const DeleteEventModal = ({ 
  show, 
  onClose, 
  event, 
  onSuccess
}) => {
  const { success, error } = useToaster()
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Handle ESC key press
  const handleEscapeKey = useCallback((e) => {
    if (e.key === 'Escape' && !isDeleting) {
      onClose()
    }
  }, [onClose, isDeleting])
  
  // Add event listener for ESC key
  useEffect(() => {
    if (show) {
      document.addEventListener('keydown', handleEscapeKey)
    }
    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [show, handleEscapeKey])
  
  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isDeleting) {
      onClose()
    }
  }

  if (!show) return null

  const confirmDelete = async () => {
    setIsDeleting(true)
    try {
      await apiHandler.delete(`/api/events/delete/${event.id}`)
      success("Event deleted successfully")
      onSuccess()
    } catch (err) {
      console.error("Error deleting event:", err)
      error("Failed to delete event")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 modal-overlay bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md modal-container">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-amber-900">Confirm Delete</h3>
            <Button variant="ghost" onClick={onClose} disabled={isDeleting}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <p className="text-gray-700 mb-6">
            Are you sure you want to delete <span className="font-semibold">{event?.title}</span>? This action cannot be undone.
          </p>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={isDeleting}>
              Cancel
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700" 
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Deleting...
                </div>
              ) : (
                "Delete Event"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeleteEventModal