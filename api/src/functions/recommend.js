const { app } = require('@azure/functions');
const fs = require('fs');
const path = require('path');

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

            // Đọc data từ file data.json
            const dataPath = path.join(__dirname, '../data/data.json');
            const rawData = fs.readFileSync(dataPath, 'utf-8');
            const coursesData = JSON.parse(rawData);

            // Helper function để parse thời gian
            const parseTime = (timeStr) => {
                let day = 'Thứ 2';
                let timeSlot = 'Tiết 1->3';
                
                if (timeStr && timeStr.includes('|')) {
                    const timeParts = timeStr.split(' | ');
                    day = timeParts[0] || 'Thứ 2';
                    timeSlot = timeParts[1] || 'Tiết 1->3';
                }
                
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

                return {
                    day: day,
                    timeRange: getTimeRange(timeSlot),
                    timeSlot: timeSlot
                };
            };

            // Lọc courses theo preferences nếu có
            let filteredCourses = coursesData.filter(c => c.time && c.name); // Chỉ lấy courses có đầy đủ thông tin
            
            if (preferences) {
                // Lọc theo campus nếu có
                if (preferences.preferredCampus && preferences.preferredCampus !== 'Không ưu tiên') {
                    const campusPrefix = preferences.preferredCampus === 'Cơ sở A' ? 'V.' : 'K.';
                    filteredCourses = filteredCourses.filter(c => c.room && c.room.startsWith(campusPrefix));
                }

                // Lọc theo time slots nếu có
                if (preferences.avoidMorning || preferences.avoidAfternoon || preferences.avoidEvening) {
                    filteredCourses = filteredCourses.filter(course => {
                        const timeInfo = parseTime(course.time);
                        if (preferences.avoidMorning && timeInfo.timeRange.includes('Sáng')) return false;
                        if (preferences.avoidAfternoon && timeInfo.timeRange.includes('Chiều')) return false;
                        if (preferences.avoidEvening && timeInfo.timeRange.includes('Tối')) return false;
                        return true;
                    });
                }
            }

            // Tạo 3 phương án gợi ý khác nhau
            const generateSchedule = (courses, offset = 0) => {
                const selected = [];
                const usedTimeSlots = new Set();
                
                // Shuffle courses với offset khác nhau để có phương án khác nhau
                const shuffled = [...courses].sort((a, b) => 
                    (a.id + offset * 13) % 100 - (b.id + offset * 17) % 100
                ).slice(0, Math.min(50, courses.length)); // Giới hạn 50 môn để xử lý nhanh

                for (const course of shuffled) {
                    if (selected.length >= 5) break; // Giới hạn 5 môn/phương án

                    const timeInfo = parseTime(course.time);
                    const timeKey = `${timeInfo.day}-${timeInfo.timeRange}`;

                    // Kiểm tra xung đột thời gian
                    if (!usedTimeSlots.has(timeKey)) {
                        const room = course.room || 'V.A101';
                        const campus = room.startsWith('V.') ? 'Cơ sở A' : 
                                     room.startsWith('K.') ? 'Cơ sở B' : 'Cơ sở A';

                        selected.push({
                            courseCode: `COURSE${course.id}`,
                            courseName: course.name,
                            lecturer: course.lecturer || 'Chưa có thông tin',
                            slot: {
                                day: timeInfo.day,
                                time: timeInfo.timeRange,
                                room: room,
                                campus: campus,
                                weeks: course.weeks || '1->18',
                                capacity: course["Sỉ số"] || '0'
                            }
                        });
                        usedTimeSlots.add(timeKey);
                    }
                }

                return {
                    totalCredits: selected.length * 3, // Giả sử mỗi môn 3 tín chỉ
                    courses: selected
                };
            };

            // Tạo 3 phương án khác nhau
            const recommendations = [
                generateSchedule(filteredCourses, 0),
                generateSchedule(filteredCourses, 1),
                generateSchedule(filteredCourses, 2)
            ].filter(schedule => schedule.courses.length > 0); // Chỉ lấy phương án có môn học

            context.log(`Generated ${recommendations.length} schedule recommendations from ${filteredCourses.length} courses`);

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
