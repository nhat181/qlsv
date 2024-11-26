const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2'); // Change to mysql2

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Kết nối đến MySQL
let db;

// Function to handle database connection
const connectToDatabase = () => {
    db = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'nhat1812006', // Thay bằng mật khẩu MySQL của bạn
        database: 'student_management',
    });

    db.connect(err => {
        if (err) {
            console.error('Kết nối thất bại:', err);
            setTimeout(connectToDatabase, 2000); // Retry connection after 2 seconds
        } else {
            console.log('Đã kết nối đến MySQL');
        }
    });

    db.on('error', (err) => {
        console.error('Database error:', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            connectToDatabase(); // Reconnect on connection lost
        }
    });
};

// Start the connection
connectToDatabase();

// API: Lấy danh sách sinh viên
app.get('/students', (req, res) => {
    db.query('SELECT * FROM students', (err, results) => {
        if (err) {
            console.error('Lỗi truy vấn:', err);
            return res.status(500).json({ error: 'Lỗi khi lấy danh sách sinh viên' });
        }
        res.json(results);
    });
});

// API: Thêm sinh viên mới
app.post('/students', (req, res) => {
    const { name, age, address, email } = req.body;

    // Input validation
    if (!name || !age || !address || !email) {
        return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin.' });
    }

    // Optional: Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        return res.status(400).json({ error: 'Email không hợp lệ.' });
    }

    db.query(
        'INSERT INTO students (name, age, address, email) VALUES (?, ?, ?, ?)',
        [name, age, address, email],
        (err, result) => {
            if (err) {
                console.error('Lỗi khi thêm sinh viên:', err);
                return res.status(500).json({ error: 'Lỗi khi thêm sinh viên' });
            }
            // Return the newly created student with ID
            res.status(201).json({ id: result.insertId, name, age, address, email });
        }
    );
});

// API: Cập nhật thông tin sinh viên
app.put('/students/:id', (req, res) => {
    const { id } = req.params;
    const { name, age, address, email } = req.body;

    db.query(
        'UPDATE students SET name = ?, age = ?, address = ?, email = ? WHERE id = ?',
        [name, age, address, email, id],
        (err, result) => {
            if (err) {
                console.error('Lỗi khi cập nhật thông tin sinh viên:', err);
                return res.status(500).json({ error: 'Lỗi khi cập nhật thông tin sinh viên' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Sinh viên không tồn tại' });
            }
            res.json({ message: 'Thông tin sinh viên đã được cập nhật' });
        }
    );
});

// API: Xóa sinh viên
app.delete('/students/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM students WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error('Lỗi khi xóa sinh viên:', err);
            return res.status(500).json({ error: 'Lỗi khi xóa sinh viên' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Sinh viên không tồn tại' });
        }
        res.json({ message: 'Sinh viên đã được xóa' });
    });
});

// Khởi động server
app.listen(5000, () => {
    console.log('Server đang chạy trên cổng 5000');
});
