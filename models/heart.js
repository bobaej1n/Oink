const Sequelize = require("sequelize");

module.exports = class Heart extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
          // auto인 id, 외래키들 말고 필드 X
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: "Heart",
        tableName: "hearts",
        paranoid: false,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  static associate(db) {
    db.Heart.belongsTo(db.Post, {
      foreignKey: "postId",
      targetKey: "id",
      onDelete: "cascade",
    });
    db.Heart.belongsTo(db.User, {
      foreignKey: "userId",
      targetKey: "id",
      onDelete: "cascade",
    });
  }
};
