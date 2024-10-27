import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

interface CustomRequest extends Request {
  id?: number; // Assuming 'id' is from the verified user middleware
}

// @description     Get all Messages
// @route           GET /api/message/:chatId
// @access          Protected
// export const allMessages = async (
//   req: CustomRequest,
//   res: Response
// ): Promise<void> => {
//   const { chatId } = req.params;

//   if (!chatId || isNaN(Number(chatId))) {
//     res.status(400).json({ message: "Invalid chatId" });
//     return;
//   }

//   try {
//     const messages = await prisma.message.findMany({
//       where: { chatId: Number(chatId) }, // Ensure chatId is treated as number
//       include: {
//         sender: {
//           select: {
//             name: true,
//             pic: true,
//             email: true,
//           },
//         },
//         chat: true,
//       },
//     });

//     if (!messages.length) {
//       res.status(200).json([]);
//       return;
//     }

//     res.status(200).json(messages);
//   } catch (error) {
//     console.error("Error fetching messages:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };


export const allMessages = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const { chatId } = req.params;

  if (!chatId || isNaN(Number(chatId))) {
    res.status(400).json({ message: "Invalid chatId" });
    return;
  }

  try {
    const messages = await prisma.message.findMany({
      where: { chatId: Number(chatId) },
      include: {
        sender: {
          select: {
            name: true,
            pic: true,
            email: true,
          },
        },
        chat: true,
      },
      orderBy: {
        createdAt: 'desc', // Order messages by creation time in descending order
      },
    });

    if (!messages.length) {
      res.status(200).json([]);
      return;
    }

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// @description     Create New Message
// @route           POST /api/message/
// @access          Protected
export const sendMessage = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const { content, chatId } = req.body;

  if (!content || !chatId || isNaN(Number(chatId))) {
    res.status(400).json({ message: "Invalid content or chatId" });
    return;
  }

  try {
    // Log incoming data
    console.log("Sending message with content:", content, "to chatId:", chatId);

    // Create new message
    const newMessage = await prisma.message.create({
      data: {
        senderId: req.id!, // Ensure senderId is set from the authenticated user
        content: content,
        chatId: Number(chatId), // Ensure chatId is treated as number
      },
      include: {
        sender: {
          select: {
            name: true,
            pic: true,
          },
        },
        chat: {
          include: {
            users: {
              select: {
                name: true,
                pic: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Update the chat's latestMessage with the newly created message
    // Update the chat's latestMessageId with the newly created message's ID
    await prisma.chat.update({
      where: { id: Number(chatId) },
      data: { latestMessageId: newMessage.id }, // Use latestMessageId instead of latestMessage
    });

    console.log("New message created:", newMessage);
    res.status(201).json(newMessage);
  } catch (error: any) {
    console.error("Error sending message:", error);
    res
      .status(400)
      .json({ message: error.message || "Failed to send message" });
  }
};

// npx prisma migrate dev --name fix-message-unique-constraint
