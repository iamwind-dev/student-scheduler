import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatsCard from '../../components/dashboard/StatsCard';
import QuickAction from '../../components/dashboard/QuickAction';
import './DashboardPage.css';

const DashboardPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        courses: 0,
        preferences: 0,
        schedules: 0,
        loading: true
    });

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const response = await fetch('http://localhost:7071/api/courses');
            const courses = await response.json();

            setStats({
                courses: courses.length || 0,
                preferences: 0,
                schedules: 0,
                loading: false
            });
        } catch (error) {
            console.error('Failed to fetch dashboard stats:', error);
            setStats(prev => ({ ...prev, loading: false }));
        }
    };

    if (!user) {
        return <LoadingSpinner fullscreen message="Đang tải dashboard..." />;
    }

    if (stats.loading) {
        return <LoadingSpinner fullscreen message="Đang tải thông tin..." />;
    }

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <div>
                    <h1>Dashboard</h1>
                    <p>Chào mừng trở lại, {user?.name || 'Sinh viên'}!</p>
                </div>
            </div>

            <div className="dashboard-stats">
                <StatsCard
                    icon="📚"
                    title="Môn học"
                    value={stats.courses}
                    subtitle="Đã đăng ký"
                    color="primary"
                />
                <StatsCard
                    icon="❄️"
                    title="Ràng buộc"
                    value={stats.preferences}
                    subtitle="Đã thiết lập"
                    color="success"
                />
                <StatsCard
                    icon="🎓"
                    title="Thời khóa biểu"
                    value={stats.schedules}
                    subtitle="Được đề xuất"
                    color="warning"
                />
            </div>

            <div className="dashboard-section">
                <h2>Thao tác nhanh</h2>
                <div className="quick-actions">
                    <QuickAction
                        icon="📚"
                        title="Quản lý môn học"
                        description="Xem danh sách môn học và tín chỉ"
                        onClick={() => navigate('/courses')}
                        color="primary"
                    />
                    <QuickAction
                        icon="❄️"
                        title="Thiết lập ràng buộc"
                        description="Đang phát triển - Coming soon"
                        onClick={() => {}}
                        color="success"
                    />
                    <QuickAction
                        icon="🎓"
                        title="Thời khóa biểu"
                        description="Tự tạo hoặc AI đề xuất (18 tín chỉ)"
                        onClick={() => navigate('/schedule')}
                        color="warning"
                    />
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
