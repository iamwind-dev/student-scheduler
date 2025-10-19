const sql = require('mssql');

// Azure SQL Connection Config
const config = {
    user: 'sqladmin',
    password: 'admin123@',  // Thay đổi nếu bạn dùng password khác
    server: 'student-scheduler-server.database.windows.net',
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

async function testConnection() {
    console.log('🔌 ĐANG TEST KẾT NỐI ĐẾN AZURE SQL DATABASE...\n');
    console.log('📊 Thông tin kết nối:');
    console.log(`   Server: ${config.server}`);
    console.log(`   Database: ${config.database}`);
    console.log(`   Username: ${config.user}`);
    console.log(`   Password: ${'*'.repeat(config.password.length)}\n`);

    let pool;

    try {
        console.log('⏳ Đang kết nối...');
        pool = await sql.connect(config);
        console.log('✅ KẾT NỐI THÀNH CÔNG!\n');

        // Test query
        console.log('📝 Đang kiểm tra bảng Schedules...');
        const result = await pool.request().query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_NAME = 'Schedules'
        `);

        if (result.recordset.length > 0) {
            console.log('✅ Bảng Schedules đã tồn tại!\n');

            // Đếm số records
            const countResult = await pool.request().query('SELECT COUNT(*) as count FROM Schedules');
            console.log(`📊 Số lượng thời khóa biểu đã lưu: ${countResult.recordset[0].count}\n`);

            // Hiển thị 5 records gần nhất
            if (countResult.recordset[0].count > 0) {
                const recentResult = await pool.request().query(`
                    SELECT TOP 5 id, userId, totalCredits, createdAt 
                    FROM Schedules 
                    ORDER BY createdAt DESC
                `);

                console.log('📋 5 thời khóa biểu gần nhất:');
                console.table(recentResult.recordset);
            }
        } else {
            console.log('⚠️  Bảng Schedules CHƯA tồn tại!');
            console.log('💡 Chạy lệnh sau để tạo bảng:');
            console.log('   node create-schedules-table.js\n');
        }

        // Test một số queries khác
        console.log('📊 Thống kê database:');
        const tablesResult = await pool.request().query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_TYPE = 'BASE TABLE'
            ORDER BY TABLE_NAME
        `);

        console.log(`   Tổng số bảng: ${tablesResult.recordset.length}`);
        console.log('   Danh sách bảng:');
        tablesResult.recordset.forEach(table => {
            console.log(`   - ${table.TABLE_NAME}`);
        });

        console.log('\n✅ TEST HOÀN TẤT - Database đang hoạt động tốt!');
        console.log('\n📌 BƯỚC TIẾP THEO:');
        console.log('   1. Nếu chưa có bảng Schedules: chạy "node create-schedules-table.js"');
        console.log('   2. Uncomment code trong api/src/functions/schedules.js');
        console.log('   3. Restart backend: cd ../api && npm start');
        console.log('   4. Test API: curl http://localhost:7071/api/schedules/demo-user\n');

    } catch (error) {
        console.log('❌ LỖI KẾT NỐI!\n');

        if (error.code === 'ELOGIN') {
            console.log('🔐 Lỗi: Sai username hoặc password');
            console.log('💡 Giải pháp:');
            console.log('   1. Kiểm tra lại username/password trong Azure Portal');
            console.log('   2. Reset password nếu cần:');
            console.log('      Azure Portal → SQL servers → student-scheduler-server → Reset password\n');
        }
        else if (error.code === 'ESOCKET' || error.code === 'ECONNRESET') {
            console.log('🛡️  Lỗi: Firewall chưa mở hoặc không kết nối được server');
            console.log('💡 Giải pháp:');
            console.log('   1. Mở Azure Portal: https://portal.azure.com');
            console.log('   2. Vào: SQL servers → student-scheduler-server → Networking');
            console.log('   3. Click "Add your client IPv4 address"');
            console.log('   4. Đảm bảo checked "Allow Azure services..."');
            console.log('   5. Click Save và đợi 2-3 phút\n');
            console.log('   📍 IP hiện tại của bạn:');
            console.log('      Chạy: curl -s https://api.ipify.org\n');
        }
        else if (error.code === 'ETIMEOUT') {
            console.log('⏱️  Lỗi: Timeout - Không thể kết nối trong thời gian cho phép');
            console.log('💡 Giải pháp:');
            console.log('   1. Kiểm tra kết nối internet');
            console.log('   2. Kiểm tra firewall của máy local');
            console.log('   3. Thử lại sau vài phút\n');
        }
        else {
            console.log(`❓ Lỗi không xác định: ${error.message}`);
            console.log('📄 Chi tiết lỗi:');
            console.error(error);
        }

        console.log('\n📚 Tài liệu hỗ trợ:');
        console.log('   - Xem file: database/SETUP_SCHEDULES_TABLE.md');
        console.log('   - Xem file: database/AZURE_SQL_SETUP.md\n');
    } finally {
        if (pool) {
            await pool.close();
            console.log('🔌 Đã đóng kết nối database');
        }
    }
}

// Chạy test
console.log('═══════════════════════════════════════════════════════');
console.log('    AZURE SQL DATABASE CONNECTION TEST');
console.log('═══════════════════════════════════════════════════════\n');

testConnection().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
