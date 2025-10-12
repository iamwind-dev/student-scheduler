const { app } = require('@azure/functions');
const fs = require('fs');
const path = require('path');

app.http('courses', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('HTTP trigger function processed a request for courses');

        // Lấy parameter semester từ query string
        const semester = request.query.get('semester') || '2025A';

        try {
            // Đọc data từ file data.json
            const dataPath = path.join(__dirname, '../data/data.json');
            const rawData = fs.readFileSync(dataPath, 'utf-8');
            const coursesData = JSON.parse(rawData);

            // Transform data từ format cũ sang format mới
            const courses = coursesData.map(course => {
                // Parse thời gian: "Thứ Tư | Tiết 1->3"
                let day = 'Thứ 2';
                let timeSlot = 'Tiết 1->3';
                
                if (course.time && course.time.includes('|')) {
                    const timeParts = course.time.split(' | ');
                    day = timeParts[0] || 'Thứ 2';
                    timeSlot = timeParts[1] || 'Tiết 1->3';
                }
                
                // Chuyển đổi tiết học sang giờ học
                const getTimeRange = (timeSlot) => {
                    if (!timeSlot) return 'Sáng (7h-11h)';
                    const match = timeSlot.match(/Tiết (\d+)->?(\d+)?/);
                    if (match) {
                        const start = parseInt(match[1]);
                        if (start >= 1 && start <= 5) return 'Sáng (7h-11h)';
                        if (start >= 6 && start <= 10) return 'Chiều (13h-17h)';
                        return 'Tối (18h-21h)';
                    }
                    return 'Sáng (7h-11h)';
                };

                // Xác định cơ sở dựa trên ký tự đầu của phòng
                const room = course.room || 'V.A101';
                const campus = room.startsWith('V.') ? 'Cơ sở A' : 
                              room.startsWith('K.') ? 'Cơ sở B' : 'Cơ sở A';

                return {
                    id: course.id,
                    code: `COURSE${course.id}`,
                    name: course.name || 'Môn học',
                    semester: semester,
                    credits: 3, // Mặc định 3 tín chỉ
                    lecturer: course.lecturer || 'Chưa có thông tin',
                    slots: [
                        {
                            day: day,
                            time: getTimeRange(timeSlot),
                            room: room,
                            campus: campus,
                            weeks: course.weeks || '1->18',
                            capacity: course["Sỉ số"] || '0'
                        }
                    ]
                };
            }).filter(course => course.name !== 'Môn học'); // Lọc các môn không hợp lệ

            context.log(`Loaded ${courses.length} courses from data.json`);

            context.log(`Loaded ${courses.length} courses from data.json`);

            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(courses)
            };
        } catch (error) {
            context.error('Error loading courses:', error);
            return {
                status: 500,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    error: 'Failed to load courses',
                    message: error.message
                })
            };
        }
    }
});
