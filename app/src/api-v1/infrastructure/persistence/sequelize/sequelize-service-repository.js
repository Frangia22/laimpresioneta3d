'use strict';

const db = require('../../../../../models');

function toDto(row) {
  if (!row) return null;
  const s = row.toJSON ? row.toJSON() : row;
  return {
    id: s.id,
    name: s.name,
    iconService: s.iconService,
    details: s.details,
  };
}

class SequelizeServiceRepository {
  async findAll() {
    const rows = await db.services.findAll({ order: [['id', 'DESC']] });
    return rows.map(toDto);
  }

  async findById(id) {
    const row = await db.services.findByPk(id);
    return toDto(row);
  }

  async create(data) {
    const row = await db.services.create({
      name: data.name,
      iconService: data.iconService,
      details: data.details,
    });
    return toDto(row);
  }

  async update(id, data) {
    const [affected] = await db.services.update(
      {
        name: data.name,
        iconService: data.iconService,
        details: data.details,
      },
      { where: { id } }
    );
    return affected;
  }

  async delete(id) {
    return db.services.destroy({ where: { id } });
  }
}

module.exports = { SequelizeServiceRepository };
