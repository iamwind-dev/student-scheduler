import { useState, useEffect } from 'react';
import './Courses.css';

function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [semester, setSemester] = useState('2025A');

  useEffect(() => {
    fetchCourses();
  }, [semester]);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/courses?semester=${semester}`);
      
      if (!response.ok) {
        throw new Error('Không thể tải danh sách môn học');
      }
      
      const data = await response.json();
      setCourses(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="courses-container">
      <div className="courses-header">
        <h1>📚 Danh sách môn học</h1>
        <div className="semester-selector">
          <label>Học kỳ: </label>
          <select 
            value={semester} 
            onChange={(e) => setSemester(e.target.value)}
            className="semester-select"
          >
            <option value="2025A">2025A</option>
            <option value="2025B">2025B</option>
            <option value="2025C">2025C</option>
          </select>
        </div>
      </div>

      {loading && <div className="loading">Đang tải dữ liệu...</div>}
      
      {error && (
        <div className="error-message">
          ❌ {error}
          <button onClick={fetchCourses} className="retry-button">Thử lại</button>
        </div>
      )}

      {!loading && !error && (
        <div className="courses-grid">
          {courses.length === 0 ? (
            <p className="no-courses">Không có môn học nào trong học kỳ này</p>
          ) : (
            courses.map((course) => (
              <div key={course.id} className="course-card">
                <div className="course-header">
                  <span className="course-code">{course.code}</span>
                  <span className="course-credits">{course.credits} TC</span>
                </div>
                <h3 className="course-name">{course.name}</h3>
                <div className="course-info">
                  <p><strong>Học kỳ:</strong> {course.semester}</p>
                  <p><strong>Giảng viên:</strong> {course.lecturer}</p>
                </div>
                <div className="course-slots">
                  <strong>Các lớp học:</strong>
                  {course.slots.map((slot, index) => (
                    <div key={index} className="slot-item">
                      <span className="slot-day">{slot.day}</span>
                      <span className="slot-time">{slot.time}</span>
                      <span className="slot-room">{slot.room}</span>
                      <span className="slot-campus">{slot.campus}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Courses;
