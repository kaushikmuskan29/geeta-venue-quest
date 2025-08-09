import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Building2, Calendar, Clock, Users, MapPin, ChevronDown, ChevronUp, Filter, Search, Plus, Edit, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, User } from 'lucide-react';

interface Venue {
  id: string;
  name: string;
  capacity: number;
  location: string;
  amenities: string[];
  image: string;
  type: 'classroom' | 'auditorium' | 'lab' | 'conference' | 'outdoor';
}

interface Booking {
  id: string;
  venueId: string;
  venueName: string;
  date: string;
  timeSlot: string;
  purpose: string;
  bookedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  attendees: number;
  requirements: string;
  contactEmail: string;
  department: string;
}

interface BookingFormData {
  purpose: string;
  attendees: number;
  requirements: string;
  contactEmail: string;
  department: string;
}

const VenueBookingSystem = () => {
  const { user, logout } = useAuth();
  
  const [venues] = useState<Venue[]>([
    {
      id: '1',
      name: 'Main Auditorium',
      capacity: 500,
      location: 'Academic Block A',
      amenities: ['Projector', 'Sound System', 'AC', 'Stage'],
      image: '/api/placeholder/400/250',
      type: 'auditorium'
    },
    {
      id: '2',
      name: 'Conference Hall',
      capacity: 50,
      location: 'Administrative Block',
      amenities: ['Projector', 'Whiteboard', 'AC', 'WiFi'],
      image: '/api/placeholder/400/250',
      type: 'conference'
    },
    {
      id: '3',
      name: 'Computer Lab 1',
      capacity: 40,
      location: 'IT Block',
      amenities: ['Computers', 'Projector', 'AC', 'WiFi'],
      image: '/api/placeholder/400/250',
      type: 'lab'
    },
    {
      id: '4',
      name: 'Classroom 101',
      capacity: 60,
      location: 'Academic Block B',
      amenities: ['Projector', 'Whiteboard', 'AC'],
      image: '/api/placeholder/400/250',
      type: 'classroom'
    },
    {
      id: '5',
      name: 'Sports Ground',
      capacity: 200,
      location: 'Sports Complex',
      amenities: ['Open Air', 'Lighting', 'Seating'],
      image: '/api/placeholder/400/250',
      type: 'outdoor'
    },
    {
      id: '6',
      name: 'Seminar Hall',
      capacity: 100,
      location: 'Academic Block C',
      amenities: ['Projector', 'Sound System', 'AC', 'Stage'],
      image: '/api/placeholder/400/250',
      type: 'auditorium'
    }
  ]);

  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: '1',
      venueId: '1',
      venueName: 'Main Auditorium',
      date: '2024-01-15',
      timeSlot: '09:00-11:00',
      purpose: 'Annual Function',
      bookedBy: 'Dr. Smith',
      status: 'approved',
      attendees: 300,
      requirements: 'Stage decoration, sound system',
      contactEmail: 'dr.smith@geeta.edu',
      department: 'Cultural Committee'
    },
    {
      id: '2',
      venueId: '2',
      venueName: 'Conference Hall',
      date: '2024-01-16',
      timeSlot: '14:00-16:00',
      purpose: 'Department Meeting',
      bookedBy: 'Prof. Johnson',
      status: 'pending',
      attendees: 25,
      requirements: 'Projector, refreshments',
      contactEmail: 'prof.johnson@geeta.edu',
      department: 'Computer Science'
    }
  ]);

  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCapacity, setFilterCapacity] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(false);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'venues' | 'bookings'>('venues');

  const form = useForm<BookingFormData>({
    defaultValues: {
      purpose: '',
      attendees: 1,
      requirements: '',
      contactEmail: '',
      department: ''
    }
  });

  const timeSlots = [
    '09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00',
    '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00'
  ];

  const venueTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'classroom', label: 'Classroom' },
    { value: 'auditorium', label: 'Auditorium' },
    { value: 'lab', label: 'Laboratory' },
    { value: 'conference', label: 'Conference Room' },
    { value: 'outdoor', label: 'Outdoor' }
  ];

  const filteredVenues = venues.filter(venue => {
    const matchesSearch = venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         venue.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || venue.type === filterType;
    const matchesCapacity = filterCapacity === 0 || venue.capacity >= filterCapacity;
    
    return matchesSearch && matchesType && matchesCapacity;
  });

  const isTimeSlotBooked = (venueId: string, date: string, timeSlot: string) => {
    return bookings.some(booking => 
      booking.venueId === venueId && 
      booking.date === date && 
      booking.timeSlot === timeSlot &&
      booking.status !== 'rejected'
    );
  };

  const handleBookVenue = (venue: Venue) => {
    setSelectedVenue(venue);
    setIsBookingDialogOpen(true);
  };

  const onSubmitBooking = (data: BookingFormData) => {
    if (!selectedVenue || !selectedDate || !selectedTimeSlot) return;

    const newBooking: Booking = {
      id: Date.now().toString(),
      venueId: selectedVenue.id,
      venueName: selectedVenue.name,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      purpose: data.purpose,
      bookedBy: user?.username || 'Unknown User',
      status: 'pending',
      attendees: data.attendees,
      requirements: data.requirements,
      contactEmail: data.contactEmail,
      department: data.department
    };

    setBookings(prev => [...prev, newBooking]);
    setIsBookingDialogOpen(false);
    form.reset();
    setSelectedVenue(null);
    setSelectedDate('');
    setSelectedTimeSlot('');
  };

  const updateBookingStatus = (bookingId: string, status: 'approved' | 'rejected') => {
    setBookings(prev => 
      prev.map(booking => 
        booking.id === bookingId ? { ...booking, status } : booking
      )
    );
  };

  const deleteBooking = (bookingId: string) => {
    setBookings(prev => prev.filter(booking => booking.id !== bookingId));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/10">
      {/* Header with User Info */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Building2 className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Geeta University
                </h1>
                <p className="text-sm text-muted-foreground">Venue Booking System</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <User className="w-4 h-4" />
                <span className="font-medium">{user?.username}</span>
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full capitalize">
                  {user?.userType}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Rest of the existing component content */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-secondary/50 p-1 rounded-lg w-fit">
          <Button
            variant={activeTab === 'venues' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('venues')}
            className="flex items-center space-x-2"
          >
            <Building2 className="w-4 h-4" />
            <span>Browse Venues</span>
          </Button>
          <Button
            variant={activeTab === 'bookings' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('bookings')}
            className="flex items-center space-x-2"
          >
            <Calendar className="w-4 h-4" />
            <span>My Bookings</span>
          </Button>
        </div>

        {activeTab === 'venues' && (
          <>
            {/* Search and Filter Section */}
            <Card className="venue-card">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Search className="w-5 h-5" />
                      <span>Find Your Perfect Venue</span>
                    </CardTitle>
                    <CardDescription>
                      Search and filter venues based on your requirements
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center space-x-2"
                  >
                    <Filter className="w-4 h-4" />
                    <span>Filters</span>
                    {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search venues by name or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Collapsible open={showFilters} onOpenChange={setShowFilters}>
                  <CollapsibleContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <Label htmlFor="venue-type">Venue Type</Label>
                        <select
                          id="venue-type"
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value)}
                          className="w-full mt-1 p-2 border border-input rounded-md bg-background"
                        >
                          {venueTypes.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="min-capacity">Minimum Capacity</Label>
                        <Input
                          id="min-capacity"
                          type="number"
                          placeholder="Enter minimum capacity"
                          value={filterCapacity || ''}
                          onChange={(e) => setFilterCapacity(Number(e.target.value) || 0)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>

            {/* Venues Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVenues.map((venue) => (
                <Card key={venue.id} className="venue-card overflow-hidden group">
                  <div className="relative h-48 bg-gradient-to-br from-primary/10 to-accent/10">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Building2 className="w-16 h-16 text-primary/30" />
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 bg-white/90 text-xs font-medium rounded-full capitalize">
                        {venue.type}
                      </span>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                          {venue.name}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-2">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{venue.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{venue.capacity} people</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-foreground mb-2">Amenities:</p>
                        <div className="flex flex-wrap gap-1">
                          {venue.amenities.map((amenity, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full"
                            >
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => handleBookVenue(venue)}
                        className="w-full"
                        variant="venue"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Book This Venue
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredVenues.length === 0 && (
              <Card className="venue-card">
                <CardContent className="text-center py-12">
                  <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No venues found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search criteria or filters to find available venues.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <Card className="venue-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>My Bookings</span>
                </CardTitle>
                <CardDescription>
                  Manage your venue bookings and track their status
                </CardDescription>
              </CardHeader>
            </Card>

            {bookings.length === 0 ? (
              <Card className="venue-card">
                <CardContent className="text-center py-12">
                  <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No bookings yet</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't made any venue bookings. Start by browsing available venues.
                  </p>
                  <Button onClick={() => setActiveTab('venues')} variant="hero">
                    Browse Venues
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card key={booking.id} className="booking-card">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-semibold text-foreground">
                              {booking.venueName}
                            </h3>
                            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                              {getStatusIcon(booking.status)}
                              <span className="capitalize">{booking.status}</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span>{new Date(booking.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span>{booking.timeSlot}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              <span>{booking.attendees} attendees</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <p className="text-sm">
                              <span className="font-medium">Purpose:</span> {booking.purpose}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Department:</span> {booking.department}
                            </p>
                            {booking.requirements && (
                              <p className="text-sm">
                                <span className="font-medium">Requirements:</span> {booking.requirements}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-2">
                          {user?.userType === 'hod' && booking.status === 'pending' && (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => updateBookingStatus(booking.id, 'approved')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateBookingStatus(booking.id, 'rejected')}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                          
                          {(booking.bookedBy === user?.username || user?.userType === 'hod') && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteBooking(booking.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Booking Dialog */}
        <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Building2 className="w-5 h-5" />
                <span>Book {selectedVenue?.name}</span>
              </DialogTitle>
              <DialogDescription>
                Fill in the details below to book this venue for your event.
              </DialogDescription>
            </DialogHeader>

            {selectedVenue && (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitBooking)} className="space-y-6">
                  {/* Venue Info */}
                  <div className="bg-secondary/30 p-4 rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">{selectedVenue.name}</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>{selectedVenue.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>Capacity: {selectedVenue.capacity}</span>
                      </div>
                    </div>
                  </div>

                  {/* Date Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="booking-date">Select Date</Label>
                    <Input
                      id="booking-date"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  {/* Time Slot Selection */}
                  {selectedDate && (
                    <div className="space-y-2">
                      <Label>Select Time Slot</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {timeSlots.map((slot) => {
                          const isBooked = isTimeSlotBooked(selectedVenue.id, selectedDate, slot);
                          return (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => !isBooked && setSelectedTimeSlot(slot)}
                              className={`p-2 text-sm rounded-md border transition-colors ${
                                selectedTimeSlot === slot
                                  ? 'border-primary bg-primary text-primary-foreground'
                                  : isBooked
                                  ? 'border-destructive/50 bg-destructive/10 text-destructive cursor-not-allowed'
                                  : 'border-border hover:border-primary/50 bg-background hover:bg-primary/5'
                              }`}
                              disabled={isBooked}
                            >
                              {slot}
                              {isBooked && <div className="text-xs mt-1">Booked</div>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Booking Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="purpose"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Purpose of Booking</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Department Meeting" {...field} required />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="attendees"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Attendees</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max={selectedVenue.capacity}
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              required
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Computer Science" {...field} required />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="your.email@geeta.edu" {...field} required />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="requirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Requirements (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any special setup, equipment, or arrangements needed..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsBookingDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="hero"
                      disabled={!selectedDate || !selectedTimeSlot}
                    >
                      Submit Booking Request
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default VenueBookingSystem;
