import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { LogOut, Download, Users, Calendar, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rsvps, setRsvps] = useState([]);
  const [stats, setStats] = useState({
    total_rsvps: 0,
    total_guests: 0,
    reception_count: 0,
    muhurtham_count: 0,
  });

  useEffect(() => {
    const savedToken = localStorage.getItem("wedding_admin_token");
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchData();
    }
  }, [isAuthenticated, token]);

  const fetchData = async () => {
    try {
      const [rsvpsRes, statsRes] = await Promise.all([
        axios.get(`${API}/admin/rsvps`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setRsvps(rsvpsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      if (error.response?.status === 401) {
        handleLogout();
        toast.error("Session expired. Please login again.");
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(`${API}/admin/login`, { password });
      const newToken = response.data.token;
      setToken(newToken);
      localStorage.setItem("wedding_admin_token", newToken);
      setIsAuthenticated(true);
      toast.success("Login successful");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Invalid password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setToken("");
    setIsAuthenticated(false);
    localStorage.removeItem("wedding_admin_token");
  };

  const handleExportCSV = async () => {
    try {
      const response = await axios.get(`${API}/admin/export-csv`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "wedding_rsvps.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("CSV downloaded successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export CSV");
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatEvents = (events) => {
    return events
      .map((e) => (e === "reception" ? "Reception" : "Muhurtham"))
      .join(", ");
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FCFAF7] flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <h1 className="font-playfair text-3xl text-[#1A1A1A] mb-2" data-testid="admin-login-title">
              Admin Access
            </h1>
            <p className="font-montserrat text-sm text-[#1A1A1A]/60">
              Enter password to continue
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6" data-testid="admin-login-form">
            <div>
              <Label htmlFor="password" className="font-montserrat text-sm text-[#1A1A1A]/70 mb-2 block">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="input-wedding w-full font-montserrat"
                data-testid="input-admin-password"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full btn-gold rounded-full py-6 font-montserrat text-sm tracking-wider uppercase"
              data-testid="admin-login-button"
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="min-h-screen bg-[#FCFAF7]" data-testid="admin-dashboard">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E0D6] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="font-playfair text-xl text-[#1A1A1A]">
            Wedding RSVP Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <Button
              onClick={handleExportCSV}
              variant="outline"
              className="rounded-full px-6 border-[#A67C00] text-[#A67C00] hover:bg-[#A67C00] hover:text-white font-montserrat text-sm"
              data-testid="export-csv-button"
            >
              <Download className="w-4 h-4 mr-2" />
              Download CSV
            </Button>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="text-[#1A1A1A]/60 hover:text-[#1A1A1A] font-montserrat text-sm"
              data-testid="logout-button"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#F0EBE0] p-6 text-center" data-testid="stat-total-rsvps">
            <Users className="w-6 h-6 text-[#A67C00] mx-auto mb-2" />
            <p className="font-playfair text-3xl text-[#1A1A1A] mb-1">{stats.total_rsvps}</p>
            <p className="font-montserrat text-xs text-[#1A1A1A]/60 uppercase tracking-wider">
              Total RSVPs
            </p>
          </div>
          <div className="bg-[#F0EBE0] p-6 text-center" data-testid="stat-total-guests">
            <Users className="w-6 h-6 text-[#A67C00] mx-auto mb-2" />
            <p className="font-playfair text-3xl text-[#1A1A1A] mb-1">{stats.total_guests}</p>
            <p className="font-montserrat text-xs text-[#1A1A1A]/60 uppercase tracking-wider">
              Total Guests
            </p>
          </div>
          <div className="bg-[#F0EBE0] p-6 text-center" data-testid="stat-reception-count">
            <Calendar className="w-6 h-6 text-[#A67C00] mx-auto mb-2" />
            <p className="font-playfair text-3xl text-[#1A1A1A] mb-1">{stats.reception_count}</p>
            <p className="font-montserrat text-xs text-[#1A1A1A]/60 uppercase tracking-wider">
              Reception
            </p>
          </div>
          <div className="bg-[#F0EBE0] p-6 text-center" data-testid="stat-muhurtham-count">
            <Calendar className="w-6 h-6 text-[#A67C00] mx-auto mb-2" />
            <p className="font-playfair text-3xl text-[#1A1A1A] mb-1">{stats.muhurtham_count}</p>
            <p className="font-montserrat text-xs text-[#1A1A1A]/60 uppercase tracking-wider">
              Muhurtham
            </p>
          </div>
        </div>

        {/* RSVP Table */}
        <div className="bg-white border border-[#E5E0D6] overflow-hidden">
          <Table className="admin-table" data-testid="rsvp-table">
            <TableHeader>
              <TableRow>
                <TableHead className="font-montserrat">Timestamp</TableHead>
                <TableHead className="font-montserrat">Primary Guest</TableHead>
                <TableHead className="font-montserrat">Events</TableHead>
                <TableHead className="font-montserrat">Status</TableHead>
                <TableHead className="font-montserrat">Plus One</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rsvps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-[#1A1A1A]/50 font-montserrat">
                    No RSVPs yet
                  </TableCell>
                </TableRow>
              ) : (
                rsvps.map((rsvp) => (
                  <TableRow key={rsvp.id} data-testid={`rsvp-row-${rsvp.id}`}>
                    <TableCell className="font-montserrat text-sm text-[#1A1A1A]/70">
                      {formatDate(rsvp.timestamp)}
                    </TableCell>
                    <TableCell className="font-montserrat font-medium text-[#1A1A1A]">
                      {rsvp.full_name}
                    </TableCell>
                    <TableCell className="font-montserrat text-sm">
                      {formatEvents(rsvp.attending_events)}
                    </TableCell>
                    <TableCell className="font-montserrat text-sm">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        rsvp.guest_status === "plus_one"
                          ? "bg-[#A67C00]/10 text-[#A67C00]"
                          : "bg-[#4F6F52]/10 text-[#4F6F52]"
                      }`}>
                        {rsvp.guest_status === "plus_one" ? "With Guest" : "Solo"}
                      </span>
                    </TableCell>
                    <TableCell className="font-montserrat text-sm text-[#1A1A1A]/70">
                      {rsvp.plus_one_name || "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
