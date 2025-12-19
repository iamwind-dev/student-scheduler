-- =============================================
-- AZURE SQL DATABASE SETUP SCRIPT
-- Student Scheduler System
-- =============================================

-- =============================================
-- TABLE 1: Users
-- Lưu thông tin sinh viên/người dùng
-- =============================================
CREATE TABLE Users (
    UserId NVARCHAR(100) PRIMARY KEY,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    Name NVARCHAR(255),
    Role NVARCHAR(50) DEFAULT 'Student',
    CreatedAt DATETIME DEFAULT GETDATE(),
    LastLoginAt DATETIME DEFAULT GETDATE()
);

GO

-- =============================================
-- TABLE 2: Schedules
-- Lưu tóm tắt thời khóa biểu của user
-- =============================================
CREATE TABLE Schedules (
    ScheduleId INT IDENTITY(1,1) PRIMARY KEY,
    UserId NVARCHAR(100) NOT NULL,
    CoursesData NVARCHAR(MAX) NOT NULL,
    TotalCredits INT,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Schedules_Users FOREIGN KEY (UserId) 
        REFERENCES Users(UserId) ON DELETE CASCADE
);

GO

-- =============================================
-- TABLE 3: ScheduleDetails
-- Lưu chi tiết từng môn học đã chọn
-- =============================================
CREATE TABLE ScheduleDetails (
    DetailId INT IDENTITY(1,1) PRIMARY KEY,
    UserId NVARCHAR(100) NOT NULL,
    CourseId INT NOT NULL,
    CourseName NVARCHAR(500),
    CourseCode NVARCHAR(50),
    Credits INT,
    Lecturer NVARCHAR(255),
    Time NVARCHAR(100),
    Room NVARCHAR(100),
    Weeks NVARCHAR(100),
    CreatedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_ScheduleDetails_Users FOREIGN KEY (UserId) 
        REFERENCES Users(UserId) ON DELETE CASCADE
);

GO

-- =============================================
-- TABLE 4: Courses (nếu chưa có)
-- Danh sách tất cả môn học
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Courses' AND xtype='U')
BEGIN
    CREATE TABLE Courses (
        ID INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(500) NOT NULL,
        Credits INT DEFAULT 2,
        Lecturer NVARCHAR(255),
        Time NVARCHAR(100),
        Room NVARCHAR(100),
        Weeks NVARCHAR(100),
        Quantity INT DEFAULT 0
    );
END

GO

-- =============================================
-- CREATE INDEXES for better performance
-- =============================================

-- Index cho Users
CREATE INDEX IX_Users_Email ON Users(Email);

-- Index cho Schedules
CREATE INDEX IX_Schedules_UserId ON Schedules(UserId);
CREATE INDEX IX_Schedules_CreatedAt ON Schedules(CreatedAt DESC);

-- Index cho ScheduleDetails
CREATE INDEX IX_ScheduleDetails_UserId ON ScheduleDetails(UserId);
CREATE INDEX IX_ScheduleDetails_CourseId ON ScheduleDetails(CourseId);

-- Index cho Courses
IF EXISTS (SELECT * FROM sysobjects WHERE name='Courses' AND xtype='U')
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_Courses_Name')
        CREATE INDEX IX_Courses_Name ON Courses(Name);
    
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_Courses_Time')
        CREATE INDEX IX_Courses_Time ON Courses(Time);
END

GO

-- =============================================
-- INSERT SAMPLE DATA (Optional - for testing)
-- =============================================

-- Sample User
INSERT INTO Users (UserId, Email, Name, Role)
VALUES 
    ('demo-user-123', 'demo@student.edu', 'Sinh viên Demo', 'Student'),
    ('test-user-456', 'test@student.edu', 'Test User', 'Student');

GO

-- =============================================
-- USEFUL QUERIES
-- =============================================

-- Xem tất cả users
-- SELECT * FROM Users;

-- Xem tất cả schedules
-- SELECT * FROM Schedules;

-- Xem chi tiết môn học của từng user
-- SELECT 
--     u.Name as UserName,
--     u.Email,
--     sd.CourseName,
--     sd.Lecturer,
--     sd.Credits,
--     sd.Time,
--     sd.Room
-- FROM ScheduleDetails sd
-- JOIN Users u ON sd.UserId = u.UserId
-- ORDER BY u.Name, sd.CourseName;

-- Đếm số môn và tổng tín chỉ của mỗi user
-- SELECT 
--     u.UserId,
--     u.Name,
--     u.Email,
--     COUNT(sd.DetailId) as TotalCourses,
--     SUM(sd.Credits) as TotalCredits
-- FROM Users u
-- LEFT JOIN ScheduleDetails sd ON u.UserId = sd.UserId
-- GROUP BY u.UserId, u.Name, u.Email;

-- Xem lịch sử update của schedules
-- SELECT 
--     s.ScheduleId,
--     u.Name,
--     s.TotalCredits,
--     s.CreatedAt,
--     s.UpdatedAt,
--     DATEDIFF(MINUTE, s.CreatedAt, s.UpdatedAt) as MinutesSinceCreated
-- FROM Schedules s
-- JOIN Users u ON s.UserId = u.UserId
-- ORDER BY s.UpdatedAt DESC;

GO

-- =============================================
-- CLEANUP QUERIES (Use with caution!)
-- =============================================

-- Xóa tất cả dữ liệu (giữ structure)
-- DELETE FROM ScheduleDetails;
-- DELETE FROM Schedules;
-- DELETE FROM Users;

-- Drop tất cả tables (xóa hoàn toàn)
-- DROP TABLE IF EXISTS ScheduleDetails;
-- DROP TABLE IF EXISTS Schedules;
-- DROP TABLE IF EXISTS Users;
-- DROP TABLE IF EXISTS Courses;

GO

PRINT '✅ Database setup completed successfully!';
PRINT '📊 Tables created: Users, Schedules, ScheduleDetails, Courses';
PRINT '🚀 Ready to use!';
