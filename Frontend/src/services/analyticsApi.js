const API_BASE = "http://localhost:5000/api";

/**
 * Analytics API service for fetching chart data from the backend
 */

/**
 * Get student grades over time for line chart visualization
 * @param {string|number} userId - The student's user ID
 * @param {string} from - Start date in YYYY-MM-DD format
 * @param {string} to - End date in YYYY-MM-DD format
 * @returns {Promise<Object>} Response with series data
 */
export const getStudentGrades = async (userId, from, to) => {
  const params = new URLSearchParams();
  if (from) params.append("from", from);
  if (to) params.append("to", to);

  const response = await fetch(
    `${API_BASE}/analytics/student/${userId}/grades?${params}`
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch student grades: ${response.status}`);
  }
  return response.json();
};

/**
 * Get student accuracy by topic for bar/pie chart visualization
 * @param {string|number} userId - The student's user ID
 * @returns {Promise<Object>} Response with items data
 */
export const getStudentTopicAccuracy = async (userId) => {
  const response = await fetch(
    `${API_BASE}/analytics/student/${userId}/topic-accuracy`
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch topic accuracy: ${response.status}`);
  }
  return response.json();
};

/**
 * Get exam summary counters for KPI tiles
 * @param {string|number} userId - The student's user ID
 * @param {number} days - Number of days to look back (default: 30)
 * @returns {Promise<Object>} Response with counter data
 */
export const getExamCounters = async (userId, days = 30) => {
  const response = await fetch(
    `${API_BASE}/analytics/student/${userId}/exam-counters?days=${days}`
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch exam counters: ${response.status}`);
  }
  return response.json();
};

/**
 * Get course topic distribution for admin/teacher charts
 * @param {string|number} courseId - The course ID
 * @returns {Promise<Object>} Response with topic distribution data
 */
export const getCourseTopicDistribution = async (courseId) => {
  const response = await fetch(
    `${API_BASE}/analytics/course/${courseId}/topic-distribution`
  );
  if (!response.ok) {
    throw new Error(
      `Failed to fetch course topic distribution: ${response.status}`
    );
  }
  return response.json();
};

/**
 * Get course grades over time for all users in a course
 * @param {string|number} courseId - The course ID
 * @param {string} from - Start date in YYYY-MM-DD format
 * @param {string} to - End date in YYYY-MM-DD format
 * @returns {Promise<Object>} Response with series data
 */
export const getCourseGradesOverTime = async (courseId, from, to) => {
  if (!courseId) throw new Error("courseId is required");
  const params = new URLSearchParams();
  if (from) params.append("from", from);
  if (to) params.append("to", to);

  const token =
    typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;

  const url = `${API_BASE}/analytics/course/${encodeURIComponent(
    courseId
  )}/grades-over-time${params.toString() ? `?${params.toString()}` : ""}`;

  const res = await fetch(url, {
    method: "GET",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Failed to fetch course grades over time: ${res.status} ${
        body || ""
      }`.trim()
    );
  }
  return res.json();
};


/**
 * Get video watch minutes per day for student analytics
 * @param {string|number} userId - The student's user ID
 * @param {number} days - Number of days to look back (default: 14)
 * @returns {Promise<Object>} Response with series data
 */
export const getVideoMinutes = async (userId, days = 14) => {
  const response = await fetch(
    `${API_BASE}/analytics/student/${userId}/video-minutes?days=${days}`
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch video minutes: ${response.status}`);
  }
  return response.json();
};


/**
 * Record video watch time
 * @param {Object} data - Video watch data
 * @param {string|number} data.userId - The student's user ID
 * @param {string|number} data.videoId - The video ID
 * @param {number} data.seconds - Seconds watched
 * @returns {Promise<Object>} Response with watch record
 */
export const postVideoWatch = async ({ userId, videoId, seconds }) => {
  const response = await fetch(`${API_BASE}/practice-tracking/video-watch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, videoId, seconds }),
  });

  if (!response.ok) {
    throw new Error(`Failed to record video watch: ${response.status}`);
  }
  return response.json();
};

/**
 * Gets site visit count for admin dashboard
 * @param {string} from - Start date in YYYY-MM-DD format
 * @param {string} to - End date in YYYY-MM-DD format
 * @returns {Promise<Object>} Response with series data
 */
export async function getSiteVisitsCount(from, to) {
  const token = localStorage.getItem("token");
  const params = new URLSearchParams();
  if (from) params.append("from", from);
  if (to) params.append("to", to);
  const url = `${API_BASE}/analytics/visits/count${
    params.toString() ? `?${params.toString()}` : ""
  }`;
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`visits count failed: ${res.status}`);
  return res.json();
}

/**
 * Gets student's average grade for last X exams
 * @param {string|number} userId - The student's user ID
 * @param {number} [limit=3] - Number of exams to average
 * @returns {Promise<Object>} Response with average grade
 */
export async function getStudentAvgLastExams(userId, limit = 3) {
  const token = localStorage.getItem("token");
  const url = `${API_BASE}/analytics/student/${encodeURIComponent(
    userId
  )}/avg-last?limit=${encodeURIComponent(limit)}`;
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `avg last exams failed: ${res.status} ${body || ""}`.trim()
    );
  }
  return res.json();
}

/**
 * Gets students report for admin dashboard
 * @param {Object} params - Query parameters object
 * @param {string|number} [params.courseId] - The course ID
 * @param {string|number} [params.userId] - The student's user ID
 * @param {string} [params.role] - The user role to filter by (e.g., "Examinee")
 * @returns {Promise<Object>} Response with students report data
 */
export async function getStudentsReport({ courseId, userId, role } = {}) {
  const token = localStorage.getItem("token");
  const params = new URLSearchParams();
  if (courseId) params.append("courseId", courseId);
  if (userId) params.append("userId", userId);
  if (role) params.append("role", role);
  const url = `${API_BASE}/analytics/report/students${
    params.toString() ? `?${params.toString()}` : ""
  }`;

  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `students report failed: ${res.status} ${body || ""}`.trim()
    );
  }
  return res.json(); // { count, data: [ { name, userId, avgAll, last3: [s1,s2,s3] } ] }
}

/**
 * Gets topic failure rates for teacher view charts
 * @param {string|number} courseId - The course ID
 * @param {string|number} [from] - The start date of the range, defaults to 30 days ago
 * @param {string|number} [to] - The end date of the range, defaults to today
 * @returns {Promise<Object>} Response with topic failure rates data
 * @example
 * // Get topic failure rates for course 123 from 2020-01-01 to 2020-01-31
 * const response = await getTopicFailureRates({ courseId: 123, from: "2020-01-01", to: "2020-01-31" });
 * console.log(response);
 * // { courseId: "123", from: "2020-01-01", to: "2020-01-31", items: [ { topicId, topicName, total, failed, failureRate } ] }
 */
export async function getTopicFailureRates(courseId, from, to) {
  if (!courseId) throw new Error("courseId is required");
  const token = localStorage.getItem("token");
  const params = new URLSearchParams();
  if (from) params.append("from", from);
  if (to) params.append("to", to);
  const url = `${API_BASE}/analytics/course/${encodeURIComponent(
    courseId
  )}/topic-failures${params.toString() ? `?${params.toString()}` : ""}`;
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `topic failure rates failed: ${res.status} ${body || ""}`.trim()
    );
  }
  return res.json(); // { courseId, from, to, items: [ { topicId, topicName, total, failed, failureRate } ] }
}

/**
 * Gets enhanced site visit statistics
 * If userId provided: returns specific user's name, last visit, and total visits
 * If no userId: returns aggregated stats (total examinees, examinees who visited, percentage)
 * @param {Object} params - Query parameters
 * @param {string} [params.userId] - Optional user ID to filter
 * @param {string} [params.from] - Start date (YYYY-MM-DD)
 * @param {string} [params.to] - End date (YYYY-MM-DD)
 * @returns {Promise<Object>} Response with visit statistics
 */
export async function getSiteVisitStats({ userId, from, to } = {}) {
  const token = localStorage.getItem("token");
  const params = new URLSearchParams();
  if (userId) params.append("userId", userId);
  if (from) params.append("from", from);
  if (to) params.append("to", to);
  
  const url = `${API_BASE}/analytics/visits/stats${
    params.toString() ? `?${params.toString()}` : ""
  }`;

  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `site visit stats failed: ${res.status} ${body || ""}`.trim()
    );
  }
  
  return res.json();
}
