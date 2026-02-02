import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { MapPin, Check, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const RSVPPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    attendingEvents: [],
    guestStatus: "solo",
    plusOneName: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleEventToggle = (event) => {
    setFormData((prev) => ({
      ...prev,
      attendingEvents: prev.attendingEvents.includes(event)
        ? prev.attendingEvents.filter((e) => e !== event)
        : [...prev.attendingEvents, event],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }

    if (formData.attendingEvents.length === 0) {
      toast.error("Please select at least one event to attend");
      return;
    }

    if (formData.guestStatus === "plus_one" && !formData.plusOneName.trim()) {
      toast.error("Please enter your guest's name");
      return;
    }

    setIsSubmitting(true);

    try {
      await axios.post(`${API}/rsvp`, {
        full_name: formData.fullName,
        attending_events: formData.attendingEvents,
        guest_status: formData.guestStatus,
        plus_one_name: formData.guestStatus === "plus_one" ? formData.plusOneName : null,
      });

      setIsSubmitted(true);
      toast.success("RSVP submitted successfully!");
    } catch (error) {
      console.error("RSVP submission error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#FCFAF7] paper-texture flex items-center justify-center px-6">
        <div className="text-center max-w-md animate-fade-in-up">
          <div className="w-20 h-20 rounded-full bg-[#4F6F52] flex items-center justify-center mx-auto mb-8 success-checkmark">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="font-playfair text-3xl md:text-4xl text-[#1A1A1A] mb-4">
            Thank You!
          </h2>
          <p className="font-montserrat text-[#1A1A1A]/70 text-lg leading-relaxed">
            We look forward to seeing you in Bengaluru.
          </p>
          <div className="mt-8">
            <Heart className="w-6 h-6 text-[#A67C00] mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFAF7] paper-texture">
      {/* Hero Section with Background Image */}
      <section 
        className="relative min-h-[70vh] md:min-h-[80vh] flex items-center justify-center px-6 md:px-10" 
        data-testid="hero-section"
      >
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/hero-bg.jpg')`
          }}
        />
        {/* Warm Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A1A]/50 via-[#1A1A1A]/40 to-[#FCFAF7]" />
        
        {/* Content */}
        <div className="relative z-10 max-w-2xl mx-auto text-center pt-12">
          <div className="opacity-0 animate-fade-in-up">
            <p className="font-montserrat text-sm tracking-[0.3em] uppercase text-[#F0EBE0] mb-6 drop-shadow-md">
              Wedding Invitation
            </p>
            <h1 className="font-playfair text-4xl md:text-6xl font-semibold text-white leading-tight mb-6 drop-shadow-lg" data-testid="couple-names">
              Harsha & Spoorthi
            </h1>
            <div className="w-16 h-[2px] bg-[#A67C00] mx-auto mb-6 shadow-lg"></div>
            <p className="font-montserrat text-xl md:text-2xl text-white font-medium tracking-wide drop-shadow-lg" data-testid="wedding-location">
              Bengaluru | March 2026
            </p>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-16 px-6 md:px-10" data-testid="events-section">
        <div className="max-w-2xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Reception */}
            <div className="bg-[#F0EBE0] p-8 text-center opacity-0 animate-fade-in-up animation-delay-100" data-testid="reception-card">
              <p className="font-montserrat text-xs tracking-[0.2em] uppercase text-[#A67C00] mb-4">
                Event One
              </p>
              <h3 className="font-playfair text-2xl text-[#1A1A1A] mb-3">
                The Reception
              </h3>
              <p className="font-montserrat text-[#1A1A1A]/80 mb-2">
                March 4, 2026
              </p>
              <p className="font-montserrat text-[#1A1A1A]/60 text-sm">
                7:00 PM onwards
              </p>
            </div>

            {/* Muhurtham */}
            <div className="bg-[#F0EBE0] p-8 text-center opacity-0 animate-fade-in-up animation-delay-200" data-testid="muhurtham-card">
              <p className="font-montserrat text-xs tracking-[0.2em] uppercase text-[#A67C00] mb-4">
                Event Two
              </p>
              <h3 className="font-playfair text-2xl text-[#1A1A1A] mb-3">
                The Muhurtham
              </h3>
              <p className="font-montserrat text-[#1A1A1A]/80 mb-2">
                March 5, 2026
              </p>
              {/* FIXED: Removed the <span> with font-semibold to match Reception */}
              <p className="font-montserrat text-[#1A1A1A]/60 text-sm">
                11:45 AM to 12:00 Noon
              </p>
            </div>
            </div>

          {/* Venue Button */}
          <div className="mt-10 text-center opacity-0 animate-fade-in-up animation-delay-300">
            <a
              href="https://maps.app.goo.gl/3dAi3x3nPuMbWVjV6"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="venue-map-button"
            >
              <Button
                variant="outline"
                className="rounded-full px-8 py-6 border-[#A67C00] text-[#A67C00] hover:bg-[#A67C00] hover:text-white transition-all duration-300 font-montserrat text-sm tracking-wider"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Open Venue in Google Maps
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* RSVP Form Section */}
      <section className="py-20 px-6 md:px-10" data-testid="rsvp-section">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-12 opacity-0 animate-fade-in-up animation-delay-300">
            <p className="font-montserrat text-xs tracking-[0.2em] uppercase text-[#A67C00] mb-4">
              Kindly Respond
            </p>
            <h2 className="font-playfair text-3xl md:text-4xl text-[#1A1A1A]">
              RSVP
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 opacity-0 animate-fade-in-up animation-delay-400" data-testid="rsvp-form">
            {/* Full Name */}
            <div>
              <Label htmlFor="fullName" className="font-montserrat text-sm text-[#1A1A1A]/70 mb-2 block">
                Full Name *
              </Label>
              <Input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Enter your full name"
                className="input-wedding w-full font-montserrat"
                data-testid="input-full-name"
              />
            </div>

            {/* Attending Events */}
            <div>
              <Label className="font-montserrat text-sm text-[#1A1A1A]/70 mb-4 block">
                I will be attending *
              </Label>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="reception"
                    checked={formData.attendingEvents.includes("reception")}
                    onCheckedChange={() => handleEventToggle("reception")}
                    className="checkbox-wedding"
                    data-testid="checkbox-reception"
                  />
                  <Label htmlFor="reception" className="font-montserrat text-[#1A1A1A] cursor-pointer">
                    Reception (Mar 4)
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="muhurtham"
                    checked={formData.attendingEvents.includes("muhurtham")}
                    onCheckedChange={() => handleEventToggle("muhurtham")}
                    className="checkbox-wedding"
                    data-testid="checkbox-muhurtham"
                  />
                  <Label htmlFor="muhurtham" className="font-montserrat text-[#1A1A1A] cursor-pointer">
                    Muhurtham (Mar 5)
                  </Label>
                </div>
              </div>
            </div>

            {/* Guest Status */}
            <div>
              <Label className="font-montserrat text-sm text-[#1A1A1A]/70 mb-4 block">
                Number of Guests
              </Label>
              <RadioGroup
                value={formData.guestStatus}
                onValueChange={(value) => setFormData({ ...formData, guestStatus: value })}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem
                    value="solo"
                    id="solo"
                    className="radio-wedding"
                    data-testid="radio-solo"
                  />
                  <Label htmlFor="solo" className="font-montserrat text-[#1A1A1A] cursor-pointer">
                    Coming Solo
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem
                    value="plus_one"
                    id="plus_one"
                    className="radio-wedding"
                    data-testid="radio-plus-one"
                  />
                  <Label htmlFor="plus_one" className="font-montserrat text-[#1A1A1A] cursor-pointer">
                    Bringing 1 Guest
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Plus One Name (Conditional) */}
            {formData.guestStatus === "plus_one" && (
              <div className="animate-fade-in-up" data-testid="plus-one-section">
                <Label htmlFor="plusOneName" className="font-montserrat text-sm text-[#1A1A1A]/70 mb-2 block">
                  Guest Name *
                </Label>
                <Input
                  id="plusOneName"
                  type="text"
                  value={formData.plusOneName}
                  onChange={(e) => setFormData({ ...formData, plusOneName: e.target.value })}
                  placeholder="Enter your guest's name"
                  className="input-wedding w-full font-montserrat"
                  data-testid="input-plus-one-name"
                />
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-gold rounded-full py-6 font-montserrat text-sm tracking-wider uppercase"
                data-testid="submit-rsvp-button"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <span className="spinner mr-3"></span>
                    Submitting...
                  </span>
                ) : (
                  "Confirm RSVP"
                )}
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 text-center">
        <Heart className="w-5 h-5 text-[#A67C00] mx-auto mb-4" />
        <p className="font-cormorant text-[#1A1A1A]/50 italic">
          With love, Harsha & Spoorthi
        </p>
      </footer>
    </div>
  );
};

export default RSVPPage;
