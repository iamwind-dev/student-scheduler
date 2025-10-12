import { useState } from 'react';
import './Recommend.css';
import API_BASE from '../config';

function Recommend({ studentId }) {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'table'

  const handleRecommend = async () => {
    setLoading(true);
    setError(null);
    setSchedules([]);

    try {
      const response = await fetch(`${API_BASE}/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId })
      });

      if (!response.ok) {
        throw new Error('Không thể tạo gợi ý thời gian biểu');
      }

      const data = await response.json();
      setSchedules(data.recommendations || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderListView = () => (
    <div className="schedules-list">
      {schedules.map((schedule, idx) => (
        <div key={idx} className="schedule-card">
          <div className="schedule-header">
            <h3>Phương án {idx + 1}</h3>
            <div className="schedule-stats">
              <span className="stat">📚 {schedule.totalCredits} TC</span>
              <span className="stat">📝 {schedule.courses.length} môn</span>
            </div>
          </div>

          <div className="courses-list">
            {schedule.courses.map((course, courseIdx) => (
              <div key={courseIdx} className="course-item">
                <div className="course-main">
                  <span className="course-code">{course.courseCode}</span>
                  <span className="course-name">{course.courseName}</span>
                </div>
                <div className="course-details">
                  <span className="slot-info">
                    🗓️ {course.slot.day} | ⏰ {course.slot.time} | 🏫 {course.slot.room} | 📍 {course.slot.campus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderTableView = () => {
    const daysOfWeek = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const timeSlots = ['Sáng (7h-11h)', 'Chiều (13h-17h)', 'Tối (18h-21h)'];

    return (
      <div className="schedules-table-view">
        {schedules.map((schedule, idx) => (
          <div key={idx} className="schedule-table-container">
            <div className="schedule-header">
              <h3>Phương án {idx + 1}</h3>
              <div className="schedule-stats">
                <span className="stat">📚 {schedule.totalCredits} TC</span>
                <span className="stat">📝 {schedule.courses.length} môn</span>
              </div>
            </div>

            <div className="schedule-table-wrapper">
              <table className="schedule-table">
                <thead>
                  <tr>
                    <th>Thời gian</th>
                    {daysOfWeek.map(day => (
                      <th key={day}>{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map(timeSlot => (
                    <tr key={timeSlot}>
                      <td className="time-slot">{timeSlot}</td>
                      {daysOfWeek.map(day => {
                        const course = schedule.courses.find(
                          c => c.slot.day === day && c.slot.time === timeSlot
                        );
                        return (
                          <td key={`${day}-${timeSlot}`} className="cell">
                            {course ? (
                              <div className="cell-content">
                                <div className="cell-code">{course.courseCode}</div>
                                <div className="cell-room">{course.slot.room}</div>
                                <div className="cell-campus">{course.slot.campus}</div>
                              </div>
                            ) : (
                              <div className="empty-cell">-</div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="recommend-container">
      <h1>🎯 Gợi ý thời gian biểu</h1>
      <p className="subtitle">
        Hệ thống sẽ tạo các phương án thời gian biểu phù hợp với ràng buộc của bạn
      </p>

      <div className="recommend-actions">
        <button onClick={handleRecommend} className="recommend-button" disabled={loading}>
          {loading ? '⏳ Đang tạo gợi ý...' : '✨ Tạo gợi ý thời gian biểu'}
        </button>

        {schedules.length > 0 && (
          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              📋 Dạng danh sách
            </button>
            <button
              className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              📅 Dạng bảng
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {!loading && schedules.length === 0 && !error && (
        <div className="empty-state">
          <p>Chưa có gợi ý nào. Nhấn nút trên để tạo gợi ý!</p>
        </div>
      )}

      {!loading && schedules.length > 0 && (
        <div className="schedules-container">
          {viewMode === 'list' ? renderListView() : renderTableView()}
        </div>
      )}
    </div>
  );
}

export default Recommend;
