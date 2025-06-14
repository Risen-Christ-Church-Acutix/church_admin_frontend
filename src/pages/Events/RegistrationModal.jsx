import { Button } from "../../components/ui/Button"
import DataTable from "../../components/DataTable"
import { X, Phone, Mail, User, Users, Calendar, Check, XCircle, ChevronUp, ChevronDown, Search } from "lucide-react"
import { useEffect, useState } from "react"

const RegistrationModal = ({ 
  show, 
  onClose, 
  event, 
  registrationType,
  unregisteredFamilies,
  unregisteredParishioners,
  selectedItems,
  onItemSelection,
  onRegister,
  calculateTotal,
  getTotalMembers
}) => {
  // State to track expanded families (for individual registrations)
  const [expandedFamilies, setExpandedFamilies] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  // Close modal on escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (show) {
      window.addEventListener('keydown', handleEscape);
    };
    
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [show, onClose]);

  // When the modal opens, expand all families by default
  useEffect(() => {
    if (show && registrationType === "individual") {
      const families = {};
      unregisteredParishioners.forEach(p => {
        families[p.familyId] = true;
      });
      setExpandedFamilies(families);
    }
  }, [show, registrationType, unregisteredParishioners]);

  if (!show) return null

  // Helper function to format datetime with IST
  const formatDateTime = (dateTime, options) => {
    const date = new Date(dateTime)
    return date.toLocaleDateString("en-IN", options)
  }

  const formatTime = (dateTime) => {
    const date = new Date(dateTime)
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Group parishioners by family for individual registration
  const groupedParishioners = registrationType === "individual" 
    ? unregisteredParishioners.reduce((acc, parishioner) => {
        if (!parishioner) return acc; // Skip null/undefined parishioners
        
        const familyId = parishioner.familyId || "unknown";
        const familyHead = parishioner.family?.headOfFamily || "Unknown";
        
        if (!acc[familyId]) {
          acc[familyId] = {
            id: familyId,
            headName: familyHead,
            phone: parishioner.family?.phoneNumber || "N/A",
            members: []
          };
        }
        acc[familyId].members.push(parishioner);
        return acc;
      }, {})
    : {};

  // Toggle family expansion
  const toggleFamilyExpansion = (familyId) => {
    setExpandedFamilies({
      ...expandedFamilies,
      [familyId]: !expandedFamilies[familyId]
    });
  };

  // Filter items based on search term
  const filterBySearch = (items, term) => {
    if (!term) return items;
    
    const lowercaseTerm = term.toLowerCase();
    
    if (registrationType === "family") {
      return items.filter(family => 
        family.headOfFamily.toLowerCase().includes(lowercaseTerm) || 
        family.phoneNumber?.includes(term)
      );
    } else {
      // For the grouped parishioners object
      return Object.entries(items).reduce((filtered, [familyId, family]) => {
        // Check if family head name matches
        if (family.headName.toLowerCase().includes(lowercaseTerm) ||
            family.phone.includes(term)) {
          filtered[familyId] = family;
          return filtered;
        }
        
        // Check if any family member matches
        const matchingMembers = family.members.filter(member => 
          member.name.toLowerCase().includes(lowercaseTerm)
        );
        
        if (matchingMembers.length > 0) {
          // Create a new filtered family with only matching members
          filtered[familyId] = {
            ...family,
            members: matchingMembers
          };
        }
        
        return filtered;
      }, {});
    }
  };

  // Columns for family registration table
  const familyColumns = [
    { 
      key: "headOfFamily", 
      header: "Head of Family", 
      width: "35%",
      align: "left"
    },
    { 
      key: "phoneNumber", 
      header: "Phone Number", 
      render: (value) => value || "N/A",
      width: "25%",
      align: "left"
    },
    { 
      key: "memberCount", 
      header: "Members", 
      width: "15%",
      align: "center"
    },
    {
      key: "totalFee",
      header: "Total Fee",
      render: (_, item) => `Rs. ${item.memberCount * event.registrationFees}`,
      width: "15%",
      align: "center"
    }
  ];

  // Custom actions for family
  const familyActions = {
    view: null,
    edit: null,
    delete: null,
    custom: (item) => (
      <div className="flex items-center justify-center">
        <input
          type="radio"
          name="familySelection"
          checked={selectedItems.some((selected) => selected.id === item.id)}
          onChange={(e) => onItemSelection(item, e.target.checked)}
          className="w-5 h-5 text-amber-600 border-2 border-amber-400 rounded-full focus:ring-amber-500"
          id={`family-${item.id}`}
        />
        <label
          htmlFor={`family-${item.id}`}
          className="ml-2 text-sm font-medium text-amber-700 cursor-pointer"
        >
          Select
        </label>
      </div>
    )
  };

  // Columns for individual registration table
  const individualColumns = [
    { 
      key: "name", 
      header: "Name", 
      width: "55%",
      align: "left"
    },
    { 
      key: "gender", 
      header: "Gender", 
      render: (value) => value?.charAt(0).toUpperCase() + value?.slice(1).toLowerCase() || "N/A",
      width: "20%",
      align: "center"
    },
    {
      key: "fee",
      header: "Fee",
      render: () => `Rs. ${event.registrationFees}`,
      width: "15%",
      align: "center"
    }
  ];

  // Custom actions for individuals
  const individualActions = {
    view: null,
    edit: null,
    delete: null,
    custom: (item) => {
      const isSelected = selectedItems.some((selected) => selected.id === item.id);
      return (
        <Button
          size="sm"
          variant={isSelected ? "default" : "outline"}
          className={isSelected 
            ? "bg-green-600 hover:bg-green-700 text-white border-none px-3" 
            : "border-amber-300 text-amber-700 hover:bg-amber-50 px-3"}
          onClick={() => onItemSelection(item, !isSelected)}
        >
          {isSelected ? (
            <div className="flex items-center">
              <Check className="w-4 h-4 mr-1" />
              Selected
            </div>
          ) : (
            "Select"
          )}
        </Button>
      );
    }
  };

  const handleBackdropClick = (e) => {
    // Only close if the actual backdrop was clicked, not its children
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 modal-overlay bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={handleBackdropClick}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto modal-container" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-amber-900">
              Register for {event.title}
            </h3>
            <Button variant="ghost" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="mb-4">
            <h4 className="text-lg font-semibold text-amber-800 mb-2">Event Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-amber-50 p-4 rounded-lg">
              <div>
                <div className="text-sm text-amber-700">Date & Time:</div>
                <div className="font-medium">
                  {formatDateTime(event.startTime, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  at {formatTime(event.startTime)}
                </div>
              </div>
              <div>
                <div className="text-sm text-amber-700">Location:</div>
                <div className="font-medium">{event.location || "Church hall"}</div>
              </div>
              <div>
                <div className="text-sm text-amber-700">Registration Fee:</div>
                <div className="font-medium">
                  {event.registrationFees === 0 ? "Free" : `Rs. ${event.registrationFees} per person`}
                </div>
              </div>
              <div>
                <div className="text-sm text-amber-700">Registration Type:</div>
                <div className="font-medium capitalize">{registrationType}</div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-lg font-semibold text-amber-800 mb-2">
              {registrationType === "family" ? "Select Family" : "Select Individuals"}
            </h4>

            {registrationType === "family" ? (
              <>
                <div className="mb-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Search className="w-4 h-4 text-gray-500" />
                    </div>
                    <input
                      type="text"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full pl-10 p-2.5"
                      placeholder="Search by family head or phone number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {filterBySearch(unregisteredFamilies, searchTerm).length > 0 ? (
                    <DataTable
                      data={filterBySearch(unregisteredFamilies, searchTerm)}
                      columns={familyColumns}
                      emptyMessage="No unregistered families found"
                      customAction={familyActions.custom}
                      showActions={true}
                      showSearch={false} // We're using our custom search
                    />
                  ) : (
                    <div className="text-center py-8 text-gray-500 bg-gray-50">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p>No unregistered families found</p>
                      <p className="text-xs mt-1">All families already have at least one member registered for this event</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Search className="w-4 h-4 text-gray-500" />
                    </div>
                    <input
                      type="text"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full pl-10 p-2.5"
                      placeholder="Search by name or family..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  {Object.entries(filterBySearch(groupedParishioners, searchTerm)).length > 0 ? (
                    Object.entries(filterBySearch(groupedParishioners, searchTerm)).map(([familyId, family]) => (
                      <div key={familyId} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div 
                          className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center cursor-pointer"
                          onClick={() => toggleFamilyExpansion(familyId)}
                        >
                          <div>
                            <h5 className="font-medium text-gray-900 flex items-center">
                              <User className="w-4 h-4 mr-2 text-gray-600" />
                              {family.headName}'s Family
                            </h5>
                            <div className="text-sm text-gray-600 flex items-center mt-1">
                              <Phone className="w-3 h-3 mr-1" />{family.phone}
                              <span className="mx-2">•</span>
                              <Users className="w-3 h-3 mr-1" />{family.members.length} members
                            </div>
                          </div>
                          <div className="transform transition-transform">
                            {expandedFamilies[familyId] ? 
                              <ChevronUp className="w-5 h-5 text-gray-500" /> :
                              <ChevronDown className="w-5 h-5 text-gray-500" />
                            }
                          </div>
                        </div>
                        
                        {expandedFamilies[familyId] && (
                          <div className="p-4">
                            <DataTable
                              data={family.members}
                              columns={individualColumns}
                              emptyMessage="No members found"
                              showSearch={false}
                              showPagination={false}
                              customAction={individualActions.custom}
                              showActions={true}
                            />
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 border border-gray-200 rounded-lg">
                      <User className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p>No unregistered individuals found</p>
                      <p className="text-xs mt-1">All parishioners are already registered for this event</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="bg-amber-50 p-4 rounded-lg mb-6">
            <h4 className="text-md font-semibold text-amber-800 mb-2">Registration Summary</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-sm text-amber-700">Total Members:</div>
                <div className="font-medium">{getTotalMembers()}</div>
              </div>
              <div>
                <div className="text-sm text-amber-700">Total Fee:</div>
                <div className="font-medium">
                  {calculateTotal() === 0 ? "Free" : `Rs. ${calculateTotal()}`}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="bg-amber-600 hover:bg-amber-700"
              onClick={onRegister}
              disabled={selectedItems.length === 0}
            >
              Register Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegistrationModal