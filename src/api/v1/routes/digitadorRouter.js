const { Router } = require('express');
const router = Router();

const { updateNCHandler, allNCHandler, getCodigos, sendDetalle, getAllMCHandler, updateMCHandler } = require('../handlers/digitadorHandler');
const { uploadMC, uploadDocumentsDigitador } = require('../../../middlewares/uploadMiddleware');
const permisoAutorizacion = require("../../../checkers/roleAuth");


router.get('/allNC',permisoAutorizacion(["all_system_access", "read_Digitador","read_Analista1"]), allNCHandler);
router.patch('/digitarNC/:id',permisoAutorizacion(["all_system_access", "create_Digitador", "create_Analista1"]), uploadDocumentsDigitador, updateNCHandler);

router.get('/allMC',permisoAutorizacion(["all_system_access", "read_Digitador",]), getAllMCHandler);
router.patch('/updateMC/:id',permisoAutorizacion(["all_system_access", "read_Digitador",]), uploadMC, updateMCHandler);

router.get('/get_cuis',permisoAutorizacion(["all_system_access", "read_Digitador","read_Analista1"]), getCodigos);
router.get('/send_cuis/:id',permisoAutorizacion(["all_system_access", "read_Digitador","read_Analista1"]), sendDetalle);

module.exports = router;