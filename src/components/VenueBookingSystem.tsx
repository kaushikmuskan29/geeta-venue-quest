/**
 * Geeta University Venue Booking System
 * 
 * This is a comprehensive venue booking system for Geeta University that allows
 * Head of Department (HOD) users to book venues with the following features:
 * 
 * - Three available venues: Auditorium, E Block Seminar Hall, D Block Seminar Hall
 * - Weekly calendar interface for date selection
 * - Time slot booking system (9 AM to 6 PM)
 * - Booking form with name, department, and purpose
 * - My Bookings page for viewing and managing personal bookings
 * - Local storage for data persistence
 * - Beautiful responsive UI with university-themed design
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Building, FileText, Plus, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

// Types for the booking system
interface Booking {
  id: string;
  venueId: string;
  venueName: string;
  date: string;
  timeSlot: string;
  bookerName: string;
  department: string;
  purpose: string;
  status: 'Pending' | 'Approved' | 'Cancelled';
  createdAt: string;
}

interface Venue {
  id: string;
  name: string;
  description: string;
  capacity: string;
  location: string;
  features: string[];
}

interface TimeSlot {
  id: string;
  time: string;
  period: string;
}

// Static data for venues
const VENUES: Venue[] = [
  {
    id: 'auditorium',
    name: 'Main Auditorium',
    description: 'Large capacity auditorium perfect for conferences, seminars, and major events',
    capacity: '500 seats',
    location: 'Main Building, Ground Floor',
    features: ['Air Conditioning', 'Projector', 'Sound System', 'Stage', 'Microphones']
  },
  {
    id: 'e-block-seminar',
    name: 'E Block Seminar Hall',
    description: 'Modern seminar hall ideal for workshops, presentations, and departmental meetings',
    capacity: '100 seats',
    location: 'E Block, 2nd Floor',
    features: ['Air Conditioning', 'Projector', 'Whiteboard', 'Wi-Fi', 'Video Conferencing']
  },
  {
    id: 'd-block-seminar',
    name: 'D Block Seminar Hall',
    description: 'Versatile seminar hall suitable for training sessions and academic events',
    capacity: '80 seats',
    location: 'D Block, 1st Floor',
    features: ['Air Conditioning', 'Smart Board', 'Audio System', 'Wi-Fi']
  }
];

// Time slots for booking (9 AM to 6 PM)
const TIME_SLOTS: TimeSlot[] = [
  { id: '9-10', time: '09:00 - 10:00', period: 'AM' },
  { id: '10-11', time: '10:00 - 11:00', period: 'AM' },
  { id: '11-12', time: '11:00 - 12:00', period: 'AM' },
  { id: '12-13', time: '12:00 - 13:00', period: 'PM' },
  { id: '13-14', time: '13:00 - 14:00', period: 'PM' },
  { id: '14-15', time: '14:00 - 15:00', period: 'PM' },
  { id: '15-16', time: '15:00 - 16:00', period: 'PM' },
  { id: '16-17', time: '16:00 - 17:00', period: 'PM' },
  { id: '17-18', time: '17:00 - 18:00', period: 'PM' }
];

/**
 * Mock user data - simulating an authenticated HOD user
 */
const MOCK_USER = {
  id: 'hod_001',
  name: 'Dr. Rajesh Kumar',
  department: 'Computer Science',
  role: 'HOD'
};

/**
 * Utility function to generate unique booking IDs
 */
const generateBookingId = (): string => {
  return `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Utility function to format dates for display
 */
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Utility function to get next 7 days for weekly calendar
 */
const getWeekDates = (): Date[] => {
  const dates: Date[] = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date);
  }
  
  return dates;
};

/**
 * Main Venue Booking System Component
 */
const VenueBookingSystem: React.FC = () => {
  // State management for the booking system
  const [activeTab, setActiveTab] = useState('booking');
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  
  // Form state for booking details
  const [bookingForm, setBookingForm] = useState({
    bookerName: MOCK_USER.name,
    department: MOCK_USER.department,
    purpose: ''
  });

  const { toast } = useToast();

  /**
   * Load bookings from localStorage on component mount
   */
  useEffect(() => {
    const savedBookings = localStorage.getItem('geeta_university_bookings');
    if (savedBookings) {
      setBookings(JSON.parse(savedBookings));
    }
    setWeekDates(getWeekDates());
  }, []);

  /**
   * Save bookings to localStorage whenever bookings change
   */
  useEffect(() => {
    localStorage.setItem('geeta_university_bookings', JSON.stringify(bookings));
  }, [bookings]);

  /**
   * Check if a time slot is already booked for a venue and date
   */
  const isTimeSlotBooked = (venueId: string, date: string, timeSlot: string): boolean => {
    return bookings.some(
      booking => 
        booking.venueId === venueId && 
        booking.date === date && 
        booking.timeSlot === timeSlot &&
        booking.status !== 'Cancelled'
    );
  };

  /**
   * Handle venue selection
   */
  const handleVenueSelect = (venue: Venue) => {
    setSelectedVenue(venue);
    setSelectedDate('');
    setSelectedTimeSlot('');
    setShowBookingForm(false);
  };

  /**
   * Handle date selection
   */
  const handleDateSelect = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    setSelectedDate(dateStr);
    setSelectedTimeSlot('');
    setShowBookingForm(false);
  };

  /**
   * Handle time slot selection
   */
  const handleTimeSlotSelect = (timeSlotId: string) => {
    if (selectedVenue && selectedDate) {
      if (isTimeSlotBooked(selectedVenue.id, selectedDate, timeSlotId)) {
        toast({
          title: "Time Slot Unavailable",
          description: "This time slot is already booked. Please select another time.",
          variant: "destructive"
        });
        return;
      }
      setSelectedTimeSlot(timeSlotId);
      setShowBookingForm(true);
    }
  };

  /**
   * Handle booking form submission
   */
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedVenue || !selectedDate || !selectedTimeSlot || !bookingForm.purpose.trim()) {
      toast({
        title: "Incomplete Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const newBooking: Booking = {
      id: generateBookingId(),
      venueId: selectedVenue.id,
      venueName: selectedVenue.name,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      bookerName: bookingForm.bookerName,
      department: bookingForm.department,
      purpose: bookingForm.purpose,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    setBookings(prev => [...prev, newBooking]);
    
    // Reset form and selection
    setBookingForm({ ...bookingForm, purpose: '' });
    setShowBookingForm(false);
    setSelectedTimeSlot('');
    
    toast({
      title: "Booking Submitted Successfully!",
      description: `Your booking for ${selectedVenue.name} on ${formatDate(selectedDate)} has been submitted for approval.`,
    });
  };

  /**
   * Handle booking cancellation
   */
  const handleCancelBooking = (bookingId: string) => {
    setBookings(prev => 
      prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'Cancelled' as const }
          : booking
      )
    );
    
    toast({
      title: "Booking Cancelled",
      description: "Your booking has been cancelled successfully.",
    });
  };

  /**
   * Render venue selection cards
   */
  const renderVenueSelection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {VENUES.map((venue) => (
        <Card 
          key={venue.id} 
          className={`venue-card cursor-pointer ${
            selectedVenue?.id === venue.id ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => handleVenueSelect(venue)}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5 text-primary" />
              {venue.name}
            </CardTitle>
            <CardDescription>{venue.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4" />
                <span>{venue.capacity}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{venue.location}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {venue.features.map((feature, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  /**
   * Render weekly calendar
   */
  const renderWeeklyCalendar = () => (
    <Card className="venue-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Select Date
        </CardTitle>
        <CardDescription>Choose a date for your booking</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {weekDates.map((date, index) => {
            const isToday = date.toDateString() === new Date().toDateString();
            const isPast = date < new Date() && !isToday;
            const isSelected = selectedDate === date.toISOString().split('T')[0];
            
            return (
              <Button
                key={index}
                variant={isSelected ? "default" : "outline"}
                className={`flex flex-col h-auto p-3 ${
                  isPast ? 'opacity-50 cursor-not-allowed' : ''
                } ${isToday ? 'ring-2 ring-accent' : ''}`}
                onClick={() => !isPast && handleDateSelect(date)}
                disabled={isPast}
              >
                <span className="text-xs font-medium">
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <span className="text-lg font-bold">
                  {date.getDate()}
                </span>
                <span className="text-xs">
                  {date.toLocaleDateString('en-US', { month: 'short' })}
                </span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  /**
   * Render time slot selection
   */
  const renderTimeSlots = () => (
    <Card className="venue-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Select Time Slot
        </CardTitle>
        <CardDescription>Choose an available time slot</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {TIME_SLOTS.map((slot) => {
            const isBooked = selectedVenue && selectedDate ? 
              isTimeSlotBooked(selectedVenue.id, selectedDate, slot.id) : false;
            const isSelected = selectedTimeSlot === slot.id;
            
            return (
              <Button
                key={slot.id}
                variant={isSelected ? "default" : "outline"}
                className={`time-slot h-auto p-3 flex flex-col ${
                  isBooked ? 'time-slot booked' : ''
                } ${isSelected ? 'time-slot selected' : ''}`}
                onClick={() => !isBooked && handleTimeSlotSelect(slot.id)}
                disabled={isBooked || !selectedDate}
              >
                <span className="font-medium">{slot.time}</span>
                {isBooked && <span className="text-xs">Booked</span>}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  /**
   * Render booking form
   */
  const renderBookingForm = () => (
    <Card className="booking-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5 text-accent" />
          Booking Details
        </CardTitle>
        <CardDescription>
          Complete your booking for {selectedVenue?.name} on {formatDate(selectedDate)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleBookingSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bookerName">Name</Label>
              <Input
                id="bookerName"
                value={bookingForm.bookerName}
                onChange={(e) => setBookingForm(prev => ({ ...prev, bookerName: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={bookingForm.department}
                onChange={(e) => setBookingForm(prev => ({ ...prev, department: e.target.value }))}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose of Booking</Label>
            <Textarea
              id="purpose"
              placeholder="Describe the purpose of your booking..."
              value={bookingForm.purpose}
              onChange={(e) => setBookingForm(prev => ({ ...prev, purpose: e.target.value }))}
              required
              rows={3}
            />
          </div>
          <div className="flex gap-3">
            <Button type="submit" variant="venue" className="flex-1">
              <Check className="w-4 h-4 mr-2" />
              Submit Booking
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowBookingForm(false)}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  /**
   * Render my bookings list
   */
  const renderMyBookings = () => {
    const userBookings = bookings.filter(booking => booking.bookerName === MOCK_USER.name);
    
    if (userBookings.length === 0) {
      return (
        <Card className="venue-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Bookings Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              You haven't made any venue bookings yet. Start by booking a venue!
            </p>
            <Button variant="hero" onClick={() => setActiveTab('booking')}>
              Make Your First Booking
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {userBookings.map((booking) => (
          <Card key={booking.id} className="booking-card">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    {booking.venueName}
                  </CardTitle>
                  <CardDescription>
                    {formatDate(booking.date)} • {
                      TIME_SLOTS.find(slot => slot.id === booking.timeSlot)?.time
                    }
                  </CardDescription>
                </div>
                <Badge 
                  variant={
                    booking.status === 'Pending' ? 'secondary' :
                    booking.status === 'Approved' ? 'default' : 'destructive'
                  }
                >
                  {booking.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Purpose</Label>
                  <p className="text-sm text-muted-foreground">{booking.purpose}</p>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Booked on: {new Date(booking.createdAt).toLocaleDateString()}
                  </span>
                  {booking.status === 'Pending' && (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleCancelBooking(booking.id)}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      {/* Header */}
      <div className="hero-gradient text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">Geeta University</h1>
            <h2 className="text-2xl font-semibold mb-4">Venue Booking System</h2>
            <div className="flex items-center justify-center gap-4 text-primary-foreground/90">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{MOCK_USER.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                <span>{MOCK_USER.department} Department</span>
              </div>
              <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground">
                {MOCK_USER.role}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="booking" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Book Venue
            </TabsTrigger>
            <TabsTrigger value="my-bookings" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              My Bookings
            </TabsTrigger>
          </TabsList>

          {/* Booking Tab */}
          <TabsContent value="booking" className="space-y-6">
            {/* Step 1: Venue Selection */}
            <div>
              <h3 className="text-2xl font-semibold mb-4">Step 1: Select Venue</h3>
              {renderVenueSelection()}
            </div>

            {/* Step 2: Date Selection */}
            {selectedVenue && (
              <div>
                <h3 className="text-2xl font-semibold mb-4">Step 2: Select Date</h3>
                {renderWeeklyCalendar()}
              </div>
            )}

            {/* Step 3: Time Slot Selection */}
            {selectedVenue && selectedDate && (
              <div>
                <h3 className="text-2xl font-semibold mb-4">Step 3: Select Time Slot</h3>
                {renderTimeSlots()}
              </div>
            )}

            {/* Step 4: Booking Form */}
            {showBookingForm && (
              <div>
                <h3 className="text-2xl font-semibold mb-4">Step 4: Complete Booking</h3>
                {renderBookingForm()}
              </div>
            )}
          </TabsContent>

          {/* My Bookings Tab */}
          <TabsContent value="my-bookings" className="space-y-6">
            <div>
              <h3 className="text-2xl font-semibold mb-4">My Bookings</h3>
              {renderMyBookings()}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VenueBookingSystem;