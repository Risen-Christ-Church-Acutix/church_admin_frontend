import { Button } from "../../components/ui/Button"
import { X, Check, AlertTriangle, Calendar, Users, IndianRupee } from "lucide-react"
import { useEffect, useState } from "react"
import apiHandler from "../../api-handler/api-handler"
import { useToaster } from "../../components/Toaster"
import { generateReceipt } from "./billGenerator"

const ConfirmationModal = ({ 
  show, 
  onClose, 
  event,
  registrationType,
  selectedItems,
  getTotalMembers,
  calculateTotal,
  onConfirm
}) => {
  const { success, error } = useToaster()
  const [isProcessing, setIsProcessing] = useState(false)
  const isFreeEvent = event?.registrationFees === 0;

  // Close modal on escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && !isProcessing) onClose();
    };
    
    if (show) {
      window.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [show, onClose, isProcessing]);

  if (!show) return null;

  const confirmRegistration = async () => {
    setIsProcessing(true);
    try {
      const payload = registrationType === "family" 
        ? { 
            eventId: event.id, 
            familyId: selectedItems[0].id 
          }
        : { 
            eventId: event.id, 
            parishionerIds: selectedItems.map(item => item.id)
          };

      // Use the appropriate registration route based on type
      const endpoint = registrationType === "family" 
        ? '/api/events/register/family' 
        : '/api/events/register/individuals';
      
      const response = await apiHandler.post(endpoint, payload);
      console.log("Registration response:", response.data);
      
      // Only generate receipt for paid events
      if (!isFreeEvent && response.data.receiptNumber) {
        try {
          // Fetch receipt data from backend using the receipt number
          const receiptResponse = await apiHandler.get(`/api/events/receipt/${response.data.receiptNumber}`);
          const receiptData = receiptResponse.data;
          
          console.log("Receipt data from backend:", receiptData);
          
          // Generate and download receipt using backend data
          generateReceipt(receiptData);
          success("Registration successful! Receipt downloaded.");
        } catch (receiptErr) {
          console.error("Error fetching/generating receipt:", receiptErr);
          success("Registration successful, but there was an error generating the receipt.");
        }
      } else {
        success("Registration successful!");
      }
      
      // Call onConfirm to refresh just the unregistered data, but keep modal open
      onConfirm();
      
      // Close only the confirmation modal
      onClose();
    } catch (err) {
      console.error("Registration error:", err);
      error(err.response?.data?.message || "Failed to complete registration");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBackdropClick = (e) => {
    // Only close if the actual backdrop was clicked, not its children
    if (e.target === e.currentTarget && !isProcessing) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 modal-overlay bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={handleBackdropClick}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg modal-container" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-amber-900 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-amber-600" />
              Confirm Registration
            </h3>
            <Button variant="ghost" onClick={onClose} disabled={isProcessing}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="mb-6">
            <div className="bg-amber-50 p-4 rounded-lg mb-4 flex items-start gap-3">
              <Calendar className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-900">{event?.title}</h4>
                <p className="text-sm text-amber-700">
                  {new Date(event?.startTime).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  at{" "}
                  {new Date(event?.startTime).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="border border-amber-200 rounded-lg p-4">
                <div className="flex items-center text-amber-800 font-medium mb-2">
                  <Users className="w-4 h-4 mr-2" />
                  {registrationType === "family" ? "Family Details" : "Individual Details"}
                </div>
                {registrationType === "family" ? (
                  <div>
                    <p><span className="text-gray-600">Family Head:</span> {selectedItems[0]?.headOfFamily}</p>
                    <p><span className="text-gray-600">Total Members:</span> {selectedItems[0]?.memberCount}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-600 mb-1">Selected Parishioners ({selectedItems.length}):</p>
                    <ul className="text-sm pl-5 list-disc">
                      {selectedItems.slice(0, 5).map(item => (
                        <li key={item.id}>{item.name}</li>
                      ))}
                      {selectedItems.length > 5 && <li className="italic text-gray-500">...and {selectedItems.length - 5} more</li>}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="border border-amber-200 rounded-lg p-4">
                <div className="flex items-center text-amber-800 font-medium mb-2">
                  <IndianRupee className="w-4 h-4 mr-2" />
                  Payment Details
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <p><span className="text-gray-600">Registration Fee:</span> Rs {event?.registrationFees} per person</p>
                  <p><span className="text-gray-600">Total Members:</span> {getTotalMembers()}</p>
                  <p className="col-span-2"><span className="text-gray-600">Total Amount:</span> <span className="font-medium text-amber-900">Rs {calculateTotal()}</span></p>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mb-6">
            Are you sure you want to proceed with this registration? This will register {getTotalMembers()} {getTotalMembers() === 1 ? 'person' : 'people'} for this event.
            {!isFreeEvent && " A receipt will be downloaded upon successful registration."}
          </p>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={isProcessing}>
              Cancel
            </Button>
            <Button 
              className="bg-amber-600 hover:bg-amber-700"
              onClick={confirmRegistration}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Confirm Registration
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;