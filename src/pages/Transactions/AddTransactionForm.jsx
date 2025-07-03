"use client";

import { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/Select";
import { Label } from "../../components/ui/Label";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { useToaster } from "../../components/Toaster";
import axiosInstance from "../../api-handler/api-handler";

const AddTransactionForm = forwardRef(({ onClose, onSuccess }, ref) => {
  const { success, error: toastError } = useToaster();
  const [formData, setFormData] = useState({
    amount: "",
    type: "INCOME",
    description: "",
    receiptUrl: "",
    category: "EVENT_REGISTRATION",
    customCategory: "",
  });
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [isEventListOpen, setIsEventListOpen] = useState(false);
  const [eventSearch, setEventSearch] = useState(""); // State for search input
  const amountInputRef = useRef(null); // Ref for the Amount input

  // Expose focusForm method to parent via ref
  useImperativeHandle(ref, () => ({
    focusForm() {
      if (amountInputRef.current) {
        amountInputRef.current.focus();
      }
    },
  }));

  // Memoized fetchEvents function
  const fetchEvents = useCallback(async () => {
    try {
      setIsLoadingEvents(true);
      const response = await axiosInstance.get("/api/events/all");
      console.log("Fetched events:", response.data.events);
      setEvents(Array.isArray(response.data.events) ? response.data.events : []);
      setIsLoadingEvents(false);
    } catch (err) {
      console.error("Error fetching events:", err.message, err.response?.data);
      setFetchError("Failed to fetch events");
      setIsLoadingEvents(false);
      toastError("Failed to load events");
    }
  }, []);

  // Fetch events only once on mount
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Toggle event list visibility
  const toggleEventList = () => {
    setIsEventListOpen((prev) => !prev);
    setEventSearch(""); // Reset search when toggling the list
  };

  // Handle event selection
  const handleEventClick = (event) => {
    console.log("Selected event registrationFees:", event.registrationFees); // Debug log
    setSelectedEvent(event);
    const eventTitle = event.title || "Unnamed Event";
    setFormData((prev) => ({
      ...prev,
      type: "INCOME",
      description: `Event Registration: ${eventTitle}`,
      category: "EVENT_REGISTRATION",
      amount: event.registrationFees != null ? event.registrationFees.toString() : "",
    }));
    setIsEventListOpen(false);
    setEventSearch(""); // Reset search on selection
  };

  // Handle form input changes
  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setEventSearch(e.target.value);
  };

  // Filter events based on search input
  const filteredEvents = events.filter((event) =>
    (event.title || "Unnamed Event").toLowerCase().includes(eventSearch.toLowerCase())
  );

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axiosInstance.post("/api/transactions/create", {
        amount: parseFloat(formData.amount),
        type: formData.type,
        description: formData.description || null,
        receiptUrl: formData.receiptUrl || null,
        eventId: selectedEvent ? parseInt(selectedEvent.id) : null,
        category: formData.category,
        customCategory: formData.customCategory || null,
      });

      success(response.data.message);
      onSuccess();
      onClose();
      setFormData({
        amount: "",
        type: "INCOME",
        description: "",
        receiptUrl: "",
        category: "EVENT_REGISTRATION",
        customCategory: "",
      });
      setSelectedEvent(null);
    } catch (err) {
      console.error("Error submitting transaction:", err);
      toastError("Failed to create transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-amber-200 mb-6">
      <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100 border-b border-amber-200">
        <CardTitle className="text-amber-900 text-lg">Add New Transaction</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                className="col-span-3 border-amber-300 focus:border-amber-500"
                required
                readOnly={selectedEvent}
                ref={amountInputRef}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleChange("type", value)}
                disabled={selectedEvent}
                required
              >
                <SelectTrigger className="col-span-3 border-amber-300">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCOME">Income</SelectItem>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="col-span-3 border-amber-300 focus:border-amber-500"
                readOnly={selectedEvent}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="receiptUrl" className="text-right">Receipt URL</Label>
              <Input
                id="receiptUrl"
                value={formData.receiptUrl}
                onChange={(e) => handleChange("receiptUrl", e.target.value)}
                className="col-span-3 border-amber-300 focus:border-amber-500"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Select Event</Label>
              <div className="col-span-3">
                <div
                  className="flex items-center justify-between px-3 py-2 border border-amber-300 rounded-md bg-amber-50 cursor-pointer text-sm font-medium text-amber-800 hover:bg-amber-100"
                  onClick={toggleEventList}
                >
                  <span>{selectedEvent ? selectedEvent.title || "Unnamed Event" : "Select an Event"}</span>
                  <span className={`transform transition-transform ${isEventListOpen ? "rotate-180" : "rotate-0"}`}>
                    ▼
                  </span>
                </div>
                {isEventListOpen && (
                  <div className="mt-1">
                    <Input
                      type="text"
                      placeholder="Search events..."
                      value={eventSearch}
                      onChange={handleSearchChange}
                      className="mb-2 border-amber-300 focus:border-amber-500"
                    />
                    {isLoadingEvents && (
                      <p className="text-gray-500 text-sm px-3 py-2">Loading events...</p>
                    )}
                    {fetchError && (
                      <p className="text-red-500 text-sm px-3 py-2">{fetchError}</p>
                    )}
                    {!isLoadingEvents && !fetchError && filteredEvents.length === 0 && (
                      <p className="text-gray-500 text-sm px-3 py-2">
                        {eventSearch ? "No events match your search" : "No ongoing events"}
                      </p>
                    )}
                    {!isLoadingEvents && !fetchError && filteredEvents.length > 0 && (
                      <ul className="max-h-40 overflow-y-auto border border-amber-300 rounded-md bg-amber-50">
                        {filteredEvents.map((event) => (
                          <li
                            key={event.id}
                            className={`px-3 py-1 text-sm font-medium cursor-pointer transition-colors ${
                              selectedEvent?.id === event.id
                                ? "bg-amber-200 text-amber-900"
                                : "hover:bg-amber-100 text-amber-800"
                            }`}
                            onClick={() => handleEventClick(event)}
                          >
                            {event.title || "Unnamed Event"} -{" "}
                            {new Date(event.startTime).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleChange("category", value)}
                disabled={selectedEvent}
                required
              >
                <SelectTrigger className="col-span-3 border-amber-300">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUNDAY_COLLECTION">Sunday Collection</SelectItem>
                  <SelectItem value="DONATION">Donation</SelectItem>
                  <SelectItem value="SUBSCRIPTION_FEES">Subscription Fees</SelectItem>
                  <SelectItem value="EVENT_REGISTRATION">Event Registration</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  <SelectItem value="SALARY">Salary</SelectItem>
                  <SelectItem value="EVENT_EXPENSE">Event Expense</SelectItem>
                  <SelectItem value="CHARITY">Charity</SelectItem>
                  <SelectItem value="DUMPBOX">Dumpbox</SelectItem>
                  <SelectItem value="SUNDAY_OFFERING">Sunday Offering</SelectItem>
                  <SelectItem value="SUBSCRIPTION">Subscription</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customCategory" className="text-right">Custom Category</Label>
              <Input
                id="customCategory"
                value={formData.customCategory}
                onChange={(e) => handleChange("customCategory", e.target.value)}
                className="col-span-3 border-amber-300 focus:border-amber-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-amber-300 text-amber-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isSubmitting ? "Submitting..." : "Add Transaction"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
});

export default AddTransactionForm;