import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
    const [students, setStudents] = useState([]);
    const [newStudent, setNewStudent] = useState({ name: '', age: '', address: '', email: '' });
    const [error, setError] = useState(null); // State to hold error messages
    const [loading, setLoading] = useState(false); // State for loading indicator

    // Fetch student list from API
    useEffect(() => {
        const fetchStudents = async () => {
            setLoading(true);
            try {
                const response = await axios.get('http://localhost:5000/students');
                setStudents(response.data);
            } catch (err) {
                setError('Không thể lấy danh sách sinh viên.');
                console.error('Lỗi khi lấy danh sách sinh viên:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    // Add a new student
    const addStudent = async () => {
        if (!newStudent.name || !newStudent.age || !newStudent.address || !newStudent.email) {
            setError('Vui lòng điền đầy đủ thông tin.');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/students', newStudent);
            setStudents([...students, { ...newStudent, id: response.data.id }]); // Assuming API returns the new student's id
            setNewStudent({ name: '', age: '', address: '', email: '' }); // Reset form
            setError(null); // Clear any previous errors
        } catch (err) {
            setError('Không thể thêm sinh viên.');
            console.error('Lỗi khi thêm sinh viên:', err);
        } finally {
            setLoading(false);
        }
    };

    // Delete a student
    const deleteStudent = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`http://localhost:5000/students/${id}`);
            setStudents(students.filter(student => student.id !== id));
        } catch (err) {
            setError('Không thể xóa sinh viên.');
            console.error('Lỗi khi xóa sinh viên:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Quản Lý Sinh Viên</h2>
            {loading && <div>Đang tải dữ liệu...</div>}
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <ul>
                {students.map(student => (
                    <li key={student.id}>
                        {student.name} - {student.age} - {student.address} - {student.email}
                        <button onClick={() => deleteStudent(student.id)}>Xóa</button>
                    </li>
                ))}
            </ul>
            <h3>Thêm Sinh Viên</h3>
            <input
                placeholder="Tên"
                value={newStudent.name}
                onChange={e => setNewStudent({ ...newStudent, name: e.target.value })}
            />
            <input
                placeholder="Tuổi"
                value={newStudent.age}
                onChange={e => setNewStudent({ ...newStudent, age: e.target.value })}
            />
            <input
                placeholder="Địa chỉ"
                value={newStudent.address}
                onChange={e => setNewStudent({ ...newStudent, address: e.target.value })}
            />
            <input
                placeholder="Email"
                value={newStudent.email}
                onChange={e => setNewStudent({ ...newStudent, email: e.target.value })}
            />
            <button onClick={addStudent}>Thêm</button>
        </div>
    );
}

export default App;
