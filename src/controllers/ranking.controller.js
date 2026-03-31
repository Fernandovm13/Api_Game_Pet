const db = require('../config/db');

class RankingController {
  async getGlobal(req, res) {
    try {
      const [rows] = await db.execute(
        'SELECT displayName, level, experience FROM users ORDER BY level DESC, experience DESC LIMIT 10'
      );
      res.status(200).json({ ranking: rows });
    } catch (error) {
      console.error('Error al obtener ranking:', error);
      res.status(500).json({ message: 'Error interno al cargar el ranking.' });
    }
  }
}

module.exports = new RankingController();
