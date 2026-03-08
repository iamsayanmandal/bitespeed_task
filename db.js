const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'contacts.db'));

db.exec(`
CREATE TABLE IF NOT EXISTS contacts (
id INTEGER PRIMARY KEY AUTOINCREMENT,
phoneNumber TEXT,
email TEXT,
linkedId INTEGER,
linkPrecedence TEXT DEFAULT 'primary',
createdAt TEXT,
updatedAt TEXT,
deletedAt TEXT
)
`);

module.exports = db;
