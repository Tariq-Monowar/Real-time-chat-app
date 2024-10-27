import { Router } from 'express';
import { verifyUser } from '../middlewares/authMiddleware'; // Renamed middleware
import { allMessages, sendMessage } from '../controllers/message.controllers';

const router = Router();
 

router.get("/:chatId",verifyUser, allMessages);
router.post("/", verifyUser, sendMessage);


export default router;