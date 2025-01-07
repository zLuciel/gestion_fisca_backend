const { RG, Usuario,  NC , TramiteInspector } = require('../../../config/db_connection'); 
const {saveImage,deleteFile}=require('../../../utils/fileUtils')
const { Sequelize } = require('sequelize');
const { RSG1, DescargoNC, DescargoRSG, IFI, DescargoIFI, RSG2, RSA, DescargoRSA, RSG } = require('../../../config/db_connection'); 
const myCache = require("../../../middlewares/cacheNodeStocked");


// Crear un registro RG   
const createRGController = async ({
     nro_rg,
     fecha_rg,
     fecha_notificacion,
     documento_rg,
     id_nc,
     id_gerente,
     tipo
    }) => {

    let documento_path_rg;

    try {
        documento_path_rg=saveImage(documento_rg,'Resolucion(RG)')            

        const newRG = await RG.create({ 
            nro_rg,
            fecha_rg,
            fecha_notificacion,
            documento_rg:documento_path_rg,
            id_nc,
            id_gerente,
            tipo
        });

        return newRG || null;
    } catch (error) {
        if (documento_path_rg) {
            deleteFile(documento_path_rg);
        }
        console.error("Error al crear RG:", error);
        return false
    }
};
const getAllRGforAnalista5Controller = async () => {
    try {
        const response = await RG.findAll({ 
            where: { tipo: 'ANALISTA_5' }, 
            order: [['id', 'ASC']],
            attributes: [
                'id',
                // 'id_gerente',
                [Sequelize.col('NCs.id'), 'id_nc'],
                [Sequelize.col('Usuarios.usuario'), 'usuario'],
                [Sequelize.literal(`'Gerencia'`), 'area'],
                'createdAt',
            ],
            include: [
                {
                    model: NC, 
                    as: 'NCs',
                    include: [
                      {
                        model: TramiteInspector, 
                        as: 'tramiteInspector', 
                        attributes: [], 
                      }
                    ],
                    attributes: []
                },
                {
                  model: Usuario, 
                  as: 'Usuarios',
                  attributes: []
              },
            ]
        });

        const modifiedResponse = response.map(item => {
            const id = item.id; // Asumiendo que 'id' es la clave para buscar en el cache
            const cachedValue = myCache.get(`AnalistaFive-Gerencia-${id}`); // Obtener valor del cache si existe
        
            return {
                ...item.toJSON(),
                disabled: cachedValue ? cachedValue.disabled : false, // Si existe en cache usa el valor, si no, default false
            };
          });

          
        return modifiedResponse || null;
    } catch (error) {
        console.error({ message: "Error en el controlador al traer todos los RSGNP para AN5", data: error });
        return false;
    }
  };


// Actualizar un registro RG
const updateRGController = async (id,{ tipo,id_evaluar_rg,id_estado_RG}) => {
   
    try {
        const rg = await getRGController(id);

        await rg.update({tipo,id_evaluar_rg,id_estado_RG});

        return rg || null;

    } catch (error) {
        console.error("Error al actualizar RG:", error);
        return false
    }
};

// Obtener un registro RG por ID
const getRGController = async (id) => {
    try {
        const rg = await RG.findByPk(id);
        return rg || null;
    } catch (error) {
        console.error("Error al obtener RG:", error);
        return false
    }
};






const getRGforAnalista5Controller = async (id) => {
    try {
        const response = await RG.findOne({ 
            where: { id: id }, 
            order: [['id', 'ASC']],
            attributes: [
                'id',
                // 'id_gerente',
                [Sequelize.col('NCs.id'), 'id_nc'],
                [Sequelize.col('Usuarios.usuario'), 'usuario'],
                [Sequelize.literal(`'Gerencia'`), 'area'],
                'createdAt',
            ],
            include: [
                {
                    model: NC, 
                    as: 'NCs',
                    include: [
                      {
                        model: TramiteInspector, 
                        as: 'tramiteInspector', 
                        attributes: [], 
                      }
                    ],
                    attributes: []
                },
                {
                  model: Usuario, 
                  as: 'Usuarios',
                  attributes: []
              },
            ]
        });
        return response || null;
    } catch (error) {
        console.error({ message: "Error en el controlador al traer todos los RSGNP para AN5", data: error });
        return false;
    }
  };


















// Obtener todos los registros RG
const getAllRGController = async () => {
    try {
        const rgs = await RG.findAll();
        return rgs;
    } catch (error) {
        console.error("Error al obtener RGs:", error);
        return false
    }
};


const getAllRGforGerenciaController = async () => {
    try {
        const response = await NC.findAll({ 
            where: Sequelize.where(Sequelize.col('IFI.RSA.RSGs.RGs.tipo'), 'FUNDADO_RG'),
            order: [['id', 'ASC']],
            attributes: [
                'id',
                [Sequelize.col('tramiteInspector.nro_nc'), 'nro_nc'],
                [Sequelize.col('tramiteInspector.inspectorUsuario.usuario'), 'usuarioInspector'],
                [Sequelize.literal(`'NOTIFICACION DE CARGO'`), 'nombre_nc'],
                [Sequelize.col('tramiteInspector.documento_nc'), 'documento_nc'],
                [Sequelize.literal(`'ACTA DE FISCALIZACION'`), 'nombre_acta'],
                [Sequelize.col('tramiteInspector.documento_acta'), 'documento_acta'],
                [Sequelize.col('tramiteInspector.createdAt'), 'inspector_createdAt'],

                [Sequelize.col('digitadorUsuario.usuario'), 'usuarioDigitador'],

                [Sequelize.col('descargoNC.analistaUsuario.usuario'), 'usuarioAnalista1'],
                [Sequelize.literal(`'DESCARGO NC'`), 'nombre_descargoNC'],
                [Sequelize.col('descargoNC.documento'), 'documento_descargoNC'],
                [Sequelize.col('descargoNC.createdAt'), 'analista_createdAt'],

                [Sequelize.col('IFI.Usuarios.usuario'), 'usuarioAreaInstructiva1'],
                [Sequelize.literal(`'INFORME FINAL'`), 'nombre_AI'],
                [Sequelize.col('IFI.documento_ifi'), 'documento_AI'],
                [Sequelize.col('IFI.createdAt'), 'AI_createdAt'],

                [Sequelize.col('IFI.DescargoIFIs.analista2Usuario.usuario'), 'usuarioAnalista2'],
                [Sequelize.literal(`'DESCARGO IFI'`), 'nombre_DIFI'],
                [Sequelize.col('IFI.DescargoIFIs.documento_DIFI'), 'documento_DIFI'],
                [Sequelize.col('IFI.DescargoIFIs.createdAt'), 'analista2_createdAt'],

                [Sequelize.col('IFI.RSA.Usuarios.usuario'), 'usuarioAreaInstructiva2'],
                [Sequelize.literal(`'RESOLUCION SANCIONADORA ADMINISTRATIVA'`), 'nombre_RSA'],
                [Sequelize.col('IFI.RSA.documento_RSA'), 'documento_RSA'],
                [Sequelize.col('IFI.RSA.createdAt'), 'RSA_createdAt'],

                [Sequelize.col('IFI.RSA.DescargoRSAs.Usuarios.usuario'), 'usuarioAnalista3'],
                [Sequelize.literal(`'DESCARGO RSA'`), 'nombre_DRSA'],
                [Sequelize.col('IFI.RSA.DescargoRSAs.documento_DRSA'), 'documento_DRSA'],
                [Sequelize.col('IFI.RSA.DescargoRSAs.createdAt'), 'DRSA_createdAt'],

                [Sequelize.col('IFI.RSA.RSGs.Usuarios.usuario'), 'usuarioAreaInstructiva3'],
                [Sequelize.literal(`'RESOLUCION SUBGERENCIAL GENERAL 3'`), 'nombre_RSG3'],
                [Sequelize.col('IFI.RSA.RSGs.documento_RSG'), 'documento_RSG'],
                [Sequelize.col('IFI.RSA.RSGs.createdAt'), 'RSG3_createdAt'],

                [Sequelize.col('IFI.RSA.RSGs.DescargoRSGs.Usuarios.usuario'), 'usuarioAnalista4'],
                [Sequelize.literal(`'DESCARGO RSG'`), 'nombre_DRSG'],
                [Sequelize.col('IFI.RSA.RSGs.DescargoRSGs.documento_DRSG'), 'documento_DRSG'],
                [Sequelize.col('IFI.RSA.RSGs.DescargoRSGs.createdAt'), 'DRSG_createdAt'],

                [Sequelize.col('IFI.RSA.RSGs.RGs.Usuarios.usuario'), 'usuarioGerencia'],
                [Sequelize.literal(`'RESOLUCION GENERAL PROCEDENTE'`), 'nombre_RG'],
                [Sequelize.col('IFI.RSA.RSGs.RGs.documento_rg'), 'documento_RG'],
                [Sequelize.col('IFI.RSA.RSGs.RGs.createdAt'), 'RG_createdAt'],

            ],
            include: [
                {
                    model: TramiteInspector, 
                    as: 'tramiteInspector', 
                    include: [
                        {
                            model: Usuario,
                            as: 'inspectorUsuario'
                        }
                    ],
                    attributes: [], 
                },
                {
                  model: Usuario, 
                  as: 'digitadorUsuario',
                  attributes: []
                },
                {
                    model: DescargoNC, 
                    as: 'descargoNC', 
                    include: [
                        {
                            model: Usuario,
                            as: 'analistaUsuario'
                        }
                    ],
                    attributes: [], 
                },
                {
                    model: IFI, 
                    as: 'IFI', 
                    include: [
                        {
                            model: Usuario,
                            as: 'Usuarios',
                        },
                        {
                            model: DescargoIFI,
                            as: 'DescargoIFIs',
                            include: [
                                {
                                    model: Usuario,
                                    as: 'analista2Usuario',
                                },
                            ]
                        },
                        {
                            model: RSA,
                            as: 'RSA',
                            include: [
                                {
                                    model: Usuario,
                                    as: 'Usuarios',
                                },
                                {
                                    model:  DescargoRSA,
                                    as: 'DescargoRSAs',
                                    include: [
                                        {
                                            model: Usuario,
                                            as: 'Usuarios',
                                        }
                                    ]
                                },
                                {
                                    model:  RSG,
                                    as: 'RSGs',
                                    include: [
                                        {
                                            model:  DescargoRSG,
                                            as: 'DescargoRSGs',
                                            include: [
                                                {
                                                    model: Usuario,
                                                    as: 'Usuarios',
                                                }
                                            ]
                                        },
                                        {
                                            model: Usuario,
                                            as: 'Usuarios',
                                        },
                                        {
                                            model: RG,
                                            as: 'RGs',
                                            include: [
                                                {
                                                    model: Usuario,
                                                    as: 'Usuarios',
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ],
                        },
                    ],
                    attributes: [], 
                },
            ]
        });

        const transformedData = response.map(row => ({
            nro_nc: row.get('nro_nc'),
            etapaInspector: {
                usuarioInspector: row.get('usuarioInspector'),
                documento_nc: {
                    nombre: row.get('nombre_nc'),
                    path: row.get('documento_nc'),
                },
                documento_acta: {
                    nombre: row.get('nombre_acta'),
                    path: row.get('documento_acta'),
                },
                inspector_createdAt: row.get('inspector_createdAt'),
            },
            etapaDigitador: {
                usuarioDigitador: row.get('usuarioDigitador'),
                digitador_createdAt: row.get('inspector_createdAt'),
            },
            estapaDescargoNC: {
                usuarioAnalista1: row.get('usuarioAnalista1'),
                documento_descargoNC: {
                    nombre: row.get('nombre_descargoNC'),
                    path: row.get('documento_descargoNC')
                },
                analista_createdAt: row.get('analista_createdAt'),
            },
            etapaAreaInstructiva: {
                usuarioAreaInstructiva1: row.get('usuarioAreaInstructiva1'),
                documento_AI: {
                    nombre: row.get('nombre_AI'),
                    path: row.get('documento_AI'),
                },
                AI_createdAt: row.get('AI_createdAt'),
            },
            etapaDescargoIFI: {
                usuarioAnalista2: row.get('usuarioAnalista2'),
                documento_descargoIFI: {
                    nombre: row.get('nombre_DIFI'),
                    path: row.get('documento_DIFI'),
                },
                analista2_createdAt: row.get('analista2_createdAt'),
            },
            etapaRSA: {
                usuarioAreaInstructiva2: row.get('usuarioAreaInstructiva2'),
                documento_RSA: {
                    nombre: row.get('nombre_RSA'),
                    path: row.get('documento_RSA'),
                },
                AR2_createdAt: row.get('RSA_createdAt'),
            },
            etapaDescargoRSA: {
                usuarioAnalista3: row.get('usuarioAnalista3'),
                documento_RSA: {
                    nombre: row.get('nombre_DRSA'),
                    path: row.get('documento_DRSA'),
                },
                analista3_createdAt: row.get('DRSA_createdAt'),
            },
            etapaRSG: {
                usuarioAreaInstructiva3: row.get('usuarioAreaInstructiva3'),
                documento_RSA: {
                    nombre: row.get('nombre_RSG3'),
                    path: row.get('documento_RSG'),
                },
                AR3_createdAt: row.get('RSG3_createdAt'),
            },
            etapaDescargoRSG: {
                usuarioAnalista4: row.get('usuarioAnalista4'),
                documento_RSG: {
                    nombre: row.get('nombre_DRSG'),
                    path: row.get('documento_DRSG'),
                },
                analista4_createdAt: row.get('DRSG_createdAt'),
            },
            etapaRG: {
                usuarioGerencia: row.get('usuarioGerencia'),
                documento_RSG: {
                    nombre: row.get('nombre_RG'),
                    path: row.get('documento_RG'),
                },
                analista4_createdAt: row.get('RG_createdAt'),
            }
        }));


        return transformedData || null;
    } catch (error) {
        console.error({ message: "Error en el controlador al traer todos los reportes de RSG1", data: error });
        return false;
    }
};


module.exports = {
    createRGController,
    updateRGController,
    getRGController,
    getAllRGController,
    getAllRGforGerenciaController,
    getAllRGforAnalista5Controller,
    getRGforAnalista5Controller
};
