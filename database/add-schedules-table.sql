-- =====================================================
-- ADD SCHEDULES TABLE FOR SAVING USER SCHEDULES
-- =====================================================

-- Drop table if exists
IF OBJECT_ID('Schedules', 'U') IS NOT NULL DROP TABLE Schedules;

-- Schedules table to store user's saved schedules
CREATE TABLE Schedules (
    id INT IDENTITY(1,1) PRIMARY KEY,
    userId NVARCHAR(255) NOT NULL,
    coursesJson NVARCHAR(MAX) NOT NULL,
    totalCredits INT NOT NULL,
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE()
);

-- Index for better query performance
CREATE INDEX IX_Schedules_UserId ON Schedules(userId);
CREATE INDEX IX_Schedules_CreatedAt ON Schedules(createdAt);

-- Add comment
EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Stores user schedules with course data in JSON format',
    @level0type = N'SCHEMA', @level0name = 'dbo',
    @level1type = N'TABLE',  @level1name = 'Schedules';
