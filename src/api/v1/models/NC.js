const { DataTypes } = require("sequelize");
module.exports=(sequelize)=>{
    const NC=sequelize.define('NC',{
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
        id_tramiteInspector:{
            type: DataTypes.UUID,
            references: {
                model: 'TramiteInspectores',
                key: 'id',
            },
            allowNull: true
        },

        ordenanza_municipal: {
            type:DataTypes.STRING,
            allowNull:true
        },

        id_tipoDocumento:{
            type: DataTypes.INTEGER,
            references: {
                model: 'TipoDocumentoIdentidades',
                key: 'id',
            },
            allowNull:true
        },
        nro_documento:{
            type:DataTypes.BIGINT,
            allowNull:true
        },

        nro_licencia_funcionamiento:{
            type:DataTypes.STRING,
            allowNull:true
        },

        id_entidad:{
            type: DataTypes.UUID,
            references: {
                model: 'Entidades',
                key: 'id',
            },
            allowNull:true
        },

        id_infraccion:{
            type: DataTypes.INTEGER,
            references: {
                model: 'Infracciones',
                key: 'id',
            },
            allowNull:true
        },

        tipo_infraccion:{
            type:DataTypes.STRING,
            allowNull:true
        },

        lugar_infraccion:{
            type:DataTypes.STRING,
            allowNull:true
        },

        placa_rodaje:{
            type:DataTypes.STRING,
            allowNull:true
        },

        fecha_constancia_notificacion: {
            type:DataTypes.DATEONLY,
            allowNull:true
        },

        codigo_nc: {
            type:DataTypes.STRING,
            allowNull:true
        },

        observaciones:{
            type:DataTypes.STRING,
            allowNull: true
        },

        nombres_infractor:{
            type:DataTypes.STRING,
            allowNull:true
        },

        dni_infractor:{
            type:DataTypes.INTEGER,
            allowNull:true
        },

        relacion_infractor:{
            type:DataTypes.STRING,
            allowNull:true
        },

        id_digitador:{
            type: DataTypes.UUID,
            references: {
                model: 'Usuarios',
                key: 'id',
            },
            allowNull:true
        },

        id_descargo_NC:{
            type: DataTypes.UUID,
            references: {
                model: 'DescargoNCs',
                key: 'id',
            },
            allowNull:true
        },

        id_nro_IFI:{
            type: DataTypes.UUID,
            references: {
                model: 'IFIs',
                key: 'id',
            },
            allowNull:true
        },

        estado: {
            type: DataTypes.ENUM('DIGITADOR', 'ANALISTA_1', 'A_I', 'TERMINADO'),
            allowNull: true
        },
        
    }, {
        tableName: 'NCs',
        timestamps: true
    });


    NC.associate = (db) => {

        NC.belongsTo(db.TramiteInspector, { foreignKey: 'id_tramiteInspector', as: 'tramiteInspector'})
        
        NC.belongsTo(db.TipoDocumentoIdentidad, { foreignKey: 'id_tipoDocumento', as: 'DocIdentidad'})
        NC.belongsTo(db.Entidad, { foreignKey: 'id_entidad', as: 'entidad'})
        NC.belongsTo(db.Infraccion, { foreignKey: 'id_infraccion', as: 'infraccion'})
        // NC.belongsTo(db.MedidaComplementaria, { foreignKey: 'id_medida_complementaria', as: 'medidaComplementaria'})
        // NC.belongsTo(db.EstadoNC, { foreignKey: 'id_estado_NC', as: 'estadoNC'})
        NC.belongsTo(db.IFI, { foreignKey: 'id_nro_IFI', as: 'IFI'})
        NC.belongsTo(db.DescargoNC, { foreignKey: 'id_descargo_NC', as: 'descargoNC'})
        NC.belongsTo(db.Usuario, { foreignKey: 'id_digitador', as: 'digitadorUsuario' })
    }

    return NC;
}