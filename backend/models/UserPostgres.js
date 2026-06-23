const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../db/pg');

class User {
  static async findByEmail(email) {
    try {
      const result = await query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      return result.rows[0] || null;
    } catch (err) {
      throw err;
    }
  }

  static async findById(id) {
    try {
      const result = await query(
        'SELECT * FROM users WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } catch (err) {
      throw err;
    }
  }

  static async findOne(conditions) {
    try {
      const keys = Object.keys(conditions);
      const values = Object.values(conditions);
      const whereClause = keys.map((key, i) => `${key} = $${i + 1}`).join(' AND ');
      
      const result = await query(
        `SELECT * FROM users WHERE ${whereClause}`,
        values
      );
      return result.rows[0] || null;
    } catch (err) {
      throw err;
    }
  }

  static async create(userData) {
    try {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      const result = await query(
        `INSERT INTO users (username, email, password, first_name, last_name, role, department, phone, is_active, permissions)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          userData.email, // username
          userData.email,
          hashedPassword,
          userData.firstName,
          userData.lastName,
          userData.role || 'user',
          userData.department || '',
          userData.phone || '',
          userData.isActive !== false,
          JSON.stringify(userData.permissions || [])
        ]
      );
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  }

  static async update(id, updateData) {
    try {
      const updates = [];
      const values = [];
      let paramCount = 1;

      for (const [key, value] of Object.entries(updateData)) {
        const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        updates.push(`${dbKey} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }

      values.push(id);
      const updateClause = updates.join(', ');

      const result = await query(
        `UPDATE users SET ${updateClause}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`,
        values
      );
      return result.rows[0] || null;
    } catch (err) {
      throw err;
    }
  }
}

// Method to verify password
async function matchPassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

// Method to generate JWT
function getSignedJwtToken(userId) {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: process.env.JWT_EXPIRE || '24h' }
  );
}

module.exports = User;
module.exports.matchPassword = matchPassword;
module.exports.getSignedJwtToken = getSignedJwtToken;
