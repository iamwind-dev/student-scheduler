/**
 * COURSE DETAILS PAGE PLACEHOLDER
 */

import React from 'react';
import { useParams } from 'react-router-dom';

const CourseDetailsPage = () => {
    const { courseId } = useParams();

    return (
        <div>
            <h1>Chi tiết môn học</h1>
            <p>Thông tin chi tiết môn học ID: {courseId}</p>
        </div>
    );
};

export default CourseDetailsPage;
