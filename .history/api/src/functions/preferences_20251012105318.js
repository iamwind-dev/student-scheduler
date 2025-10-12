const { app } = require('@azure/functions');

app.http('preferences', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('HTTP trigger function processed a request for preferences');

        try {
            // Đọc body từ request
            const body = await request.json();
            const { studentId, preferences } = body;

            // Log để kiểm tra
            context.log('Student ID:', studentId);
            context.log('Preferences:', JSON.stringify(preferences, null, 2));

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

            if (!preferences) {
                return {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        error: 'preferences is required'
                    })
                };
            }

            // Trong thực tế, bạn sẽ lưu vào database ở đây
            // Ví dụ: await saveToDatabase(studentId, preferences);

            // Trả về response thành công
            return {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: 'Preferences saved successfully',
                    studentId: studentId,
                    prefs: preferences,
                    savedAt: new Date().toISOString()
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
