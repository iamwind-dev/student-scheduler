import { useState } from 'react';
import './Preferences.css';
import API_BASE from '../config';

function Preferences({ studentId }) {
  const [preferences, setPreferences] = useState({
    maxCredits: 18,
    freeTime: [],
    campus: 'all',
    avoidMorning: false,
    avoidEvening: false
  });

  const [freeTimeDay, setFreeTimeDay] = useState('');
  const [freeTimeSlot, setFreeTimeSlot] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleAddFreeTime = () => {
    if (freeTimeDay && freeTimeSlot) {
      const newFreeTime = `${freeTimeDay} - ${freeTimeSlot}`;
      if (!preferences.freeTime.includes(newFreeTime)) {
        setPreferences({
          ...preferences,
          freeTime: [...preferences.freeTime, newFreeTime]
        });
        setFreeTimeDay('');
        setFreeTimeSlot('');
      }
    }
  };

  const handleRemoveFreeTime = (index) => {
    const newFreeTime = preferences.freeTime.filter((_, i) => i !== index);
    setPreferences({
      ...preferences,
      freeTime: newFreeTime
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
          preferences
        })
      });

      if (!response.ok) {
        throw new Error('Không thể lưu ràng buộc');
      }

      const data = await response.json();
      setMessage({ type: 'success', text: data.message || 'Lưu ràng buộc thành công!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
      console.error('Error saving preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="preferences-container">
      <h1>⚙️ Thiết lập ràng buộc</h1>
      <p className="subtitle">Nhập các ràng buộc của bạn để hệ thống gợi ý thời gian biểu phù hợp</p>

      {message && (
        <div className={`message ${message.type}`}>
          {message.type === 'success' ? '✅' : '❌'} {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="preferences-form">
        <div className="form-group">
          <label htmlFor="maxCredits">Số tín chỉ tối đa:</label>
          <input
            type="number"
            id="maxCredits"
            min="12"
            max="24"
            value={preferences.maxCredits}
            onChange={(e) => setPreferences({ ...preferences, maxCredits: parseInt(e.target.value) })}
            className="input-field"
          />
          <small>Thường từ 12-24 tín chỉ</small>
        </div>

        <div className="form-group">
          <label>Khu vực học:</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                value="all"
                checked={preferences.campus === 'all'}
                onChange={(e) => setPreferences({ ...preferences, campus: e.target.value })}
              />
              Tất cả
            </label>
            <label className="radio-label">
              <input
                type="radio"
                value="A"
                checked={preferences.campus === 'A'}
                onChange={(e) => setPreferences({ ...preferences, campus: e.target.value })}
              />
              Cơ sở A
            </label>
            <label className="radio-label">
              <input
                type="radio"
                value="B"
                checked={preferences.campus === 'B'}
                onChange={(e) => setPreferences({ ...preferences, campus: e.target.value })}
              />
              Cơ sở B
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>Thời gian rảnh (không muốn học):</label>
          <div className="free-time-input">
            <select
              value={freeTimeDay}
              onChange={(e) => setFreeTimeDay(e.target.value)}
              className="select-field"
            >
              <option value="">Chọn thứ</option>
              <option value="Thứ 2">Thứ 2</option>
              <option value="Thứ 3">Thứ 3</option>
              <option value="Thứ 4">Thứ 4</option>
              <option value="Thứ 5">Thứ 5</option>
              <option value="Thứ 6">Thứ 6</option>
              <option value="Thứ 7">Thứ 7</option>
            </select>

            <select
              value={freeTimeSlot}
              onChange={(e) => setFreeTimeSlot(e.target.value)}
              className="select-field"
            >
              <option value="">Chọn tiết</option>
              <option value="Sáng (7h-11h)">Sáng (7h-11h)</option>
              <option value="Chiều (13h-17h)">Chiều (13h-17h)</option>
              <option value="Tối (18h-21h)">Tối (18h-21h)</option>
            </select>

            <button type="button" onClick={handleAddFreeTime} className="add-button">
              + Thêm
            </button>
          </div>

          {preferences.freeTime.length > 0 && (
            <div className="free-time-list">
              {preferences.freeTime.map((time, index) => (
                <div key={index} className="free-time-item">
                  <span>{time}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFreeTime(index)}
                    className="remove-button"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Ràng buộc khác:</label>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={preferences.avoidMorning}
                onChange={(e) => setPreferences({ ...preferences, avoidMorning: e.target.checked })}
              />
              Tránh học sáng sớm (trước 9h)
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={preferences.avoidEvening}
                onChange={(e) => setPreferences({ ...preferences, avoidEvening: e.target.checked })}
              />
              Tránh học tối muộn (sau 19h)
            </label>
          </div>
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Đang lưu...' : '💾 Lưu ràng buộc'}
        </button>
      </form>
    </div>
  );
}

export default Preferences;
