# Ticketing System - Implementation Guide

## Overview
The Ticketing System is a comprehensive support and issue tracking module integrated across all HMIS modules. It allows users to create, track, and manage tickets for bug reports, feature requests, support issues, and general inquiries from any module.

## Backend Implementation

### Models
**Location:** `backend/models/Ticket.js`

Key fields:
- `ticketId` (String, unique) - Unique identifier
- `title` (String) - Ticket title
- `description` (String) - Detailed description
- `module` (Enum) - Module where ticket originated (26+ options)
- `priority` (Enum) - Low, Medium, High, Critical
- `status` (Enum) - Open, In Progress, On Hold, Resolved, Closed, Reopened
- `category` (Enum) - Bug, Feature Request, Support, General Inquiry, System Error, Data Issue
- `createdBy` (ObjectId) - Reference to User who created ticket
- `assignedTo` (ObjectId) - Reference to User assigned for resolution
- `comments` (Array) - Embedded comments with author and timestamp
- `resolution` - Resolution details (resolvedBy, notes, resolvedAt)
- `attachments` (Array) - File attachments
- `tags` (Array) - Custom tags for categorization
- `timeTracking` - Estimated and actual hours
- `relatedItem` (String) - Reference to related item (e.g., patient ID, appointment ID)

### API Endpoints
**Base URL:** `http://localhost:5000/api/tickets`

#### GET Endpoints
- `GET /api/tickets` - List all tickets (paginated, filterable)
  - Query params: `page`, `limit`, `module`, `status`, `priority`, `category`, `assignedTo`, `search`
- `GET /api/tickets/:id` - Get ticket details
- `GET /api/tickets/module/:module` - Get tickets for specific module
- `GET /api/tickets/assigned/me` - Get user's assigned tickets
- `GET /api/tickets/status/:status` - Get tickets by status
- `GET /api/tickets/stats/summary` - Get statistics

#### POST Endpoints
- `POST /api/tickets` - Create new ticket
- `POST /api/tickets/:id/comment` - Add comment to ticket
  - Body: `{ text: "comment text" }`

#### PUT Endpoints
- `PUT /api/tickets/:id` - Update ticket (status, priority, etc.)
- `PUT /api/tickets/:id/assign` - Assign ticket to user
  - Body: `{ assignedTo: "userId" }`
- `PUT /api/tickets/:id/resolve` - Mark ticket as resolved
  - Body: `{ notes: "resolution notes" }`
- `PUT /api/tickets/:id/close` - Close ticket

#### DELETE Endpoints
- `DELETE /api/tickets/:id` - Delete ticket

## Frontend Implementation

### Components

#### 1. Ticketing.tsx (Main Page)
**Location:** `frontend/src/pages/Ticketing.tsx`

Features:
- List all tickets with filtering and search
- Create new ticket dialog
- Filter by module, status, priority
- Search by ticket ID, title, or description
- View ticket detail in modal
- Display ticket statistics

Usage:
```typescript
import Ticketing from "@/pages/Ticketing";

// Use in routing
<Route path="/ticketing" element={<Ticketing />} />
```

#### 2. TicketDetail.tsx (Detail Component)
**Location:** `frontend/src/components/TicketDetail.tsx`

Features:
- View full ticket details
- Change status and priority
- View/add comments
- View resolution information
- Update ticket information

Usage:
```typescript
import TicketDetail from "@/components/TicketDetail";

// Use as modal content
<TicketDetail ticketId={selectedId} onClose={handleClose} />
```

### Configuration

#### Module Configuration
**Location:** `frontend/src/config/modules.ts`

The Ticketing module is configured with:
- Key: `"ticketing"`
- Label: `"Ticketing System"`
- Icon: `Ticket` (from lucide-react)
- Color: Orange (`"30 80% 50%"`)
- Base path: `/ticketing`

Submodules:
- All Tickets: `/ticketing`
- New Ticket: `/ticketing/new`
- My Tickets: `/ticketing/mytickets`
- Statistics: `/ticketing/stats`

## Integration with Other Modules

### Adding Ticketing to a Module

#### 1. Add Ticket Creation Button
```typescript
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

// In component JSX
<Dialog>
  <DialogTrigger asChild>
    <Button size="sm" variant="outline">
      <Plus className="w-4 h-4" /> Report Issue
    </Button>
  </DialogTrigger>
  <DialogContent>
    {/* Ticket creation form */}
  </DialogContent>
</Dialog>
```

#### 2. Pre-fill Module and Related Item
```typescript
// When creating a ticket from Patients module
const newTicket = {
  ticketId: "TKT-001",
  title: "Issue Title",
  description: "Issue Description",
  module: "Patients",
  relatedItem: patientId, // Pre-fill with current context
  priority: "Medium",
  category: "Support",
};
```

#### 3. Show Related Tickets
```typescript
// Get tickets for a specific module and item
const fetchRelatedTickets = async (module: string, relatedItem: string) => {
  const response = await fetch(
    `http://localhost:5000/api/tickets?module=${module}&relatedItem=${relatedItem}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.json();
};
```

## Usage Workflow

### Creating a Ticket
1. Click "New Ticket" button
2. Fill in required fields:
   - Ticket ID (auto-generated or custom)
   - Title
   - Module
   - Description
3. Select priority and category
4. Click "Create Ticket"

### Managing Tickets
1. Use filters to find specific tickets
2. Search by ticket ID, title, or keywords
3. Click "View" to open ticket details
4. Update status, priority, or add comments
5. Assign to team member if needed

### Resolving Tickets
1. Open ticket details
2. Add resolution comment
3. Change status to "Resolved"
4. Optionally close ticket

## Statistics

The system provides the following metrics:
- Total tickets count
- Open tickets count
- Critical priority tickets count
- In Progress tickets count
- Tickets resolved today
- Tickets by module
- Tickets by priority
- Tickets by status

## Authentication

All API endpoints require JWT token authentication. Token should be passed in:
```
Authorization: Bearer <token>
```

Token is retrieved from `localStorage.getItem('token')`

## Best Practices

1. **Ticket IDs:** Use consistent naming (e.g., TKT-001, TKT-002)
2. **Priority:** Use Critical only for urgent issues
3. **Module:** Always select the correct module for better organization
4. **Description:** Be detailed to help with resolution
5. **Comments:** Use comments to track progress and discussion
6. **Assignment:** Assign tickets to prevent confusion

## Future Enhancements

- [ ] Email notifications on ticket updates
- [ ] Ticket templates for common issues
- [ ] SLA management and tracking
- [ ] Bulk operations (update multiple tickets)
- [ ] Export tickets to PDF/Excel
- [ ] Ticket priorities based on SLA
- [ ] Integration with external issue trackers
- [ ] Automated ticket routing based on category
- [ ] Mobile app support

## Troubleshooting

### Tickets not loading
- Check network connection
- Verify authentication token is valid
- Check browser console for errors

### Cannot create ticket
- Ensure all required fields are filled
- Check module selection
- Verify user has permission to create tickets

### Comments not saving
- Check authentication token
- Verify comment text is not empty
- Check for network errors in console

## Support

For issues or questions regarding the Ticketing System:
1. Create a ticket in the Ticketing module
2. Contact IT Support
3. Check system logs in admin panel
