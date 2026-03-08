const express = require('express');
const db = require('./db');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ msg: "bitespeed identity reconciliation service" });
});

app.post('/identify', (req, res) => {
    let email = req.body.email || null;
    let phoneNumber = req.body.phoneNumber ? String(req.body.phoneNumber) : null;

    if (!email && !phoneNumber) {
        return res.status(400).json({ error: "need atleast email or phoneNumber" });
    }

    let query;
    let params;
    if (email && phoneNumber) {
        query = `SELECT * FROM contacts WHERE (email = ? OR phoneNumber = ?) AND deletedAt IS NULL`;
        params = [email, phoneNumber];
    } else if (email) {
        query = `SELECT * FROM contacts WHERE email = ? AND deletedAt IS NULL`;
        params = [email];
    } else {
        query = `SELECT * FROM contacts WHERE phoneNumber = ? AND deletedAt IS NULL`;
        params = [phoneNumber];
    }

    let matchedContacts = db.prepare(query).all(...params);

    if (matchedContacts.length === 0) {
        let now = new Date().toISOString();
        let result = db.prepare(
            `INSERT INTO contacts (phoneNumber, email, linkedId, linkPrecedence, createdAt, updatedAt) VALUES (?,?,?,?,?,?)`
        ).run(phoneNumber, email, null, 'primary', now, now);

        return res.json({
            contact: {
                primaryContatctId: Number(result.lastInsertRowid),
                emails: email ? [email] : [],
                phoneNumbers: phoneNumber ? [phoneNumber] : [],
                secondaryContactIds: []
            }
        });
    }

    let primaryIds = new Set();
    for (let c of matchedContacts) {
        if (c.linkPrecedence === 'primary') {
            primaryIds.add(c.id);
        } else {
            primaryIds.add(c.linkedId);
        }
    }

    let primaries = [];
    for (let pid of primaryIds) {
        let p = db.prepare('SELECT * FROM contacts WHERE id = ?').get(pid);
        if (p) primaries.push(p);
    }
    primaries.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    let mainPrimary = primaries[0];

    if (primaries.length > 1) {
        let now = new Date().toISOString();
        for (let i = 1; i < primaries.length; i++) {
            db.prepare(`UPDATE contacts SET linkPrecedence = 'secondary', linkedId = ?, updatedAt = ? WHERE id = ?`)
                .run(mainPrimary.id, now, primaries[i].id);

            db.prepare(`UPDATE contacts SET linkedId = ?, updatedAt = ? WHERE linkedId = ?`)
                .run(mainPrimary.id, now, primaries[i].id);
        }
    }

    let allContacts = db.prepare(
        `SELECT * FROM contacts WHERE (id = ? OR linkedId = ?) AND deletedAt IS NULL ORDER BY createdAt ASC`
    ).all(mainPrimary.id, mainPrimary.id);

    let allEmails = allContacts.map(c => c.email).filter(Boolean);
    let allPhones = allContacts.map(c => c.phoneNumber).filter(Boolean);

    let newInfo = false;
    if (email && !allEmails.includes(email)) newInfo = true;
    if (phoneNumber && !allPhones.includes(phoneNumber)) newInfo = true;

    if (newInfo) {
        let now = new Date().toISOString();
        db.prepare(
            `INSERT INTO contacts (phoneNumber, email, linkedId, linkPrecedence, createdAt, updatedAt) VALUES (?,?,?,?,?,?)`
        ).run(phoneNumber, email, mainPrimary.id, 'secondary', now, now);

        allContacts = db.prepare(
            `SELECT * FROM contacts WHERE (id = ? OR linkedId = ?) AND deletedAt IS NULL ORDER BY createdAt ASC`
        ).all(mainPrimary.id, mainPrimary.id);
    }

    let emails = [];
    let phoneNumbers = [];
    let secondaryIds = [];

    if (mainPrimary.email) emails.push(mainPrimary.email);
    if (mainPrimary.phoneNumber) phoneNumbers.push(mainPrimary.phoneNumber);

    for (let c of allContacts) {
        if (c.id !== mainPrimary.id) {
            secondaryIds.push(c.id);
        }
        if (c.email && !emails.includes(c.email)) emails.push(c.email);
        if (c.phoneNumber && !phoneNumbers.includes(c.phoneNumber)) phoneNumbers.push(c.phoneNumber);
    }

    res.json({
        contact: {
            primaryContatctId: mainPrimary.id,
            emails: emails,
            phoneNumbers: phoneNumbers,
            secondaryContactIds: secondaryIds
        }
    });
});

let PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});
