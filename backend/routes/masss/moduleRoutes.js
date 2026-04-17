const express = require('express');
const router = express.Router();
const {
    createModule,
    getModules,
    getModule,
    updateModule,
    deleteModule
} = require('../../controllers/masss/moduleController');
const { protect } = require('../../middleware/auth');

router.use(protect); // All module routes are private

router.route('/')
    .post(createModule) // POST /modules/
    .get(getModules);   // GET /modules/

router.route('/:id')
    .get(getModule)     // GET /modules/{module_id}
    .put(updateModule)   // PUT /modules/{module_id}
    .delete(deleteModule); // DELETE /modules/{module_id}

module.exports = router;