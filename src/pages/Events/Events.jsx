"use client"

import { useState, useEffect } from "react"
import { Button } from "../../components/ui/Button"
import { Badge } from "../../components/ui/Badge"
import { Input } from "../../components/ui/Input"
import { Select } from "../../components/ui/Select"
import Layout from "../../components/Layout"
import { useToaster } from "../../components/Toaster"
import apiHandler from "../../api-handler/api-handler"
import {
  Plus,
  Calendar,
  Search,
  Filter,
  RefreshCw,
  ChevronDown,
  SortAsc,
  SortDesc,
  ArrowDownUp,
  DollarSign,
  Users,
  Clock,
  X,
  Calendar as CalendarIcon,
  IndianRupee
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";

import EventCard from "./EventCard"
import CreateEventModal from "./CreateEventModal"
import EditEventModal from "./EditEventModal"
import DeleteEventModal from "./DeleteEventModal"
import RegistrationModal from "./RegistrationModal"
import ConfirmationModal from "./ConfirmationModal"
import RegisteredParishionersModal from "./RegisteredParishionersModal"
import { generateReceipt } from "./billGenerator"
import { customStyles } from "./styles"

const Events = ({ navigate }) => {
  const { success, error, warning } = useToaster()
  
  // Modal states
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showRegistrationModal, setShowRegistrationModal] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showRegisteredModal, setShowRegisteredModal] = useState(false)
  
  // Registration states
  const [registrationType, setRegistrationType] = useState("")
  const [selectedItems, setSelectedItems] = useState([])
  const [unregisteredFamilies, setUnregisteredFamilies] = useState([])
  const [unregisteredParishioners, setUnregisteredParishioners] = useState([])
  const [registeredParishioners, setRegisteredParishioners] = useState([])
  
  // Data states
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // New filter and sort states
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [dateFilter, setDateFilter] = useState({ startDate: "", endDate: "" })
  const [feeFilter, setFeeFilter] = useState({ min: "", max: "" })
  const [registrationFilter, setRegistrationFilter] = useState({ min: "", max: "" })
  const [sortField, setSortField] = useState("startTime")
  const [sortDirection, setSortDirection] = useState("asc")

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents()
  }, [])

  // Prevent background scrolling when modals are open
  useEffect(() => {
    const modalOpen = showCreateModal || showEditModal || showDeleteModal || showRegistrationModal || showConfirmation || showRegisteredModal
    if (modalOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [showCreateModal, showEditModal, showDeleteModal, showRegistrationModal, showConfirmation, showRegisteredModal])

  // Fetch events from API
  const fetchEvents = async () => {
    setLoading(true)
    try {
      const response = await apiHandler.get('/api/events/all')
      
      // Ensure events is always an array, even if the API returns nothing
      if (response.data && Array.isArray(response.data.events)) {
        setEvents(response.data.events)
      } else {
        console.warn("API returned invalid format or empty data:", response.data)
        setEvents([]) // Set to empty array to avoid filter errors
      }
    } catch (err) {
      console.error("Error fetching events:", err)
      error("Failed to fetch events")
      setEvents([]) // Set to empty array on error
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  // Refresh events data
  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchEvents()
  }

  // Toggle advanced filters
  const toggleAdvancedFilters = () => {
    setShowAdvancedFilters(!showAdvancedFilters)
  }

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("")
    setFilterCategory("")
    setDateFilter({ startDate: "", endDate: "" })
    setFeeFilter({ min: "", max: "" })
    setRegistrationFilter({ min: "", max: "" })
    setSortField("startTime")
    setSortDirection("asc")
    setShowAdvancedFilters(false)
  }

  // Toggle sort direction
  const toggleSortDirection = () => {
    const newDirection = sortDirection === "asc" ? "desc" : "asc"
    setSortDirection(newDirection)
    console.log(`Sort direction changed to: ${newDirection}`) // Debug log
  }

  // Apply all filters and sort
  const applyFiltersAndSort = (events) => {
    // Ensure events is an array
    if (!events || !Array.isArray(events)) {
      console.warn("applyFiltersAndSort called with non-array:", events)
      return [] // Return empty array instead of throwing an error
    }
    
    // First filter the events
    let filteredEvents = events.filter((event) => {
      // Search term filter
      const matchesSearch = 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()))
      
      // Category filter
      const matchesCategory = filterCategory ? event.category === filterCategory : true
      
      // Date filter
      let matchesDate = true
      if (dateFilter.startDate) {
        const eventDate = new Date(event.startTime)
        const startDate = new Date(dateFilter.startDate)
        startDate.setHours(0, 0, 0, 0)
        matchesDate = matchesDate && eventDate >= startDate
      }
      if (dateFilter.endDate) {
        const eventDate = new Date(event.startTime)
        const endDate = new Date(dateFilter.endDate)
        endDate.setHours(23, 59, 59, 999)
        matchesDate = matchesDate && eventDate <= endDate
      }
      
      // Fee filter
      let matchesFee = true
      if (feeFilter.min) {
        matchesFee = matchesFee && event.registrationFees >= Number(feeFilter.min)
      }
      if (feeFilter.max) {
        matchesFee = matchesFee && event.registrationFees <= Number(feeFilter.max)
      }
      
      // Registration count filter
      let matchesRegistration = true
      const totalRegistered = event.totalRegistered || 0
      if (registrationFilter.min) {
        matchesRegistration = matchesRegistration && totalRegistered >= Number(registrationFilter.min)
      }
      if (registrationFilter.max) {
        matchesRegistration = matchesRegistration && totalRegistered <= Number(registrationFilter.max)
      }
      
      return matchesSearch && matchesCategory && matchesDate && matchesFee && matchesRegistration
    })
    
    // Then sort the filtered events
    filteredEvents.sort((a, b) => {
      let valueA, valueB
      
      switch (sortField) {
        case "title":
          valueA = a.title ? a.title.toLowerCase() : ""
          valueB = b.title ? b.title.toLowerCase() : ""
          break
        case "registrationFees":
          valueA = Number(a.registrationFees) || 0
          valueB = Number(b.registrationFees) || 0
          break
        case "totalRegistered":
          valueA = Number(a.totalRegistered) || 0
          valueB = Number(b.totalRegistered) || 0
          break
        case "startTime":
        default:
          valueA = a.startTime ? new Date(a.startTime).getTime() : 0
          valueB = b.startTime ? new Date(b.startTime).getTime() : 0
          break
      }
      
      // Handle string comparison
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        if (sortDirection === "asc") {
          return valueA.localeCompare(valueB)
        } else {
          return valueB.localeCompare(valueA)
        }
      }
      
      // Handle numeric comparison
      if (sortDirection === "asc") {
        return valueA - valueB
      } else {
        return valueB - valueA
      }
    })
    
    return filteredEvents
  }

  // Apply filters and sorting
  const filteredEvents = events && Array.isArray(events) ? applyFiltersAndSort(events) : []

  // Separate upcoming and past events - preserve the user's sorting
  const upcomingEvents = filteredEvents.filter((event) => !event.startTime || new Date(event.startTime) > new Date())
  const pastEvents = filteredEvents.filter((event) => event.startTime && new Date(event.startTime) <= new Date())

  const handleCreateEvent = () => {
    setShowCreateModal(true)
  }

  const handleEditEvent = (event) => {
    setSelectedEvent(event)
    setShowEditModal(true)
  }

  const handleDeleteEvent = (event) => {
    setSelectedEvent(event)
    setShowDeleteModal(true)
  }

  // New functions to fetch unregistered families and parishioners
  const fetchUnregisteredFamilies = async (eventId) => {
    try {
      const response = await apiHandler.get(`/api/events/unregistered/families/${eventId}`);
      setUnregisteredFamilies(response.data.families || []);
      return response.data.families || [];
    } catch (err) {
      console.error("Error fetching unregistered families:", err);
      error("Failed to refresh unregistered families");
      return [];
    }
  };

  const fetchUnregisteredParishioners = async (eventId) => {
    try {
      setLoading(true); // Show loading state
      const response = await apiHandler.get(`/api/events/unregistered/individuals/${eventId}`);
      
      if (response.data && response.data.parishioners) {
        setUnregisteredParishioners(response.data.parishioners);
        return response.data.parishioners;
      } else {
        setUnregisteredParishioners([]);
        return [];
      }
    } catch (err) {
      console.error("Error fetching unregistered parishioners:", err);
      error("Failed to fetch unregistered individuals");
      setUnregisteredParishioners([]);
      return [];
    } finally {
      setLoading(false); // Hide loading state
    }
  };

  const handleRegistration = async (event, type) => {
    // Check if event has already ended
    if (event.startTime && new Date(event.startTime) < new Date()) {
      error("Cannot register for an event that has already ended");
      return;
    }
    
    setSelectedEvent(event);
    setRegistrationType(type);
    setSelectedItems([]);
    setShowRegistrationModal(true);

    try {
      if (type === "family") {
        await fetchUnregisteredFamilies(event.id);
      } else {
        await fetchUnregisteredParishioners(event.id);
      }
    } catch (err) {
      console.error(`Error fetching unregistered ${type}:`, err);
      error(`Failed to fetch unregistered ${type === "family" ? "families" : "individuals"}`);
      setShowRegistrationModal(false);
    }
  };

  const handleItemSelection = (item, isSelected) => {
    if (registrationType === "family") {
      // Only one family can be selected
      setSelectedItems(isSelected ? [item] : [])
    } else {
      // Multiple individuals can be selected
      if (isSelected) {
        // Check if item is already selected to avoid duplicates
        if (!selectedItems.some(selected => selected.id === item.id)) {
          setSelectedItems([...selectedItems, item])
        }
      } else {
        setSelectedItems(selectedItems.filter((selected) => selected.id !== item.id))
      }
    }
  }

  const calculateTotal = () => {
    if (registrationType === "family") {
      const family = selectedItems[0]
      return family ? selectedEvent.registrationFees * family.memberCount : 0
    } else {
      return selectedEvent.registrationFees * selectedItems.length
    }
  }

  const getTotalMembers = () => {
    if (registrationType === "family") {
      const family = selectedItems[0]
      return family ? family.memberCount : 0
    } else {
      return selectedItems.length
    }
  }

  const handleRegister = () => {
    if (selectedItems.length === 0) {
      warning("Please select at least one item to register")
      return
    }
    setShowConfirmation(true)
  }

  const confirmRegistration = async () => {
    if (selectedItems.length === 0) {
      warning("Please select at least one item to register");
      return;
    }
    
    try {
      const payload = registrationType === "family" 
        ? { 
            eventId: selectedEvent.id, 
            familyId: selectedItems[0].id 
          }
        : { 
            eventId: selectedEvent.id, 
            parishionerIds: selectedItems.map(item => item.id)
          };

      // Use the appropriate registration route based on type
      const endpoint = registrationType === "family" 
        ? '/api/events/register/family' 
        : '/api/events/register/individuals';
      
      const response = await apiHandler.post(endpoint, payload);
      
      // Generate and download receipt
      const receiptData = {
        event: selectedEvent,
        registrationType,
        items: selectedItems,
        totalMembers: getTotalMembers(),
        totalAmount: calculateTotal(),
        receiptId: response.data.registrationId || `REG-${Date.now()}`,
        date: new Date().toISOString()
      };
      
      generateReceipt(receiptData);
      success("Registration successful! Receipt downloaded.");
      
      // Reset state and refresh events
      setShowConfirmation(false);
      setShowRegistrationModal(false);
      setSelectedEvent(null);
      setSelectedItems([]);
      fetchEvents();
    } catch (err) {
      console.error("Registration error:", err);
      error(err.response?.data?.message || "Failed to complete registration");
    }
  };

  const handleRegistrationSuccess = async () => {
    // Close only the confirmation modal
    setShowConfirmation(false);
    
    // Reset selected items
    setSelectedItems([]);
    
    // Refresh the event data
    await fetchEvents();
    
    // Refresh only the unregistered data
    if (selectedEvent) {
      if (registrationType === "family") {
        await fetchUnregisteredFamilies(selectedEvent.id);
      } else {
        await fetchUnregisteredParishioners(selectedEvent.id);
      }
    }
  };

  const handleViewRegistrations = async (event) => {
    try {
      setSelectedEvent(event);
      setShowRegisteredModal(true);
      
      // Clear any previous data to prevent stale data from showing
      setRegisteredParishioners([]);
      
      const response = await apiHandler.get(`/api/events/registered/event/${event.id}`);
      
      if (response.data && Array.isArray(response.data.parishioners)) {
        // Filter out any null or invalid entries
        const validParishioners = response.data.parishioners.filter(p => p && p.id);
        setRegisteredParishioners(validParishioners);
      } else {
        setRegisteredParishioners([]);
      }
    } catch (err) {
      console.error("Error fetching registered parishioners:", err);
      error("Failed to fetch registered parishioners");
      setRegisteredParishioners([]);
    }
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (filterCategory) count++;
    if (dateFilter.startDate || dateFilter.endDate) count++;
    if (feeFilter.min || feeFilter.max) count++;
    if (registrationFilter.min || registrationFilter.max) count++;
    // Don't count sort as a filter
    return count;
  };

  return (
    <Layout>
      <style>{customStyles}</style>

      <div className="container mx-auto px-6 py-8">
        {/* Page Header with Search, Filter, and Create */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-amber-900 mb-2">
            Parish Events
          </h2>
          <p className="text-amber-700">
            Manage and register for upcoming events
          </p>
        </div>

        {/* Improved Filters - Matching Sacrament Records style */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-amber-200 mb-6">
            <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100 border-b border-amber-200">
              <div className="flex items-center justify-between">
                <div>
            <CardTitle className="text-amber-900 text-xl">
              Event Filters
            </CardTitle>
            <CardDescription className="text-amber-700">
              Find and manage parish events
            </CardDescription>
                </div>
                <Button
            className="bg-amber-600 hover:bg-amber-700 text-white"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                >
            <Filter className="w-4 h-4 mr-2" />
            {showAdvancedFilters ? "Hide Filters" : "Show Filters"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-3 mb-4">
                <div className="flex-1 relative">
            <Input
              placeholder="Search events..."
              className="w-full pl-9 border-gray-200 focus:border-amber-500 h-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500 w-4 h-4" />
            {searchTerm && (
              <button 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setSearchTerm("")}
              >
                <X className="w-4 h-4" />
              </button>
            )}
                </div>

                <Select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="md:w-64 h-10 text-sm"
            style={{
              border: "1px solid #E5E7EB", // Very light gray
              borderRadius: "0.375rem", // Rounded corners
              padding: "0.5rem", // Padding inside the select
              outline: "none",
              boxShadow: "none",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#F59E0B")} // Amber-500 on focus
            onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")} // Very light gray on blur
                >
            <option value="">All Categories</option>
            <option value="MASS">Mass</option>
            <option value="FEAST_DAY">Feast Day</option>
            <option value="RETREAT">Retreat</option>
            <option value="MEETING">Meeting</option>
            <option value="OTHER">Other</option>
                </Select>

                <Button 
            variant="outline" 
            className="border-gray-200 text-amber-700 hover:bg-amber-50 h-10 text-sm px-4"
            onClick={handleRefresh}
            disabled={isRefreshing}
                >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
                </Button>

                <Button 
            className="bg-amber-600 hover:bg-amber-700 text-white h-10 text-sm px-4" 
            onClick={handleCreateEvent}
                >
            <Plus className="w-4 h-4 mr-2" />
            Create Event
                </Button>
              </div>

              {showAdvancedFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-4 border-t border-amber-200">
            <div>
              <h4 className="text-sm font-medium text-amber-700 mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-amber-500" />
                Date Range
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-amber-600 block mb-1">From</label>
                  <Input
              type="date"
              className="text-sm border-gray-200 focus:border-amber-500"
              value={dateFilter.startDate}
              onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-amber-600 block mb-1">To</label>
                  <Input
              type="date"
              className="text-sm border-gray-200 focus:border-amber-500"
              value={dateFilter.endDate}
              onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-amber-700 mb-2 flex items-center">
                <IndianRupee className="w-4 h-4 mr-2 text-amber-500" />
                Registration Fee Range
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-amber-600 block mb-1">Min (Rs)</label>
                  <Input
              type="number"
              className="text-sm border-gray-200 focus:border-amber-500"
              value={feeFilter.min}
              onChange={(e) => setFeeFilter({ ...feeFilter, min: e.target.value })}
              placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-xs text-amber-600 block mb-1">Max (Rs)</label>
                  <Input
              type="number"
              className="text-sm border-gray-200 focus:border-amber-500"
              value={feeFilter.max}
              onChange={(e) => setFeeFilter({ ...feeFilter, max: e.target.value })}
              placeholder="1000"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-amber-700 mb-2 flex items-center">
                <Users className="w-4 h-4 mr-2 text-amber-500" />
                Registration Count
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-amber-600 block mb-1">Min</label>
                  <Input
              type="number"
              className="text-sm border-gray-200 focus:border-amber-500"
              value={registrationFilter.min}
              onChange={(e) => setRegistrationFilter({ ...registrationFilter, min: e.target.value })}
              placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-xs text-amber-600 block mb-1">Max</label>
                  <Input
              type="number"
              className="text-sm border-gray-200 focus:border-amber-500"
              value={registrationFilter.max}
              onChange={(e) => setRegistrationFilter({ ...registrationFilter, max: e.target.value })}
              placeholder="100"
                  />
                </div>
              </div>
            </div>

            <div className="md:col-span-3">
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  {getActiveFilterCount() > 0 && (
              <Badge className="bg-amber-100 text-amber-800 border border-amber-300">
                {getActiveFilterCount()} active filter{getActiveFilterCount() > 1 ? 's' : ''}
              </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
              <span className="text-sm text-amber-700">Sort by:</span>
              <Select
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
                className="text-sm h-8 border-gray-200 focus:border-amber-500 w-36"
              >
                <option value="startTime">Date</option>
                <option value="title">Title</option>
                <option value="registrationFees">Registration Fees</option>
                <option value="totalRegistered">Registrations</option>
              </Select>
              <Button 
                variant="outline" 
                className="h-8 border-gray-200 text-amber-700 px-2 hover:bg-amber-50"
                onClick={toggleSortDirection}
                title={`Currently sorting ${sortDirection === "asc" ? "ascending" : "descending"}. Click to toggle.`}
              >
                {sortDirection === "asc" ? (
                  <div className="flex items-center">
                    <SortAsc className="w-4 h-4 mr-1" />
                    <span className="text-xs">Asc</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <SortDesc className="w-4 h-4 mr-1" />
                    <span className="text-xs">Desc</span>
                  </div>
                )}
              </Button>
                  </div>
                  
                  {getActiveFilterCount() > 0 && (
              <Button 
                variant="outline" 
                className="border-gray-200 text-amber-700 hover:bg-amber-50"
                onClick={resetFilters}
              >
                Clear All Filters
              </Button>
                  )}
                </div>
              </div>
            </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
          </div>
        )}

        {/* No Events State */}
        {!loading && events.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-8 text-center">
            <Calendar className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-amber-900 mb-2">No Events Found</h3>
            <p className="text-amber-700 mb-4">There are no events scheduled at the moment.</p>
            <Button className="bg-amber-600 hover:bg-amber-700" onClick={handleCreateEvent}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Event
            </Button>
          </div>
        )}

        {/* No Search Results */}
        {!loading && events.length > 0 && filteredEvents.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-8 text-center">
            <Search className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-amber-900 mb-2">No Matching Events</h3>
            <p className="text-amber-700 mb-4">No events match your search criteria.</p>
            <Button 
              variant="outline" 
              className="bg-white border-amber-300 text-amber-700 hover:bg-amber-50"
              onClick={resetFilters}
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Upcoming Events Section */}
        {!loading && upcomingEvents.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center mb-4 gap-2">
              <h2 className="text-xl font-bold text-amber-900">Upcoming Events</h2>
              <Badge className="bg-amber-100 text-amber-800 border border-amber-300">
                {upcomingEvents.length}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {upcomingEvents.map((event) => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  isUpcoming={true}
                  onEdit={handleEditEvent}
                  onDelete={handleDeleteEvent}
                  onRegister={handleRegistration}
                  onViewRegistrations={handleViewRegistrations}
                />
              ))}
            </div>
          </div>
        )}

        {/* Past Events Section */}
        {!loading && pastEvents.length > 0 && (
          <div>
            <div className="flex items-center mb-4 gap-2">
              <h2 className="text-xl font-bold text-amber-900">Past Events</h2>
              <Badge className="bg-gray-100 text-gray-800 border border-gray-300">
                {pastEvents.length}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {pastEvents.map((event) => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  isUpcoming={false}
                  onEdit={handleEditEvent}
                  onDelete={handleDeleteEvent}
                  onRegister={handleRegistration}
                  onViewRegistrations={handleViewRegistrations}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateEventModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false)
          fetchEvents()
        }}
      />

      <EditEventModal
        show={showEditModal}
        event={selectedEvent}
        onClose={() => {
          setShowEditModal(false)
          setSelectedEvent(null)
        }}
        onSuccess={() => {
          setShowEditModal(false)
          setSelectedEvent(null)
          fetchEvents()
        }}
      />

      <DeleteEventModal
        show={showDeleteModal}
        event={selectedEvent}
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedEvent(null)
        }}
        onSuccess={() => {
          setShowDeleteModal(false)
          setSelectedEvent(null)
          fetchEvents()
        }}
      />

      <RegistrationModal
        show={showRegistrationModal}
        event={selectedEvent}
        registrationType={registrationType}
        selectedItems={selectedItems}
        unregisteredFamilies={unregisteredFamilies}
        unregisteredParishioners={unregisteredParishioners}
        onClose={() => {
          setShowRegistrationModal(false)
          setSelectedEvent(null)
          setSelectedItems([])
        }}
        onItemSelection={handleItemSelection}
        onRegister={handleRegister}
        calculateTotal={calculateTotal}
        getTotalMembers={getTotalMembers}
      />

      <ConfirmationModal
        show={showConfirmation}
        event={selectedEvent}
        registrationType={registrationType}
        selectedItems={selectedItems}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleRegistrationSuccess}
        calculateTotal={calculateTotal}
        getTotalMembers={getTotalMembers}
      />

      <RegisteredParishionersModal
        show={showRegisteredModal}
        event={selectedEvent}
        registeredParishioners={registeredParishioners}
        onClose={() => {
          setShowRegisteredModal(false);
          setSelectedEvent(null);
        }}
      />
    </Layout>
  )
}

export default Events
