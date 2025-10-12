const { app } = require('@azure/functions');

app.http('recommend', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('HTTP trigger function processed a request for recommend');

        try {
            // Đọc body từ request
            const body = await request.json();
            const { studentId, preferences } = body;

            // Log để kiểm tra
            context.log('Student ID:', studentId);
            context.log('Preferences:', preferences);

            // Validate dữ liệu
            if (!studentId) {
                return {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        error: 'studentId is required'
                    })
                };
            }

            // Demo data - gợi ý thời gian biểu
            // Trong thực tế, đây sẽ là thuật toán tối ưu hóa dựa trên ràng buộc
            const recommendations = [
                {
                    totalCredits: 15,
                    courses: [
                        {
                            courseCode: 'CS101',
                            courseName: 'Lập trình căn bản',
                            slot: {
                                day: 'Thứ 2',
                                time: 'Sáng (7h-11h)',
                                room: 'A101',
                                campus: 'Cơ sở A'
                            }
                        },
                        {
                            courseCode: 'CS102',
                            courseName: 'Cấu trúc dữ liệu và giải thuật',
                            slot: {
                                day: 'Thứ 3',
                                time: 'Sáng (7h-11h)',
                                room: 'A203',
                                campus: 'Cơ sở A'
                            }
                        },
                        {
                            courseCode: 'CS201',
                            courseName: 'Cơ sở dữ liệu',
                            slot: {
                                day: 'Thứ 2',
                                time: 'Chiều (13h-17h)',
                                room: 'B105',
                                campus: 'Cơ sở B'
                            }
                        },
                        {
                            courseCode: 'MATH101',
                            courseName: 'Toán cao cấp A1',
                            slot: {
                                day: 'Thứ 6',
                                time: 'Chiều (13h-17h)',
                                room: 'D102',
                                campus: 'Cơ sở B'
                            }
                        },
                        {
                            courseCode: 'ENG101',
                            courseName: 'Tiếng Anh chuyên ngành',
                            slot: {
                                day: 'Thứ 7',
                                time: 'Sáng (7h-11h)',
                                room: 'E202',
                                campus: 'Cơ sở B'
                            }
                        }
                    ]
                },
                {
                    totalCredits: 16,
                    courses: [
                        {
                            courseCode: 'CS101',
                            courseName: 'Lập trình căn bản',
                            slot: {
                                day: 'Thứ 4',
                                time: 'Chiều (13h-17h)',
                                room: 'B202',
                                campus: 'Cơ sở B'
                            }
                        },
                        {
                            courseCode: 'CS102',
                            courseName: 'Cấu trúc dữ liệu và giải thuật',
                            slot: {
                                day: 'Thứ 5',
                                time: 'Chiều (13h-17h)',
                                room: 'C101',
                                campus: 'Cơ sở A'
                            }
                        },
                        {
                            courseCode: 'CS202',
                            courseName: 'Mạng máy tính',
                            slot: {
                                day: 'Thứ 3',
                                time: 'Chiều (13h-17h)',
                                room: 'C201',
                                campus: 'Cơ sở A'
                            }
                        },
                        {
                            courseCode: 'CS301',
                            courseName: 'Công nghệ phần mềm',
                            slot: {
                                day: 'Thứ 7',
                                time: 'Chiều (13h-17h)',
                                room: 'B401',
                                campus: 'Cơ sở B'
                            }
                        },
                        {
                            courseCode: 'ENG101',
                            courseName: 'Tiếng Anh chuyên ngành',
                            slot: {
                                day: 'Thứ 4',
                                time: 'Tối (18h-21h)',
                                room: 'E201',
                                campus: 'Cơ sở A'
                            }
                        }
                    ]
                },
                {
                    totalCredits: 17,
                    courses: [
                        {
                            courseCode: 'CS102',
                            courseName: 'Cấu trúc dữ liệu và giải thuật',
                            slot: {
                                day: 'Thứ 3',
                                time: 'Sáng (7h-11h)',
                                room: 'A203',
                                campus: 'Cơ sở A'
                            }
                        },
                        {
                            courseCode: 'CS201',
                            courseName: 'Cơ sở dữ liệu',
                            slot: {
                                day: 'Thứ 6',
                                time: 'Sáng (7h-11h)',
                                room: 'A304',
                                campus: 'Cơ sở A'
                            }
                        },
                        {
                            courseCode: 'CS202',
                            courseName: 'Mạng máy tính',
                            slot: {
                                day: 'Thứ 5',
                                time: 'Sáng (7h-11h)',
                                room: 'B301',
                                campus: 'Cơ sở B'
                            }
                        },
                        {
                            courseCode: 'CS301',
                            courseName: 'Công nghệ phần mềm',
                            slot: {
                                day: 'Thứ 4',
                                time: 'Sáng (7h-11h)',
                                room: 'A401',
                                campus: 'Cơ sở A'
                            }
                        },
                        {
                            courseCode: 'MATH101',
                            courseName: 'Toán cao cấp A1',
                            slot: {
                                day: 'Thứ 3',
                                time: 'Sáng (7h-11h)',
                                room: 'D101',
                                campus: 'Cơ sở B'
                            }
                        }
                    ]
                }
            ];

            // Trả về kết quả gợi ý
            return {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: 'Schedule recommendations generated successfully',
                    studentId: studentId,
                    recommendations: recommendations,
                    generatedAt: new Date().toISOString()
                })
            };

        } catch (error) {
            context.log('Error:', error);
            return {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    error: 'Internal server error',
                    details: error.message
                })
            };
        }
    }
});
