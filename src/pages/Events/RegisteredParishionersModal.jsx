import { useState, useEffect } from "react"
import { Button } from "../../components/ui/Button"
import { X, Users, User, Phone, ChevronUp, ChevronDown, Search, Download } from "lucide-react"
import { Input } from "../../components/ui/Input"
import DataTable from "../../components/DataTable"
import apiHandler from "../../api-handler/api-handler"
import { useToaster } from "../../components/Toaster"
import { generateReceipt } from "./billGenerator"

const RegisteredParishionersModal = ({ 
  show, 
  onClose, 
  event, 
  registeredParishioners
}) => {
  const { success, error } = useToaster()
  
  // State for expanded families and search
  const [expandedFamilies, setExpandedFamilies] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  
  // Close modal on escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (show) {
      window.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [show, onClose]);

  // Initialize expanded families whenever registeredParishioners changes
  useEffect(() => {
    if (show && Array.isArray(registeredParishioners) && registeredParishioners.length > 0) {
      const groupedData = groupParishionersByFamily(registeredParishioners);
      const families = {};
      Object.keys(groupedData).forEach(familyId => {
        families[familyId] = true; // Expand all families by default
      });
      setExpandedFamilies(families);
    }
  }, [show, registeredParishioners]);

  // Don't render anything if not showing
  if (!show || !event) return null;

  // Safely handle registeredParishioners
  const safeParishioners = Array.isArray(registeredParishioners) ? registeredParishioners : [];

  // Group parishioners by family
  function groupParishionersByFamily(parishioners) {
    return parishioners.reduce((acc, parishioner) => {
      if (!parishioner) return acc;
      
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
    }, {});
  }

  const groupedParishioners = groupParishionersByFamily(safeParishioners);

  // Toggle family expansion
  const toggleFamilyExpansion = (familyId) => {
    setExpandedFamilies(prev => ({
      ...prev,
      [familyId]: !prev[familyId]
    }));
  };

  // Filter by search term
  const filterBySearch = (items) => {
    if (!searchTerm) return items;
    
    const lowercaseTerm = searchTerm.toLowerCase();
    
    return Object.entries(items).reduce((filtered, [familyId, family]) => {
      // Check if family head name matches
      if (family.headName.toLowerCase().includes(lowercaseTerm) ||
          family.phone.includes(searchTerm)) {
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
  };

  // Function to handle receipt download
  const handleDownloadReceipt = async (member) => {
    try {
      if (!member.receiptNumber) {
        error('Receipt number not available for this registration');
        return;
      }

      // Fetch receipt data from backend
      const response = await apiHandler.get(`/api/events/receipt/${member.receiptNumber}`);
      const receiptData = response.data;

      // Generate PDF receipt using the bill generator
      const downloadSuccess = generateReceipt(receiptData);
      if (downloadSuccess) {
        success('Receipt downloaded successfully!');
      } else {
        error('Failed to generate receipt PDF');
      }
      
    } catch (err) {
      console.error('Error downloading receipt:', err);
      error('Failed to download receipt');
    }
  };

  // Columns for individual parishioners table
  const individualColumns = [
    { 
      key: "name", 
      header: "Name", 
      width: "35%",
      align: "left"
    },
    { 
      key: "gender", 
      header: "Gender", 
      render: (value) => value?.charAt(0).toUpperCase() + value?.slice(1).toLowerCase() || "N/A",
      width: "15%",
      align: "center"
    },
    {
      key: "registeredAt",
      header: "Registration Date",
      render: (value) => value ? new Date(value).toLocaleDateString("en-IN") : "N/A",
      width: "25%",
      align: "center"
    },
    {
      key: "actions",
      header: "Actions",
      width: "25%",
      align: "center",
      render: (_, item) => (
        <Button
          size="sm"
          variant="outline"
          className="border-amber-300 text-amber-700 hover:bg-amber-50"
          onClick={(e) => {
            e.stopPropagation();
            handleDownloadReceipt(item);
          }}
          disabled={!item.receiptNumber}
        >
          <Download className="w-3 h-3 mr-1" />
          {item.receiptNumber ? 'Download Receipt' : 'No Receipt'}
        </Button>
      )
    }
  ];

  // Calculate total individuals
  const totalIndividuals = Object.values(groupedParishioners).reduce(
    (sum, family) => sum + family.members.length, 0
  );

  const handleBackdropClick = (e) => {
    // Only close if the actual backdrop was clicked, not its children
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Filter data based on search term
  const filteredData = filterBySearch(groupedParishioners);

  return (
    <div className="fixed inset-0 modal-overlay bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={handleBackdropClick}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto modal-container" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-amber-900">
              Registered Parishioners - {event.title}
            </h3>
            <Button variant="ghost" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="mb-4">
            <div className="bg-amber-50 p-4 rounded-lg mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-amber-700">Total Families:</div>
                  <div className="font-medium">{Object.keys(groupedParishioners).length}</div>
                </div>
                <div>
                  <div className="text-sm text-amber-700">Total Individuals:</div>
                  <div className="font-medium">{totalIndividuals}</div>
                </div>
                <div>
                  <div className="text-sm text-amber-700">Registration Fee:</div>
                  <div className="font-medium">
                    {event.registrationFees === 0 ? "Free" : `Rs ${event.registrationFees} per person`}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-gray-500" />
              </div>
              <Input
                type="text"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full pl-10 p-2.5"
                placeholder="Search by name or family..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Display if no registrations */}
          {totalIndividuals === 0 && (
            <div className="text-center py-8 text-gray-500 bg-gray-50 border border-gray-200 rounded-lg">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p>No registrations yet</p>
              <p className="text-xs mt-1">This event has no registered parishioners</p>
            </div>
          )}

          {/* Display grouped parishioners */}
          {totalIndividuals > 0 && (
            <div className="space-y-4">
              {Object.keys(filteredData).length > 0 ? (
                Object.entries(filteredData).map(([familyId, family]) => (
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
                          showActions={false}
                        />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 bg-gray-50 border border-gray-200 rounded-lg">
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p>No matches found</p>
                  <p className="text-xs mt-1">Try a different search term</p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end mt-6">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisteredParishionersModal;