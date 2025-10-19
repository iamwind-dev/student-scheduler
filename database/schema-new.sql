-- =====================================================
-- NEW SCHEMA FOR STUDENT SCHEDULER (SIMPLIFIED)
-- Based on output_fixed.json structure
-- =====================================================

-- Drop existing tables if they exist
IF OBJECT_ID('CourseSchedules', 'U') IS NOT NULL DROP TABLE CourseSchedules;
IF OBJECT_ID('Courses', 'U') IS NOT NULL DROP TABLE Courses;

-- Main Courses Table
CREATE TABLE Courses (
    ID INT PRIMARY KEY,
    Name NVARCHAR(500) NOT NULL,
    Credits INT NOT NULL,
    Lecturer NVARCHAR(255) NOT NULL,
    Time NVARCHAR(100) NOT NULL, -- "Thứ Tư | Tiết 1->3"
    Room NVARCHAR(50) NOT NULL,
    Weeks NVARCHAR(50) NOT NULL, -- "4->16" or "4,6->17"
    Quantity INT NOT NULL, -- Sỉ số
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE()
);

-- Index for better query performance
CREATE INDEX IX_Courses_Name ON Courses(Name);
CREATE INDEX IX_Courses_Credits ON Courses(Credits);
CREATE INDEX IX_Courses_Lecturer ON Courses(Lecturer);

-- Additional table for schedule slots (if needed for future expansion)
CREATE TABLE CourseSchedules (
    ScheduleID INT IDENTITY(1,1) PRIMARY KEY,
    CourseID INT NOT NULL,
    DayOfWeek NVARCHAR(20),
    StartPeriod INT,
    EndPeriod INT,
    Room NVARCHAR(50),
    Weeks NVARCHAR(50),
    FOREIGN KEY (CourseID) REFERENCES Courses(ID)
);

CREATE INDEX IX_CourseSchedules_CourseID ON CourseSchedules(CourseID);
