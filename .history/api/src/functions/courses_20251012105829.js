const { app } = require('@azure/functions');

app.http('courses', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('HTTP trigger function processed a request for courses');

        // Lấy parameter semester từ query string
        const semester = request.query.get('semester') || '2025A';

        // Data demo môn học
        const courses = [
            {
                id: 1,
                code: 'CS101',
                name: 'Lập trình căn bản',
                semester: semester,
                credits: 3,
                lecturer: 'TS. Nguyễn Văn A',
                slots: [
                    { day: 'Thứ 2', time: 'Sáng (7h-11h)', room: 'A101', campus: 'Cơ sở A' },
                    { day: 'Thứ 4', time: 'Chiều (13h-17h)', room: 'B202', campus: 'Cơ sở B' }
                ]
            },
            {
                id: 2,
                code: 'CS102',
                name: 'Cấu trúc dữ liệu và giải thuật',
                semester: semester,
                credits: 4,
                lecturer: 'PGS.TS. Trần Thị B',
                slots: [
                    { day: 'Thứ 3', time: 'Sáng (7h-11h)', room: 'A203', campus: 'Cơ sở A' },
                    { day: 'Thứ 5', time: 'Chiều (13h-17h)', room: 'C101', campus: 'Cơ sở A' }
                ]
            },
            {
                id: 3,
                code: 'CS201',
                name: 'Cơ sở dữ liệu',
                semester: semester,
                credits: 3,
                lecturer: 'ThS. Lê Văn C',
                slots: [
                    { day: 'Thứ 2', time: 'Chiều (13h-17h)', room: 'B105', campus: 'Cơ sở B' },
                    { day: 'Thứ 6', time: 'Sáng (7h-11h)', room: 'A304', campus: 'Cơ sở A' }
                ]
            },
            {
                id: 4,
                code: 'CS202',
                name: 'Mạng máy tính',
                semester: semester,
                credits: 3,
                lecturer: 'TS. Phạm Thị D',
                slots: [
                    { day: 'Thứ 3', time: 'Chiều (13h-17h)', room: 'C201', campus: 'Cơ sở A' },
                    { day: 'Thứ 5', time: 'Sáng (7h-11h)', room: 'B301', campus: 'Cơ sở B' }
                ]
            },
            {
                id: 5,
                code: 'CS301',
                name: 'Công nghệ phần mềm',
                semester: semester,
                credits: 4,
                lecturer: 'PGS.TS. Hoàng Văn E',
                slots: [
                    { day: 'Thứ 4', time: 'Sáng (7h-11h)', room: 'A401', campus: 'Cơ sở A' },
                    { day: 'Thứ 7', time: 'Chiều (13h-17h)', room: 'B401', campus: 'Cơ sở B' }
                ]
            },
            {
                id: 6,
                code: 'CS302',
                name: 'Trí tuệ nhân tạo',
                semester: semester,
                credits: 3,
                lecturer: 'TS. Vũ Thị F',
                slots: [
                    { day: 'Thứ 2', time: 'Tối (18h-21h)', room: 'C301', campus: 'Cơ sở A' },
                    { day: 'Thứ 5', time: 'Tối (18h-21h)', room: 'A501', campus: 'Cơ sở A' }
                ]
            },
            {
                id: 7,
                code: 'MATH101',
                name: 'Toán cao cấp A1',
                semester: semester,
                credits: 3,
                lecturer: 'PGS.TS. Đỗ Văn G',
                slots: [
                    { day: 'Thứ 3', time: 'Sáng (7h-11h)', room: 'D101', campus: 'Cơ sở B' },
                    { day: 'Thứ 6', time: 'Chiều (13h-17h)', room: 'D102', campus: 'Cơ sở B' }
                ]
            },
            {
                id: 8,
                code: 'ENG101',
                name: 'Tiếng Anh chuyên ngành',
                semester: semester,
                credits: 2,
                lecturer: 'ThS. Ngô Thị H',
                slots: [
                    { day: 'Thứ 4', time: 'Tối (18h-21h)', room: 'E201', campus: 'Cơ sở A' },
                    { day: 'Thứ 7', time: 'Sáng (7h-11h)', room: 'E202', campus: 'Cơ sở B' }
                ]
            }
        ];

        return {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(courses)
        };
    }
});
