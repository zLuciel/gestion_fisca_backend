const { createDescargoNC } = require('../controllers/ncDescargoController');
const { updateNC, getNC, getAllNCforAnalista, getNCforInstructiva } = require('../controllers/ncController');
const { updateDocumento } = require('../controllers/documentoController');
const fs = require('fs');
const { analista1DescargoValidation, analista1SinDescargoValidation } = require('../validations/analista1Validation');
const { responseSocket } = require('../../../utils/socketUtils')
const { getIo } = require("../../../sockets");

const getAllNCforAnalistaHandler = async (req, res) => {
    try {
        const response = await getAllNCforAnalista();

        if (response.length === 0) {
            return res.status(200).json({
                message: 'Lista para el Analista 1 obtenido correctamente',
                data: []
            });
        }

        return res.status(200).json({
            message: "Error al traer la lista de Analista 1 desde el handler",
            data: response,
        });
    } catch (error) {
        console.error("Error del servidor al traer la lista para el Analista 1:", error);
        res.status(500).json({ error: "Error del servidor al traer la lista para el Analista 1" });
    }
};

const createDescargoNCHandler = async (req, res) => {
    const io = getIo();

    const invalidFields = await analista1DescargoValidation(req.body, req.files, req.params);

    if (invalidFields.length > 0) {
        if (req.files['documento']) {
            fs.unlinkSync(req.files['documento'][0].path);
        }
        return res.status(400).json({
            message: 'Se encontraron los siguientes errores',
            data: invalidFields
        });
    }

    const { 
        nro_descargo, fecha_descargo, id_analista1
    } = req.body;

    const { id } = req.params

    try {
        const newDescargoNC = await createDescargoNC({
            nro_descargo,
            fecha_descargo,
            documento: req.files['documento'][0],
            id_estado: 1,
            id_analista1
        });

        if (!newDescargoNC) {
            return res.status(400).json({ error: 'Error al crear el Descargo NC' });
        }

        await updateDocumento({ id_nc: id, total_documentos: newDescargoNC.documento, nuevoModulo: 'DESCARGO - NOTIFICACION DE CARGO' });

        const response = await updateNC(id, {
            id_descargo_NC: newDescargoNC.id,
            estado: 'A_I'
        });

        if (response) {
            await responseSocket({ id, method: getNCforInstructiva, socketSendName: 'sendAI1', res });
            io.emit("sendAnalista1", { id, remove: true });
        } else {
            res.status(400).json({
                message: 'Error al actualizar el NC desde el Analista1',
            });
        }

    } catch (error) {
        console.error('Error interno del servidor al actualizar el NC desde el Analista1:', error);
        return res.status(500).json({ message: 'Error interno del servidor al actualizar el NC desde el Analista1' });
    }
};

const sendWithoutDescargoHandler = async (req, res) => {
    const io = getIo();

    const invalidFields = await analista1SinDescargoValidation(req.body, req.params);

    if (invalidFields.length > 0) {
        return res.status(400).json({
            message: 'Se encontraron los siguientes errores',
            data: invalidFields
        });
    }

    const { id_analista1 } = req.body;

    const { id } = req.params

    try {
        const newDescargoNC = await createDescargoNC({
            id_analista1,
            id_estado: 2
        });

        if (!newDescargoNC) {
            return res.status(400).json({ error: 'Error al crear el descargo NC desde el Handler' });
        }

        await updateDocumento({ id_nc: id, total_documentos: '', nuevoModulo: 'SIN DESCARGO NC' });

        const response = await updateNC(id, {
            id_descargo_NC: newDescargoNC.id,
            estado: 'A_I'
        });


        if (response) {
            await responseSocket({ id, method: getNCforInstructiva, socketSendName: 'sendAI1', res });
            io.emit("sendAnalista1", { id, remove: true });

        } else {
            res.status(400).json({
                message: 'Error interno del servidor al crear el sin Descargo NC desde el Handler Analista1',
            });
        }

    } catch (error) {
        console.error('Error al crear el NC:', error);
        return res.status(500).json({ message: 'Error interno del servidor al crear el sin Descargo NC desde el Handler Analista1' });
    }
}

module.exports = { createDescargoNCHandler, getAllNCforAnalistaHandler, sendWithoutDescargoHandler };
