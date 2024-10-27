import { Router } from 'express';
 
import { allUsers, authUser, checkAuthStatus, registerUser } from '../controllers/users.controllers';
import { verifyUser } from '../middlewares/authMiddleware';
 

const router = Router();

router.get('/', verifyUser, allUsers)
router.post('/signup', registerUser)
router.post('/login', authUser);


router.get("/check-access", checkAuthStatus);
// router.post("/logout", logout);

export default router;
