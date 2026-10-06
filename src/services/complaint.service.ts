import {
  ComplaintTicket,
  ComplaintStatus,
  ComplaintPriority,
  ComplaintResponse,
  ComplaintNotification,
  CreateComplaintInput,
} from "@/types/complaint.types";

// In-Memory Database Store for Complaint Tickets
const MOCK_COMPLAINTS: ComplaintTicket[] = [
  {
    id: "cmp-1001",
    ticketNumber: "TKT-2026-9001",
    user: {
      id: "u-101",
      fullName: "Aditya Kumar",
      email: "aditya@example.com",
      phone: "+91 98765 43210",
    },
    owner: {
      id: "owner-1",
      name: "Vikram Malhotra",
      email: "vikram@urbannest.com",
      phone: "+91 98112 23344",
    },
    property: {
      id: "prop-1",
      title: "UrbanNest Executive Co-Living & PG",
      locality: "Indiranagar",
      city: "Bengaluru",
    },
    room: {
      id: "r-204",
      roomNumber: "Room 204-B",
      sharingType: "Double Sharing AC",
    },
    stay: {
      id: "stay-8001",
      moveInDate: "2026-10-03",
    },
    category: "ELECTRICITY",
    title: "AC Air Conditioner Remote & Cooling Fan Fault in 204",
    description: "The split AC unit in Room 204-B is tripping the main circuit breaker whenever turned to 18°C. Also the remote sensor is unresponsive.",
    attachments: [
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80",
    ],
    priority: "HIGH",
    status: "IN_PROGRESS",
    responses: [
      {
        id: "resp-1",
        senderRole: "STUDENT",
        senderName: "Aditya Kumar",
        message: "Lodged complaint. Facing cooling issues since yesterday evening.",
        createdAt: "2026-10-04T10:00:00Z",
      },
      {
        id: "resp-2",
        senderRole: "OWNER",
        senderName: "Vikram Malhotra",
        message: "Inspected circuit breaker. Electrician technician scheduled for visit today at 4 PM.",
        createdAt: "2026-10-04T14:30:00Z",
      },
    ],
    notifications: [
      {
        id: "notif-1",
        recipientRole: "STUDENT",
        message: "Complaint TKT-2026-9001 status changed to IN_PROGRESS by Owner.",
        createdAt: "2026-10-04T14:30:00Z",
        read: false,
      },
    ],
    created_at: "2026-10-04T10:00:00Z",
    updated_at: "2026-10-04T14:30:00Z",
  },
  {
    id: "cmp-1002",
    ticketNumber: "TKT-2026-9002",
    user: {
      id: "u-101",
      fullName: "Aditya Kumar",
      email: "aditya@example.com",
      phone: "+91 98765 43210",
    },
    owner: {
      id: "owner-1",
      name: "Vikram Malhotra",
      email: "vikram@urbannest.com",
      phone: "+91 98112 23344",
    },
    property: {
      id: "prop-1",
      title: "UrbanNest Executive Co-Living & PG",
      locality: "Indiranagar",
      city: "Bengaluru",
    },
    room: {
      id: "r-204",
      roomNumber: "Room 204-B",
      sharingType: "Double Sharing AC",
    },
    stay: {
      id: "stay-8001",
      moveInDate: "2026-10-03",
    },
    category: "WATER",
    title: "Bathroom Water Heater Geyser Pressure Drop",
    description: "Geyser hot water flow is very slow during peak morning hours (7 AM - 9 AM).",
    attachments: [],
    priority: "MEDIUM",
    status: "RESOLVED",
    responses: [
      {
        id: "resp-3",
        senderRole: "STUDENT",
        senderName: "Aditya Kumar",
        message: "Please check geyser pressure valve.",
        createdAt: "2026-10-02T09:00:00Z",
      },
      {
        id: "resp-4",
        senderRole: "OWNER",
        senderName: "Vikram Malhotra",
        message: "Plumber cleared inlet valve scaling. Pressure restored.",
        createdAt: "2026-10-03T11:00:00Z",
      },
    ],
    resolution: "Plumber cleared inlet valve scaling and replaced pressure filter. Hot water flow restored.",
    notifications: [
      {
        id: "notif-2",
        recipientRole: "STUDENT",
        message: "Complaint TKT-2026-9002 marked RESOLVED by Owner.",
        createdAt: "2026-10-03T11:00:00Z",
        read: true,
      },
    ],
    created_at: "2026-10-02T09:00:00Z",
    resolved_at: "2026-10-03T11:00:00Z",
    updated_at: "2026-10-03T11:00:00Z",
  },
  {
    id: "cmp-1003",
    ticketNumber: "TKT-2026-9003",
    user: {
      id: "u-102",
      fullName: "Neha Sharma",
      email: "neha@example.com",
      phone: "+91 97112 88990",
    },
    owner: {
      id: "owner-2",
      name: "Rajesh Gupta",
      email: "rajesh@guptapg.com",
      phone: "+91 98223 34455",
    },
    property: {
      id: "prop-2",
      title: "Starlight Ladies Hostel & Luxury PG",
      locality: "Koramangala",
      city: "Bengaluru",
    },
    room: {
      id: "r-301",
      roomNumber: "Room 301-A",
      sharingType: "Single Occupancy Premium",
    },
    stay: {
      id: "stay-8002",
      moveInDate: "2026-09-15",
    },
    category: "SECURITY",
    title: "Biometric Main Gate Access Scanner Failure",
    description: "Biometric fingerprint scanner fails to recognize after 9 PM. Night security guard required.",
    attachments: [],
    priority: "URGENT",
    status: "OPEN",
    responses: [],
    notifications: [],
    created_at: "2026-10-05T08:00:00Z",
    updated_at: "2026-10-05T08:00:00Z",
  },
];

export class ComplaintService {
  async getStudentComplaints(userId: string): Promise<ComplaintTicket[]> {
    return MOCK_COMPLAINTS.filter((c) => c.user.id === userId || userId === "guest" || userId === "u-101");
  }

  async getOwnerComplaints(ownerId?: string): Promise<ComplaintTicket[]> {
    if (!ownerId || ownerId === "all") return MOCK_COMPLAINTS;
    return MOCK_COMPLAINTS.filter((c) => c.owner.id === ownerId || ownerId === "owner-1");
  }

  async getAdminComplaints(): Promise<ComplaintTicket[]> {
    return MOCK_COMPLAINTS;
  }

  async getComplaintById(id: string): Promise<ComplaintTicket | null> {
    return MOCK_COMPLAINTS.find((c) => c.id === id) || null;
  }

  async createComplaint(input: CreateComplaintInput): Promise<ComplaintTicket> {
    const ticketId = `cmp-${Date.now()}`;
    const ticketNumber = `TKT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const newTicket: ComplaintTicket = {
      id: ticketId,
      ticketNumber,
      user: {
        id: input.userId || "u-101",
        fullName: "Aditya Kumar",
        email: "aditya@example.com",
        phone: "+91 98765 43210",
      },
      owner: {
        id: "owner-1",
        name: "Vikram Malhotra",
        email: "vikram@urbannest.com",
        phone: "+91 98112 23344",
      },
      property: {
        id: "prop-1",
        title: "UrbanNest Executive Co-Living & PG",
        locality: "Indiranagar",
        city: "Bengaluru",
      },
      room: {
        id: "r-204",
        roomNumber: "Room 204-B",
        sharingType: "Double Sharing AC",
      },
      stay: {
        id: input.stayId || "stay-8001",
        moveInDate: "2026-10-03",
      },
      category: input.category,
      title: input.title,
      description: input.description,
      attachments: input.attachments || [],
      priority: input.priority,
      status: "OPEN",
      responses: [
        {
          id: `resp-${Date.now()}`,
          senderRole: "STUDENT",
          senderName: "Aditya Kumar",
          message: input.description,
          attachments: input.attachments,
          createdAt: now,
        },
      ],
      notifications: [
        {
          id: `notif-${Date.now()}`,
          recipientRole: "OWNER",
          message: `New Complaint ${ticketNumber} raised: ${input.title}`,
          createdAt: now,
          read: false,
        },
      ],
      created_at: now,
      updated_at: now,
    };

    MOCK_COMPLAINTS.unshift(newTicket);
    return newTicket;
  }

  async addComplaintResponse(
    complaintId: string,
    senderRole: "STUDENT" | "OWNER" | "ADMIN",
    senderName: string,
    message: string,
    attachments?: string[]
  ): Promise<ComplaintTicket> {
    const ticket = MOCK_COMPLAINTS.find((c) => c.id === complaintId);
    if (!ticket) throw new Error("Complaint ticket not found");

    const now = new Date().toISOString();
    const newResponse: ComplaintResponse = {
      id: `resp-${Date.now()}`,
      senderRole,
      senderName,
      message,
      attachments,
      createdAt: now,
    };

    ticket.responses.push(newResponse);
    ticket.updated_at = now;

    // Send notifications to counterpart roles
    const recipientRole: "STUDENT" | "OWNER" | "ADMIN" =
      senderRole === "STUDENT" ? "OWNER" : "STUDENT";

    const notif: ComplaintNotification = {
      id: `notif-${Date.now()}`,
      recipientRole,
      message: `New response on ticket ${ticket.ticketNumber} from ${senderName}`,
      createdAt: now,
      read: false,
    };

    ticket.notifications = ticket.notifications || [];
    ticket.notifications.push(notif);

    return ticket;
  }

  async updateComplaintStatus(
    complaintId: string,
    status: ComplaintStatus,
    resolution?: string,
    updatedByRole: "STUDENT" | "OWNER" | "ADMIN" = "OWNER"
  ): Promise<ComplaintTicket> {
    const ticket = MOCK_COMPLAINTS.find((c) => c.id === complaintId);
    if (!ticket) throw new Error("Complaint ticket not found");

    const now = new Date().toISOString();
    ticket.status = status;
    ticket.updated_at = now;

    if (resolution) {
      ticket.resolution = resolution;
    }

    if (status === "RESOLVED" || status === "CLOSED") {
      ticket.resolved_at = now;
    }

    // Add status notification log
    const notifMessage = `Complaint ${ticket.ticketNumber} status updated to ${status} by ${updatedByRole}.`;
    ticket.notifications = ticket.notifications || [];
    ticket.notifications.push({
      id: `notif-${Date.now()}`,
      recipientRole: updatedByRole === "STUDENT" ? "OWNER" : "STUDENT",
      message: notifMessage,
      createdAt: now,
      read: false,
    });

    return ticket;
  }

  async escalateComplaintPriority(
    complaintId: string,
    priority: ComplaintPriority
  ): Promise<ComplaintTicket> {
    const ticket = MOCK_COMPLAINTS.find((c) => c.id === complaintId);
    if (!ticket) throw new Error("Complaint ticket not found");

    const now = new Date().toISOString();
    ticket.priority = priority;
    ticket.updated_at = now;

    ticket.notifications = ticket.notifications || [];
    ticket.notifications.push({
      id: `notif-${Date.now()}`,
      recipientRole: "OWNER",
      message: `Admin escalated ticket ${ticket.ticketNumber} priority to ${priority}.`,
      createdAt: now,
      read: false,
    });

    return ticket;
  }
}

export const complaintService = new ComplaintService();
