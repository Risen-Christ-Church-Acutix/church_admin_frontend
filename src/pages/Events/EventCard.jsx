import { Button } from "../../components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"
import { Badge } from "../../components/ui/Badge"
import {
  Calendar,
  Clock,
  IndianRupee,
  Users,
  User,
  Edit,
  Trash2,
  Sparkles,
  Home,
  CreditCard,
  MapPin,
  Eye
} from "lucide-react"

const EventCard = ({ event, isUpcoming = true, onEdit, onDelete, onRegister, onViewRegistrations }) => {
  const getCategoryGradient = (category) => {
    const gradients = {
      MASS: "from-blue-500 to-blue-600",
      FEAST_DAY: "from-red-500 to-red-600",
      RETREAT: "from-green-500 to-green-600",
      MEETING: "from-yellow-500 to-yellow-600",
      OTHER: "from-gray-500 to-gray-600",
    }
    return gradients[category] || gradients.OTHER
  }

  const getCategoryBadgeColor = (category) => {
    const colors = {
      MASS: "bg-blue-100 text-blue-800 border-blue-300",
      FEAST_DAY: "bg-red-100 text-red-800 border-red-300",
      RETREAT: "bg-green-100 text-green-800 border-green-300",
      MEETING: "bg-yellow-100 text-yellow-800 border-yellow-300",
      OTHER: "bg-gray-100 text-gray-800 border-gray-300",
    }
    return colors[category] || colors.OTHER
  }

  // Add this function to check if event is within a week
  const isWithinNextWeek = () => {
    if (!event.startTime) return false;
    
    const eventDate = new Date(event.startTime);
    const today = new Date();
    
    // Set hours to beginning of day for comparison
    today.setHours(0, 0, 0, 0);
    
    // Calculate difference in days
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Check if event is within next 7 days and not in the past
    return diffDays >= 0 && diffDays <= 7;
  };

  // Check if event has ended
  const hasEnded = () => {
    if (!event.startTime) return false;
    
    const eventDate = new Date(event.startTime);
    const now = new Date();
    
    return eventDate < now;
  };

  const isEventEnded = hasEnded();

  // Get total registered members
  const totalRegistered = event.totalRegistered || 0
  
  return (
    <Card
      className={`group relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
        isUpcoming ? "ring-4 ring-amber-400 ring-opacity-50 shadow-xl border border-amber-300" : "shadow-lg border border-gray-200"
      } flex flex-col h-[650px] min-h-[650px]`}
    >
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryGradient(event.category)} opacity-5`} />

      {/* Category Color Strip */}
      <div className={`h-2 bg-gradient-to-r ${getCategoryGradient(event.category)}`} />

      <CardHeader className="relative pb-4 pt-8">
        {/* Featured/Upcoming Tag */}
        {isUpcoming && isWithinNextWeek() && (
          <div className="absolute top-0 right-0 z-10">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 text-xs font-bold rounded-bl-xl flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              FEATURED
            </div>
          </div>
        )}
        
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-2">
            {/* Fixed height for title with line clamping and tooltip */}
            <div className="min-h-[36px] mb-3 relative group/title">
              <CardTitle className="text-amber-900 text-xl group-hover:text-amber-700 transition-colors line-clamp-1 leading-6 pb-1">
                {event.title}
              </CardTitle>
              <div className="absolute invisible group-hover/title:visible opacity-0 group-hover/title:opacity-100 transition-opacity duration-200 bg-white p-2 rounded shadow-lg border border-amber-200 z-20 min-w-[200px] max-w-[300px] text-sm text-amber-900 left-0 mt-1">
                {event.title}
              </div>
            </div>
            <Badge className={`${getCategoryBadgeColor(event.category)} font-semibold`}>
              {event.category.replace(/_/g, " ")}
            </Badge>
          </div>
          <div className="flex space-x-1 ml-1 flex-shrink-0 relative z-20">
            <Button
              size="sm"
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:scale-110 transition-all"
              onClick={() => onEdit(event)}
            >
              <Edit className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50 hover:scale-110 transition-all"
              onClick={() => onDelete(event)}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Card Content */}
      <CardContent className="space-y-4 relative flex flex-col flex-grow">
        {/* Description with tooltip - Fixed height */}
        <div className="mb-3">
          <h4 className="text-sm font-semibold text-amber-700 mb-1">Description:</h4>
          <div className="relative group/desc">
            <p className="text-amber-800 text-sm leading-5 h-10 overflow-hidden text-ellipsis whitespace-nowrap bg-amber-50 p-2 rounded">
              {event.description || "No description available"}
            </p>
            <div className="absolute invisible group-hover/desc:visible opacity-0 group-hover/desc:opacity-100 transition-opacity duration-200 bg-white p-3 rounded shadow-lg border border-amber-200 z-20 min-w-[200px] max-w-[300px] text-sm text-amber-900 left-0 mt-1">
              {event.description || "No description available"}
            </div>
          </div>
        </div>

        {/* Event Details Grid */}
        <div className="grid grid-cols-1 gap-2 mb-auto">
          <div className="flex items-center text-sm text-amber-700 bg-amber-50 p-2 rounded-lg">
            <Calendar className="w-4 h-4 mr-3 text-amber-600 flex-shrink-0" />
            <span className="font-medium">
              {new Date(event.startTime).toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>

          <div className="flex items-center text-sm text-amber-700 bg-amber-50 p-2 rounded-lg">
            <Clock className="w-4 h-4 mr-3 text-amber-600 flex-shrink-0" />
            <span className="font-medium">
              {new Date(event.startTime).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "Asia/Kolkata"
              })}
            </span>
          </div>

          <div className="flex items-center text-sm text-amber-700 bg-amber-50 p-2 rounded-lg">
            <Clock className="w-4 h-4 mr-3 text-amber-600 flex-shrink-0" />
            <span className="font-medium">Duration: {event.duration} minutes</span>
          </div>

          <div className="flex items-center text-sm text-amber-700 bg-amber-50 p-2 rounded-lg">
            <MapPin className="w-4 h-4 mr-3 text-amber-600 flex-shrink-0" />
            <span className="font-medium">{event.location || "Church hall"}</span>
          </div>

          <div className="flex items-center text-sm text-amber-700 bg-amber-50 p-2 rounded-lg">
            <IndianRupee className="w-4 h-4 mr-3 text-amber-600 flex-shrink-0" />
            <span className="font-medium">
              {event.registrationFees === 0 ? "Free Event" : `₹${event.registrationFees} per person`}
            </span>
          </div>
        </div>

        {/* Registration Stats */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-3 rounded-lg border border-blue-200 mt-auto">
          <div className="text-xs text-gray-600 mb-1 font-medium">Current Registrations</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center text-sm">
              <Home className="w-4 h-4 mr-1 text-blue-600 flex-shrink-0" />
              <span className="font-semibold text-blue-700">{event.familiesRegistered || 0} Families</span>
            </div>
            <div className="flex items-center text-sm">
              <Users className="w-4 h-4 mr-1 text-purple-600 flex-shrink-0" />
              <span className="font-semibold text-purple-700">{totalRegistered} Total</span>
            </div>
          </div>
        </div>

        {/* Registration Buttons */}
        <div className="pt-2 border-t border-amber-200 mt-3">
          <div className="text-xs text-amber-600 mb-2 font-medium flex items-center">
            <CreditCard className="w-3 h-3 mr-1 flex-shrink-0" />
            {isEventEnded ? "Event Management" : "Registration Options"}
          </div>
          
          {/* Only show registration buttons if event hasn't ended */}
          {!isEventEnded && (
            <div className="grid grid-cols-2 gap-2 mb-2">
              <Button
                size="sm"
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium transition-all hover:scale-105 h-8 text-xs"
                onClick={() => onRegister(event, "family")}
              >
                <Users className="w-3 h-3 mr-1 flex-shrink-0" />
                Family
              </Button>
              <Button
                size="sm"
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium transition-all hover:scale-105 h-8 text-xs"
                onClick={() => onRegister(event, "individual")}
              >
                <User className="w-3 h-3 mr-1 flex-shrink-0" />
                Individual
              </Button>
            </div>
          )}
          
          {/* View Registrations button - always show this */}
          <Button
            size="sm"
            className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-medium transition-all hover:scale-105 h-8 text-xs w-full"
            onClick={() => onViewRegistrations(event)}
          >
            <Eye className="w-3 h-3 mr-1 flex-shrink-0" />
            View Registrations
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;