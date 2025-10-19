const sql = require('mssql');
const fs = require('fs');
const path = require('path');

// SQL Server configuration
const config = {
    server: process.env.SQL_SERVER || 'student-scheduler-server.database.windows.net',
    database: process.env.SQL_DATABASE || 'student-scheduler-db',
    user: process.env.SQL_USER || 'sqladmin',
    password: process.env.SQL_PASSWORD || 'admin123@',
    options: {
        encrypt: true,
        trustServerCertificate: false
    }
};

async function createSchedulesTable() {
    try {
        console.log('📊 Connecting to Azure SQL Server...');
        console.log(`Server: ${config.server}`);
        console.log(`Database: ${config.database}`);

        // Connect to database
        await sql.connect(config);
        console.log('✅ Connected successfully!\n');

        // Read SQL script
        const sqlScript = fs.readFileSync(
            path.join(__dirname, 'add-schedules-table.sql'),
            'utf8'
        );

        console.log('📝 Executing SQL script...');
        console.log('----------------------------');

        // Split by GO statements and execute each batch
        const batches = sqlScript.split(/\nGO\n|\nGO$/gi).filter(batch => batch.trim());

        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i].trim();
            if (batch) {
                console.log(`\nExecuting batch ${i + 1}/${batches.length}...`);
                await sql.query(batch);
                console.log('✅ Batch completed');
            }
        }

        console.log('\n✅ Schedules table created successfully!');
        console.log('\nTable structure:');
        console.log('- id: INT IDENTITY(1,1) PRIMARY KEY');
        console.log('- userId: NVARCHAR(255) NOT NULL');
        console.log('- coursesJson: NVARCHAR(MAX) NOT NULL');
        console.log('- totalCredits: INT NOT NULL');
        console.log('- createdAt: DATETIME2');
        console.log('- updatedAt: DATETIME2');

        // Verify table exists
        const result = await sql.query`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_NAME = 'Schedules'
        `;

        if (result.recordset.length > 0) {
            console.log('\n✅ Verification: Schedules table exists in database');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
    } finally {
        await sql.close();
        console.log('\n📊 Database connection closed');
    }
}

// Run the script
createSchedulesTable();
