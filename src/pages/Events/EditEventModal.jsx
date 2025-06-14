import { useState, useEffect, useCallback } from "react"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Label } from "../../components/ui/Label"
import { Textarea } from "../../components/ui/Textarea"
import { Select } from "../../components/ui/Select"
import { X } from "lucide-react"
import apiHandler from "../../api-handler/api-handler"
import { useToaster } from "../../components/Toaster"

const EditEventModal = ({ 
  show, 
  event,
  onClose,
  onSuccess
}) => {
  const { success, error } = useToaster()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    startDate: "",
    startTime: "",
    duration: "",
    registrationFees: 0,
    location: "",
    description: ""
  })

  // Populate form data when event changes
  useEffect(() => {
    if (event) {
      const startDate = event.startTime ? new Date(event.startTime) : new Date()
      
      setFormData({
        title: event.title || "",
        category: event.category || "",
        startDate: startDate.toISOString().split('T')[0],
        startTime: startDate.toTimeString().substring(0, 5),
        duration: event.duration || "",
        registrationFees: event.registrationFees || 0,
        location: event.location || "",
        description: event.description || ""
      })
    }
  }, [event])
  
  // Handle ESC key press
  const handleEscapeKey = useCallback((e) => {
    if (e.key === 'Escape' && !isSubmitting) {
      onClose()
    }
  }, [onClose, isSubmitting])
  
  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose()
    }
  }
  
  // Add event listener for ESC key
  useEffect(() => {
    if (show) {
      document.addEventListener('keydown', handleEscapeKey)
    }
    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [show, handleEscapeKey])

  if (!show) return null

  const handleSubmit = async () => {
    if (!formData.title || !formData.category) {
      error("Title and category are required")
      return
    }

    setIsSubmitting(true)
    try {
      // Combine date and time
      const startTime = new Date(`${formData.startDate}T${formData.startTime}:00`)
      
      const payload = {
        ...formData,
        startTime: startTime.toISOString(),
        registrationFees: Number(formData.registrationFees),
        duration: Number(formData.duration)
      }

      // Update to match the /update/:id route
      await apiHandler.put(`/api/events/update/${event.id}`, payload)
      success("Event updated successfully")
      onSuccess()
    } catch (err) {
      console.error("Error updating event:", err)
      error("Failed to update event")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 modal-overlay bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-amber-900">Edit Event</h3>
            <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Event title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category">Category *</Label>
              <Select
                id="edit-category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">Select category</option>
                <option value="MASS">Mass</option>
                <option value="FEAST_DAY">Feast Day</option>
                <option value="RETREAT">Retreat</option>
                <option value="MEETING">Meeting</option>
                <option value="OTHER">Other</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-date">Date *</Label>
              <Input
                id="edit-date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-time">Time *</Label>
              <Input
                id="edit-time"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-duration">Duration (minutes) *</Label>
              <Input
                id="edit-duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="90"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-fees">Registration Fees (₹)</Label>
              <Input
                id="edit-fees"
                type="number"
                value={formData.registrationFees}
                onChange={(e) => setFormData({ ...formData, registrationFees: e.target.value })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Church hall"
              />
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Event description"
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              className="bg-amber-600 hover:bg-amber-700" 
              onClick={handleSubmit} 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Updating...
                </div>
              ) : (
                "Update Event"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditEventModal