import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface CustomRequest extends Request {
  id?: number; // Assuming the current user's ID is stored in req.id
}

// export const accessChat = async (
//   req: CustomRequest,
//   res: Response
// ): Promise<void> => {
//   const { userId } = req.body;
//   console.log(userId);

//   if (!userId) {
//     console.error("userId parameter not sent with request.");
//     res.status(400).json({ message: "User ID is required" });
//     return;
//   }

//   try {
//     // Check if a one-on-one chat already exists between the two users
//     const existingChat = await prisma.chat.findFirst({
//       where: {
//         isGroupChat: false,
//         users: {
//           some: { id: req.id }, // Check if the current user is part of the chat
//         },
//       },
//       include: {
//         users: {
//           select: {
//             id: true,
//             name: true,
//             pic: true,
//             email: true,
//           },
//         },
//       },
//     });

//     // Check if the existing chat's users include both users
//     if (existingChat && existingChat.users.some((user) => user.id === userId)) {
//       // Fetch the latest message separately, since it's not a direct relation
//       const latestMessage = await prisma.message.findFirst({
//         where: { chatId: existingChat.id },
//         orderBy: { createdAt: 'desc' },
//         include: {
//           sender: {
//             select: { name: true, pic: true, email: true },
//           },
//         },
//       });

//       res.status(200).json({ ...existingChat, latestMessage });
//       return;
//     }

//     // Create a new chat if none exists
//     const newChat = await prisma.chat.create({
//       data: {
//         chatName: `Chat between ${req.id} and ${userId}`, // Provide meaningful chat name
//         isGroupChat: false,
//         users: { connect: [{ id: req.id }, { id: userId }] }, // Connect both users
//       },
//       include: {
//         users: {
//           select: {
//             id: true,
//             name: true,
//             pic: true,
//             email: true,
//           },
//         },
//       },
//     });

//     res.status(200).json(newChat);
//   } catch (error) {
//     console.error("Error accessing chat:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };





// Fetch chats for a logged-in user

export const accessChat = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const { userId } = req.body;
  console.log(userId);

  if (!userId) {
    console.error("userId parameter not sent with request.");
    res.status(400).json({ message: "User ID is required" });
    return;
  }

  try {
    // Check if a one-on-one chat already exists between the two users
    const existingChat = await prisma.chat.findFirst({
      where: {
        isGroupChat: false,
        AND: [
          { users: { some: { id: req.id } } },  // Current user
          { users: { some: { id: userId } } }, // Other user
        ],
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            pic: true,
            email: true,
          },
        },
      },
    });

    if (existingChat) {
      // If chat exists, return the existing chat
      const latestMessage = await prisma.message.findFirst({
        where: { chatId: existingChat.id },
        orderBy: { createdAt: 'desc' },
        include: {
          sender: {
            select: { name: true, pic: true, email: true },
          },
        },
      });

      res.status(200).json({ ...existingChat, latestMessage });
      return;
    }

    // Create a new chat if none exists
    const newChat = await prisma.chat.create({
      data: {
        chatName: `Chat between ${req.id} and ${userId}`, // Provide meaningful chat name
        isGroupChat: false,
        users: { connect: [{ id: req.id }, { id: userId }] }, // Connect both users
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            pic: true,
            email: true,
          },
        },
      },
    });

    res.status(200).json(newChat);
  } catch (error) {
    console.error("Error accessing chat:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};




export const fetchChat = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const chats = await prisma.chat.findMany({
      where: {
        users: { some: { id: req.id } },
      },
      include: {
        users: {
          select: { id: true, name: true, pic: true, email: true },
        },
        groupAdmin: {
          select: { id: true, name: true, pic: true, email: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Fetch latest messages for each chat
    const chatsWithLatestMessages = await Promise.all(
      chats.map(async (chat) => {
        const latestMessage = await prisma.message.findFirst({
          where: { chatId: chat.id },
          orderBy: { createdAt: 'desc' },
          include: {
            sender: {
              select: { name: true, pic: true, email: true },
            },
          },
        });
        return { ...chat, latestMessage };
      })
    );

    res.status(200).json(chatsWithLatestMessages);
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Create a group chat
export const createGroupChat = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const { users: usersJSON, name } = req.body;

  if (!usersJSON || !name) {
    res.status(400).json({ message: "Please fill all the fields" });
    return;
  }

  let users: number[];

  try {
    users = JSON.parse(usersJSON).map(Number);
  } catch (error) {
    res.status(400).json({ message: "Invalid users data" });
    return;
  }

  if (users.length < 2) {
    res
      .status(400)
      .json({ message: "More than 2 users required to form a group chat" });
    return;
  }

  // Ensure that the user ID is added and no duplicates exist
  const uniqueUsers = Array.from(new Set([...users, req.id]));

  try {
    const groupChat = await prisma.chat.create({
      data: {
        chatName: name,
        isGroupChat: true,
        groupAdmin: { connect: { id: req.id } },
        users: { connect: uniqueUsers.map((userId) => ({ id: userId })) },
      },
      include: {
        users: { select: { id: true, name: true, pic: true, email: true } },
        groupAdmin: {
          select: { id: true, name: true, pic: true, email: true },
        },
      },
    });

    console.log(groupChat);
    res.status(200).json(groupChat);
  } catch (error) {
    console.error("Error creating group chat:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

// Rename a group chat
export const renameGroup = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const { chatId, chatName } = req.body;

  try {
    const updatedChat = await prisma.chat.update({
      where: { id: chatId },
      data: { chatName },
      include: {
        users: { select: { id: true, name: true, pic: true, email: true } },
        groupAdmin: {
          select: { id: true, name: true, pic: true, email: true },
        },
      },
    });

    res.status(200).json(updatedChat);
  } catch (error) {
    console.error("Error renaming group:", error);
    res.status(404).json({ message: "Chat Not Found" });
  }
};

// Add a user to a group chat
export const addToGroup = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const { chatId, userId } = req.body;

  if (!userId) {
    res.status(400).json({ message: "User ID is required" });
    return
  }

  try {
    const updatedChat = await prisma.chat.update({
      where: { id: chatId },
      data: {
        users: {
          connect: { id: userId },
        },
      },
      include: {
        users: { select: { id: true, name: true, pic: true, email: true } },
        groupAdmin: {
          select: { id: true, name: true, pic: true, email: true },
        },
      },
    });

    res.status(200).json(updatedChat);
  } catch (error) {
    console.error("Error adding user to group:", error);
    res.status(404).json({ message: "Chat Not Found" });
  }
};

// Remove a user from a group chat
export const removeFromGroup = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const { chatId, userId } = req.body;

  if (!userId) {
     res.status(400).json({ message: "User ID is required" });
     return
  }

  try {
    const updatedChat = await prisma.chat.update({
      where: { id: chatId },
      data: {
        users: {
          disconnect: { id: userId },
        },
      },
      include: {
        users: { select: { id: true, name: true, pic: true, email: true } },
        groupAdmin: {
          select: { id: true, name: true, pic: true, email: true },
        },
      },
    });

    res.status(200).json(updatedChat);
  } catch (error) {
    console.error("Error removing user from group:", error);
    res.status(404).json({ message: "Chat Not Found" });
  }
};



export const findChat = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const { userId } = req.params;  // Correctly accessing the param 'userId'
   
  if (!userId) {
    res.status(400).json({ message: "User ID is required" });
    return;
  }

  try {
    const chat = await prisma.chat.findFirst({
      where: {
        isGroupChat: false,
        AND: [
          { users: { some: { id: req.id } } },  // Current user
          { users: { some: { id: Number(userId) } } },  // Other user
        ],
      },
      include: {
        users: { select: { id: true, name: true, pic: true, email: true } },
      },
    });
   
    console.log(chat)
    if (chat) {
      res.status(200).json(chat);
    } else {
      res.status(404).json({ message: "No chat found between the users" });
    }
  } catch (error) {
    console.error("Error finding chat:", error);
    res.status(500).json(error);
  }
};
