const db = require('../dbSingleton');


exports.getUsers = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM users');
    res.json(rows);
  } catch (err) {
    console.error('❌ Error in getPracticeData:', err); // Add this line
    res.status(500).json({ error: 'Server error' });
  }
  
}

exports.getPracticeData = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM practice_data');
    res.json(rows);
  } catch (err) {
    console.error('❌ Error in getPracticeData:', err); // Add this line
    res.status(500).json({ error: 'Server error' });
  }
  
};

exports.getExamData = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM exam_data');
    res.json(rows);
  } catch (err) {
    console.error('❌ Error in getPracticeData:', err); // Add this line
    res.status(500).json({ error: 'Server error' });
  }
  
};
