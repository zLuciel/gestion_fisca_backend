const { createTramiteInspector, getAllTramiteInspectorById, getMyActasController } = require('../controllers/tramiteInspectorController');
const { createMedidaComplementaria, getAllTipoMCController } = require('../controllers/medidaComplementariaController')
const { createNC, getNCforDigitador } = require('../controllers/ncController');
const { updateControlActaController } = require('../controllers/controlActaController')
const fs = require('fs');
const { createDocumento, updateDocumento } = require('../controllers/documentoController');
const { getIo } = require('../../../sockets');
const inspectorValidation = require('../validations/inspectorValidation');

const getMyActasHandler = async (req, res) => {
    const { id } = req.params;
    try {
        const response = await getMyActasController(id);

        if (response.data === 0) {
            return res.status(200).json({
                message: 'Ya no hay mas actas',
                data: {
                    data: [],
                    totalPage: response.currentPage,
                    totalCount: response.totalCount
                }
            });
        }

        return res.status(200).json({
            message: "Actas obtenidas correctamente",
            data: response,
        });
    } catch (error) {
        console.error("Error al obtener las actas:", error);
        res.status(500).json({ error: "Error interno del servidor al obtener las actas." });
    }
}


const createTramiteHandler = async (req, res) => {
    const io = getIo();

    const invalidFields = await inspectorValidation(req.body, req.files);

    if (invalidFields.length > 0) {
        if (req.files['documento_nc']) {
            fs.unlinkSync(req.files['documento_nc'][0].path);
        }
        if (req.files['documento_acta']) {
            fs.unlinkSync(req.files['documento_acta'][0].path);
        }
        if (req.files['documento_medida_complementaria']) {
            fs.unlinkSync(req.files['documento_medida_complementaria'][0].path);
        }
        return res.status(400).json({
            message: 'Se encontraron los siguientes errores',
            data: invalidFields
        });
    }

    let {
        nombre_MC,
        nro_medida_complementaria,

        id_controlActa,
        nro_nc,
        nro_acta,
        id_inspector,

    } = req.body;


    if (nombre_MC == 1) {
        nombre_MC = null;
    }
    if (nombre_MC == 2) {
        nombre_MC = 'ACTA DE EJECUCIÓN DE MEDIDA PROVICIONAL'
    }
    if (nombre_MC == 3) {
        nombre_MC = 'VALORIZACIÓN DE LA OBRA'
    }
    if (nombre_MC == 4) {
        nombre_MC = 'ACTA DE RETENCIÓN Y/O DECOMISO'
    }
    if (nombre_MC == 5) {
        nombre_MC = 'ACTA DE EVALUACIÓN SANITARIA'
    }
    if (nombre_MC == 6) {
        nombre_MC = 'INFORME TÉCNICO'
    }

    try {
        let id_medida_complementaria = null;
        let newMedidaComplementaria = null;

        const shouldCreateMedidaComplementaria = nombre_MC && nro_medida_complementaria && req.files['documento_medida_complementaria'];

        if (shouldCreateMedidaComplementaria) {
            newMedidaComplementaria = await createMedidaComplementaria({
                nombre_MC,
                nro_medida_complementaria,
                documento_medida_complementaria: req.files['documento_medida_complementaria'][0],
            });

            if (newMedidaComplementaria) {
                id_medida_complementaria = newMedidaComplementaria.id;
            } else {
                return res.status(400).json({ error: 'Error al crear la Medida Complementaria' });
            }
        }

        const newTramiteInspector = await createTramiteInspector({
            nro_nc,
            documento_nc: req.files['documento_nc'][0],
            nro_acta,
            documento_acta: req.files['documento_acta'][0],
            id_medida_complementaria,
            estado: 'DIGITADOR',
            id_inspector
        });

        if (!newTramiteInspector) {
            return res.status(400).json({ error: 'Error al crear el Trámite Inspector' });
        }

        const newNC = await createNC({ id_tramiteInspector: newTramiteInspector.id });

            const controlActa = await updateControlActaController(id_controlActa, id_inspector);

                   
            
            const modelNC = 'NOTIFICACIÓN DE CARGO';
            
            const nuevo_doc=newTramiteInspector.documento_nc

        const id_nc = newNC.id;


        const total_documentos = newTramiteInspector.documento_acta;

        let nuevoModulo = 'ACTA DE FISCALIZACIÓN';


        await createDocumento(modelNC, id_nc, nuevo_doc);

        await updateDocumento({ id_nc, total_documentos, nuevoModulo });

        if (newMedidaComplementaria) {
            const total_documentos = newMedidaComplementaria.documento_medida_complementaria;
            await updateDocumento({ id_nc, total_documentos, nuevoModulo: nombre_MC });
        }


        if (newNC) {
            const findNC = await getNCforDigitador(newNC.id)

            const plainNC = findNC.toJSON();

            io.emit("sendDigitador", { data: [plainNC] });

            res.status(201).json({
                data: [findNC]
            });
        } else {
            res.status(400).json({
                message: 'Error al crear el NC',
            });
        }
    } catch (error) {
        console.error('Error al crear el NC:', error);
        return res.status(500).json({ message: 'Error interno del servidor al crear el trámite' });
    }
}


const allTramiteHandler = async (req, res) => {
    const id = req.params.id;

    const { page = 1, limit = 20 } = req.query;
    const errores = [];

    if (isNaN(page)) errores.push("El page debe ser un número");
    if (page <= 0) errores.push("El page debe ser mayor a 0");
    if (isNaN(limit)) errores.push("El limit debe ser un número");
    if (limit <= 0) errores.push("El limit debe ser mayor a 0");

    if (errores.length > 0) {
        return res.status(400).json({ errores });
    }

    try {
        const response = await getAllTramiteInspectorById(id, Number(page), Number(limit));

        if (response.data.length === 0) {
            return res.status(200).json({
                message: 'Ya no hay más tramites',
                data: {
                    data: [],
                    totalPage: response.currentPage,
                    totalCount: response.totalCount
                }
            });
        }

        return res.status(200).json({
            message: "Tramites obtenidos correctamente",
            data: response,
        });
    } catch (error) {
        console.error("Error al obtener tipos de documentos de identidad:", error);
        res.status(500).json({ error: "Error interno del servidor al obtener los tramites." });
    }
};


const getAllTipoMC = async (req, res) => {
    try {
        const response = await getAllTipoMCController();

        if (response.data === 0) {
            return res.status(200).json({
                message: 'No hay MC',
                data: []
            });
        }

        return res.status(200).json({
            message: "MC obtenidas correctamente",
            data: response,
        });
    } catch (error) {
        console.error("Error al obtener las actas:", error);
        res.status(500).json({ error: "Error interno del servidor al obtener las actas." });
    }
}

module.exports = { createTramiteHandler, allTramiteHandler, getMyActasHandler, getAllTipoMC };
