/**
 * IMPORT NEW DATABASE FROM JSON
 * Import output_fixed.json to Azure SQL Database
 */

const sql = require('mssql');
const fs = require('fs');
const path = require('path');

// Azure SQL Connection Config
const config = {
    user: 'sqladmin',
    password: 'Wind060304@',
    server: 'student-schedule.database.windows.net',
    database: 'student-scheduler-db',
    options: {
        encrypt: true,
        trustServerCertificate: false,
        enableArithAbort: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

async function importNewData() {
    let pool;

    try {
        console.log('🔌 Connecting to Azure SQL Database...');
        pool = await sql.connect(config);
        console.log('✅ Connected successfully!');

        // Read JSON file
        const jsonPath = path.join(__dirname, 'output_fixed.json');
        console.log(`📖 Reading JSON file: ${jsonPath}`);
        const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        console.log(`📊 Found ${jsonData.length} courses to import`);

        // Step 1: Drop and recreate table
        console.log('\n🗑️ Dropping old Courses table...');
        await pool.request().query(`
            IF OBJECT_ID('CourseSchedules', 'U') IS NOT NULL DROP TABLE CourseSchedules;
            IF OBJECT_ID('Courses', 'U') IS NOT NULL DROP TABLE Courses;
        `);
        console.log('✅ Old tables dropped');

        // Step 2: Create new table
        console.log('\n🏗️ Creating new Courses table...');
        await pool.request().query(`
            CREATE TABLE Courses (
                ID INT PRIMARY KEY,
                Name NVARCHAR(500) NOT NULL,
                Credits INT NOT NULL,
                Lecturer NVARCHAR(255) NOT NULL,
                Time NVARCHAR(100) NOT NULL,
                Room NVARCHAR(50) NOT NULL,
                Weeks NVARCHAR(50) NOT NULL,
                Quantity INT NOT NULL,
                CreatedAt DATETIME2 DEFAULT GETDATE(),
                UpdatedAt DATETIME2 DEFAULT GETDATE()
            );
            
            CREATE INDEX IX_Courses_Name ON Courses(Name);
            CREATE INDEX IX_Courses_Credits ON Courses(Credits);
            CREATE INDEX IX_Courses_Lecturer ON Courses(Lecturer);
        `);
        console.log('✅ New table created with indexes');

        // Step 3: Insert data in batches
        console.log('\n📥 Inserting courses data...');
        const batchSize = 100;
        let inserted = 0;

        for (let i = 0; i < jsonData.length; i += batchSize) {
            const batch = jsonData.slice(i, i + batchSize);

            for (const course of batch) {
                try {
                    await pool.request()
                        .input('id', sql.Int, course.ID)
                        .input('name', sql.NVarChar(500), course.Name)
                        .input('credits', sql.Int, course.Credits)
                        .input('lecturer', sql.NVarChar(255), course.Lecturer)
                        .input('time', sql.NVarChar(100), course.Time)
                        .input('room', sql.NVarChar(50), course.Room)
                        .input('weeks', sql.NVarChar(50), course.Weeks)
                        .input('quantity', sql.Int, course.Quantity)
                        .query(`
                            INSERT INTO Courses (ID, Name, Credits, Lecturer, Time, Room, Weeks, Quantity)
                            VALUES (@id, @name, @credits, @lecturer, @time, @room, @weeks, @quantity)
                        `);

                    inserted++;

                    if (inserted % 100 === 0) {
                        console.log(`   ✓ Inserted ${inserted}/${jsonData.length} courses...`);
                    }
                } catch (err) {
                    console.error(`   ❌ Error inserting course ID ${course.ID}:`, err.message);
                }
            }
        }

        console.log(`\n✅ Successfully inserted ${inserted} courses!`);

        // Step 4: Verify data
        console.log('\n🔍 Verifying data...');
        const result = await pool.request().query('SELECT COUNT(*) as Total FROM Courses');
        console.log(`   Total courses in database: ${result.recordset[0].Total}`);

        // Show sample data
        const sample = await pool.request().query('SELECT TOP 5 * FROM Courses ORDER BY ID');
        console.log('\n📋 Sample data:');
        sample.recordset.forEach(course => {
            console.log(`   - [${course.ID}] ${course.Name} (${course.Credits} TC)`);
        });

        // Statistics
        const stats = await pool.request().query(`
            SELECT 
                Credits,
                COUNT(*) as Count
            FROM Courses
            GROUP BY Credits
            ORDER BY Credits
        `);

        console.log('\n📊 Credits distribution:');
        stats.recordset.forEach(stat => {
            console.log(`   ${stat.Credits} tín chỉ: ${stat.Count} môn học`);
        });

        console.log('\n🎉 Import completed successfully!');

    } catch (err) {
        console.error('\n❌ Error:', err.message);
        console.error(err);
        throw err;
    } finally {
        if (pool) {
            await pool.close();
            console.log('\n🔌 Database connection closed');
        }
    }
}

// Run import
console.log('====================================');
console.log('  STUDENT SCHEDULER - DATA IMPORT  ');
console.log('====================================\n');

importNewData()
    .then(() => {
        console.log('\n✅ All done!');
        process.exit(0);
    })
    .catch((err) => {
        console.error('\n❌ Import failed:', err);
        process.exit(1);
    });
