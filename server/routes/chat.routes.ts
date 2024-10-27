import { Router } from 'express';
import { accessChat, fetchChat, createGroupChat, renameGroup, addToGroup, removeFromGroup, findChat } from '../controllers/chat.controllers';
import { verifyUser } from '../middlewares/authMiddleware'; // Renamed middleware

const router = Router();

router.post('/', verifyUser, accessChat);
router.get('/', verifyUser, fetchChat);
router.post('/group', verifyUser, createGroupChat);
router.put('/rename', verifyUser, renameGroup);
router.put('/groupadd', verifyUser, addToGroup);
router.put('/groupremove', verifyUser, removeFromGroup);
router.get('/findChat/:userId', verifyUser, findChat);

export default router;
