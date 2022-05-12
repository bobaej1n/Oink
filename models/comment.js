const Sequelize = require("sequelize");

module.exports = class Comment extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        content: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: "Comment",
        tableName: "comments",
        paranoid: false,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  static associate(db) {
    // post:comment = 1:N
    db.Comment.belongsTo(db.Post, { foreignKey: "postId", targetKey: "id", onDelete: "cascade" });
    db.Comment.belongsTo(db.User, { foreignKey: "userId", targetKey: "id", onDelete: "cascade" });
  }
};
