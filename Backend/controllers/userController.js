const db = require('../dbConnection');

// Get a user by ID
exports.getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query('SELECT * FROM users WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error('Error in getUserById:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
// Create a new user
exports.createUser = async (req, res) => {
  let { id, name, email, password, role } = req.body;

  if (role === 'Examinee') {
    password = id;
  }

  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query('INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)', [id, name, email, password, role]);
    res.json({ id, name, email, role });
  } catch (err) {
    console.error('Error in createUser:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update a user
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, password, role } = req.body;

  try {
    const connection = await db.getConnection();
    await connection.query('UPDATE users SET name = ?, email = ?, password = ?, role = ? WHERE id = ?', [name, email, password, role, id]);
    res.json({ id, name, email, role });
  } catch (err) {
    console.error('Error in updateUser:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await db.getConnection();
    await connection.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: `User with id ${id} deleted` });
  } catch (err) {
    console.error('Error in deleteUser:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
