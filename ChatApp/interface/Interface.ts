// interface/Interface.ts
export interface User {
    route: any;
    id: number;
    name: string;
    email: string;
    pic: string;
    token: string;
  }
  

  export interface AppContextType {
    data: string;
    users: User | undefined;
    setUsers: (users: User | undefined) => void;
    allChat: Chat[]; // Add this property to the interface
  }
  

// In your interface file (Interface.ts)
 

export interface Chat {
  id: number;
  chatName: string;
  isGroupChat: boolean;
  latestMessage: {
    id: number;
    content: string;
    senderId: number;
    chatId: number;
    createdAt: string;
    updatedAt: string;
    sender: User;
  } | null;
  groupAdmin: string | null;
  groupAdminId: number | null;
  createdAt: string;
  updatedAt: string;
  users: Array<User>;
}
