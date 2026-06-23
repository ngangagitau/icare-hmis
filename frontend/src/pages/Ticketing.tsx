import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Plus, Search, Eye, MessageSquare, User, Calendar } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import TicketDetail from '@/components/TicketDetail';

interface Ticket {
  _id: string;
  ticketId: string;
  title: string;
  description: string;
  module: string;
  priority: string;
  status: string;
  category: string;
  createdBy: {
    name: string;
    email: string;
  };
  assignedTo?: {
    name: string;
  };
  comments?: any[];
  createdAt: string;
  updatedAt: string;
}

export default function Ticketing() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialQueryModule = searchParams.get('module') || 'all';

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState(initialQueryModule);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [newTicketDialogOpen, setNewTicketDialogOpen] = useState(location.pathname === '/ticketing/new');
  const [newTicket, setNewTicket] = useState({
    ticketId: '',
    title: '',
    description: '',
    module: initialQueryModule === 'all' ? '' : initialQueryModule,
    priority: 'Medium',
    category: 'General Inquiry',
  });

  const modules = [
    'Dashboard',
    'Appointments',
    'Patient Registry',
    'Emergency / A&E',
    'Triage & Nursing',
    "Doctor's Module",
    'Cashier & Billing',
    'Insurance & TPA',
    'Laboratory',
    'Radiology',
    'Pharmacy',
    'In-Patient',
    'Operation Theatre',
    'Blood Bank',
    'CSSD',
    'Nutrition & Diet',
    'Telemedicine',
    'Mortuary',
    'Procurement',
    'Inventory',
    'Accounts Receivable',
    'General Ledger',
    'Fixed Assets',
    'HR & Payroll',
    'Messaging',
    'IT & Support',
    'Reports',
    'Administration',
    'Super Admin',
  ];

  const priorities = ['Low', 'Medium', 'High', 'Critical'];
  const statuses = ['Open', 'In Progress', 'On Hold', 'Resolved', 'Closed', 'Reopened'];
  const categories = ['Bug', 'Feature Request', 'Support', 'General Inquiry', 'System Error', 'Data Issue'];

  // Fetch tickets
  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    const moduleParam = new URLSearchParams(location.search).get('module');
    if (moduleParam) {
      setFilterModule(moduleParam);
      setNewTicket((prev) => ({ ...prev, module: moduleParam }));
    } else {
      setFilterModule('all');
    }
  }, [location.search]);

  useEffect(() => {
    setNewTicketDialogOpen(location.pathname === '/ticketing/new');
  }, [location.pathname]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/tickets', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTickets(data.data);
        setFilteredTickets(data.data);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter tickets
  useEffect(() => {
    let filtered = tickets;

    if (searchTerm) {
      filtered = filtered.filter(
        (ticket) =>
          ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterModule && filterModule !== 'all') {
      filtered = filtered.filter((ticket) => ticket.module === filterModule);
    }

    if (filterStatus && filterStatus !== 'all') {
      filtered = filtered.filter((ticket) => ticket.status === filterStatus);
    }

    if (filterPriority && filterPriority !== 'all') {
      filtered = filtered.filter((ticket) => ticket.priority === filterPriority);
    }

    setFilteredTickets(filtered);
  }, [searchTerm, filterModule, filterStatus, filterPriority, tickets]);

  const handleCreateTicket = async () => {
    if (!newTicket.ticketId || !newTicket.title || !newTicket.description || !newTicket.module) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newTicket),
      });

      if (response.ok) {
        alert('Ticket created successfully');
        setNewTicket({
          ticketId: '',
          title: '',
          description: '',
          module: '',
          priority: 'Medium',
          category: 'General Inquiry',
        });
        fetchTickets();
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Error creating ticket');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-600';
      case 'High':
        return 'bg-orange-600';
      case 'Medium':
        return 'bg-blue-600';
      case 'Low':
        return 'bg-green-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-yellow-100 text-yellow-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      case 'Closed':
        return 'bg-gray-100 text-gray-800';
      case 'On Hold':
        return 'bg-orange-100 text-orange-800';
      case 'Reopened':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Ticketing System</h1>
          <p className="text-gray-500">Manage support tickets across all modules</p>
        </div>
        <Dialog open={newTicketDialogOpen} onOpenChange={setNewTicketDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Ticket</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Ticket ID</label>
                <Input
                  placeholder="e.g., TKT-001"
                  value={newTicket.ticketId}
                  onChange={(e) => setNewTicket({ ...newTicket, ticketId: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="Ticket title"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Module</label>
                <Select value={newTicket.module} onValueChange={(val) => setNewTicket({ ...newTicket, module: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select module" />
                  </SelectTrigger>
                  <SelectContent>
                    {modules.map((module) => (
                      <SelectItem key={module} value={module}>
                        {module}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  placeholder="Ticket description"
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Priority</label>
                <Select value={newTicket.priority} onValueChange={(val) => setNewTicket({ ...newTicket, priority: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priority}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={newTicket.category} onValueChange={(val) => setNewTicket({ ...newTicket, category: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateTicket} className="w-full">
                Create Ticket
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tickets..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={filterModule} onValueChange={setFilterModule}>
              <SelectTrigger>
                <SelectValue placeholder="All Modules" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                {modules.map((module) => (
                  <SelectItem key={module} value={module}>
                    {module}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger>
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {priorities.map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    {priority}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setFilterModule('all');
                setFilterStatus('all');
                setFilterPriority('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <div className="space-y-3">
        {loading ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Loading tickets...</AlertDescription>
          </Alert>
        ) : filteredTickets.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>No tickets found</AlertDescription>
          </Alert>
        ) : (
          filteredTickets.map((ticket) => (
            <Card key={ticket._id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{ticket.title}</h3>
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{ticket.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                      <span>ID: {ticket.ticketId}</span>
                      <span>Module: {ticket.module}</span>
                      <span>Category: {ticket.category}</span>
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>Created by: {ticket.createdBy.name}</span>
                      </div>
                      {ticket.assignedTo && (
                        <span>Assigned to: {ticket.assignedTo.name}</span>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                      </div>
                      {ticket.comments && ticket.comments.length > 0 && (
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          <span>{ticket.comments.length} comments</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                      setSelectedTicketId(ticket._id);
                      setShowDetailModal(true);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tickets.filter((t) => t.status === 'Open').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Critical Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tickets.filter((t) => t.priority === 'Critical').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tickets.filter((t) => t.status === 'In Progress').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicketId && (
        <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <TicketDetail
              ticketId={selectedTicketId}
              onClose={() => {
                setShowDetailModal(false);
                setSelectedTicketId(null);
                fetchTickets(); // Refresh tickets after any changes
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}