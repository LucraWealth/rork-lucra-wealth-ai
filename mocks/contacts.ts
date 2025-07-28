export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  recentTransaction?: boolean;
}

export const contacts: Contact[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    phone: "+1 (555) 123-4567",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    recentTransaction: true,
  },
  {
    id: "2",
    name: "John Smith",
    email: "john@example.com",
    phone: "+1 (555) 987-6543",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    recentTransaction: true,
  },
  {
    id: "3",
    name: "Emma Wilson",
    email: "emma@example.com",
    phone: "+1 (555) 456-7890",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    recentTransaction: true,
  },
  {
    id: "4",
    name: "Michael Brown",
    email: "michael@example.com",
    phone: "+1 (555) 789-0123",
    avatar: "https://randomuser.me/api/portraits/men/2.jpg",
  },
  {
    id: "5",
    name: "Olivia Davis",
    email: "olivia@example.com",
    phone: "+1 (555) 234-5678",
    avatar: "https://randomuser.me/api/portraits/women/3.jpg",
  },
  {
    id: "6",
    name: "James Wilson",
    email: "james@example.com",
    phone: "+1 (555) 345-6789",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
  },
  {
    id: "7",
    name: "Sophia Martinez",
    email: "sophia@example.com",
    phone: "+1 (555) 456-7890",
    avatar: "https://randomuser.me/api/portraits/women/4.jpg",
  },
  {
    id: "8",
    name: "William Taylor",
    email: "william@example.com",
    phone: "+1 (555) 567-8901",
    avatar: "https://randomuser.me/api/portraits/men/4.jpg",
  },
];