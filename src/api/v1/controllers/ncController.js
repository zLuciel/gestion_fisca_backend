const { NC, TramiteInspector, MedidaComplementaria, TipoDocumentoComplementario, EjecucionMC, EstadoMC, DescargoNC, Usuario } = require('../../../config/db_connection');
const { Sequelize } = require('sequelize');
const myCache = require("../../../middlewares/cacheNodeStocked");

const createNC = async ({ id_tramiteInspector }) => {
    try {
        const newNC = await NC.create({
            id_tramiteInspector,
            estado: 'DIGITADOR'
        });

        return newNC || null;

    } catch (error) {
        console.error('Error creando NC en el controlador:', error);
        return false;
    }
};

const getNC = async (id) => {
    try {
        const findNC = await NC.findOne({ 
            where: { id } 
        });

        return findNC || null;
    } catch (error) {
        console.error({ message: "Error al encontrar el NC", data: error });
        return false;
    }
}

const updateNC = async (id, data) => {
    try {
        const findNC = await getNC(id);

        if (findNC) {
            await findNC.update(data);
        }
        
        return findNC || null;    
    } catch (error) {
        console.error("Error actualizando NC en el controlador:", error);
        return false;
    }
};

const getAllNC = async () => {
    try {
        const response = await NC.findAll({
            where: { estado: 'DIGITADOR' }, 
            order: [['createdAt', 'ASC']],
            attributes: [
                'id',
                [Sequelize.col('tramiteInspector.nro_nc'), 'nro_nc'],
                [Sequelize.col('tramiteInspector.inspectorUsuario.usuario'), 'inspector'],
                [Sequelize.col('tramiteInspector.documento_nc'), 'documento_nc'],
                [Sequelize.col('tramiteInspector.createdAt'), 'createdAt'],
                [Sequelize.col('estado'), 'estado'],
            ],
            include: [
                {
                    model: TramiteInspector,
                    as: 'tramiteInspector',
                    include: [
                        {
                            model: Usuario, 
                            as: 'inspectorUsuario',
                            attributes: []
                        },
                    ],
                    attributes: []
                }
            ],
        });

        const modifiedResponse = response.map(item => {
            const id = item.id; // Asumiendo que 'id' es la clave para buscar en el cache
            const cachedValue = myCache.get(`Digitador-${id}`); // Obtener valor del cache si existe
        
            return {
                ...item.toJSON(),
                disabled: cachedValue ? cachedValue.disabled : false, // Si existe en cache usa el valor, si no, default false
            };
        });

        return  modifiedResponse  || null;
    } catch (error) {
        console.error({ message: "Error obteniendo todos los NC en el controlador", data: error });
        return false;
    }
};

const getNCforDigitador = async (id) => {
    try {
        const findNC = await NC.findOne({ 
            where: { id },
            attributes: [
                'id',
                [Sequelize.col('tramiteInspector.nro_nc'), 'nro_nc'],
                [Sequelize.col('tramiteInspector.inspectorUsuario.usuario'), 'inspector'],
                [Sequelize.col('tramiteInspector.documento_nc'), 'documento_nc'],
                [Sequelize.col('tramiteInspector.createdAt'), 'createdAt'],
                [Sequelize.col('estado'), 'estado'],
            ],
            include: [
                {
                    model: TramiteInspector,
                    as: 'tramiteInspector',
                    include: [
                        {
                            model: Usuario, 
                            as: 'inspectorUsuario',
                            attributes: []
                        },
                    ],
                    attributes: []
                }
            ],
        });
        
        return findNC || null;
    } catch (error) {
        console.error({ message: "Error obteniendo todos los NC para el digitador en el controlador", data: error });
        return false;
    }
}

const getNCforAnalista = async (id) => {
    try {
        const findNC = await NC.findOne({ 
            where: { id } ,
            attributes: [
                'id',
                [Sequelize.col('tramiteInspector.nro_nc'), 'nro_nc'],
                [Sequelize.col('digitadorUsuario.usuario'), 'digitador'],
                [Sequelize.col('tramiteInspector.createdAt'), 'createdAt'],
                [Sequelize.col('estado'), 'estado'],
                
            ],
            include: [
                {
                    model: TramiteInspector,
                    as: 'tramiteInspector',
                    include: [
                        {
                            model: Usuario, 
                            as: 'inspectorUsuario',
                            attributes: []
                        },
                    ],
                    attributes: []
                },
                {
                    model: Usuario, 
                    as: 'digitadorUsuario',
                    attributes: []
                },
            ],
        });
        
        return findNC || null;
    } catch (error) {
        console.error({ message: "Error al encontrar el NC", data: error });
        return false;
    }
}

const getNCforInstructiva = async (id) => {
    try {
        const response = await NC.findOne({ 
            where: { id: id }, 
            order: [['id', 'ASC']],
            attributes: [
                'id',
                [Sequelize.col('tramiteInspector.nro_nc'), 'nro_nc'],
                [Sequelize.col('estado'), 'estado'],
                [Sequelize.col('descargoNC.analistaUsuario.usuario'), 'analista']
            ],
            include: [
                {
                    model: DescargoNC, 
                    as: 'descargoNC',
                    include: [
                        {
                            model: Usuario,
                            as: 'analistaUsuario',
                            attributes: []
                        }
                    ] ,
                    attributes: []
                },
                {
                    model: TramiteInspector, 
                    as: 'tramiteInspector', 
                    attributes: [], 
                },
            ],
        });
        return response || null;
    } catch (error) {
        console.error({ message: "Error obteniendo todos los NC para el Area Instructiva en el controlador", data: error });
        return false;
    }
};

const getAllNCforInstructiva = async () => {
    try {
        const response = await NC.findAll({ 
            where: { estado: 'A_I' }, 
            order: [['updatedAt', 'ASC']],
            attributes: [
                'id',
                [Sequelize.col('tramiteInspector.nro_nc'), 'nro_nc'],
                [Sequelize.col('estado'), 'estado'],
                [Sequelize.col('descargoNC.analistaUsuario.usuario'), 'analista']
            ],
            include: [
                {
                    model: DescargoNC, 
                    as: 'descargoNC',
                    include: [
                        {
                            model: Usuario,
                            as: 'analistaUsuario',
                            attributes: []
                        }
                    ] ,
                    attributes: []
                },
                {
                    model: TramiteInspector, 
                    as: 'tramiteInspector', 
                    attributes: [], 
                },
            ],
        });

        const modifiedResponse = response.map(item => {
            const id = item.id; // Asumiendo que 'id' es la clave para buscar en el cache
            const cachedValue = myCache.get(`AInstructiva-${id}`); // Obtener valor del cache si existe
        
            return {
                ...item.toJSON(),
                disabled: cachedValue ? cachedValue.disabled : false, // Si existe en cache usa el valor, si no, default false
            };
        });

        return modifiedResponse || null;
    } catch (error) {
        console.error({ message: "Error en el controlador al traer todos los Tipos de NC", data: error });
        return false;
    }
};

const getAllNCforAnalista = async () => {
    try {
        const response = await NC.findAll({ 
            where: { estado: 'ANALISTA_1' }, 
            // order: [['id', 'ASC']],
            attributes: [
                'id',
                [Sequelize.col('tramiteInspector.nro_nc'), 'nro_nc'],
                [Sequelize.col('digitadorUsuario.usuario'), 'digitador'],
                [Sequelize.col('tramiteInspector.createdAt'), 'createdAt'],
                [Sequelize.col('estado'), 'estado']
            ],
            include: [
                {
                    model: Usuario, 
                    as: 'digitadorUsuario',
                    attributes: []
                },
                {
                    model: TramiteInspector, 
                    as: 'tramiteInspector', 
                    attributes: [], 
                },
            ],
        });

        const modifiedResponse = response.map(item => {
            const id = item.id; // Asumiendo que 'id' es la clave para buscar en el cache
            const cachedValue = myCache.get(`AnalistaOne-${id}`); // Obtener valor del cache si existe
        
            return {
                ...item.toJSON(),
                disabled: cachedValue ? cachedValue.disabled : false, // Si existe en cache usa el valor, si no, default false
            };
        });

        return modifiedResponse || null;
    } catch (error) {
        console.error({ message: "Error obteniendo todos los NC para el Analista 1 en el controlador", data: error });
        return false;
    }
};

module.exports = { createNC, getNCforInstructiva, updateNC, getAllNC , getNCforDigitador, getNCforAnalista, getAllNCforInstructiva, getNC, getAllNCforAnalista};