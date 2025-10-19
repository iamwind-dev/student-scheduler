/**
 * SCHEDULE DETAILS PAGE PLACEHOLDER
 */

import React from 'react';
import { useParams } from 'react-router-dom';

const ScheduleDetailsPage = () => {
    const { scheduleId } = useParams();

    return (
        <div>
            <h1>Chi tiết thời khóa biểu</h1>
            <p>Chi tiết TKB ID: {scheduleId}</p>
        </div>
    );
};

export default ScheduleDetailsPage;
