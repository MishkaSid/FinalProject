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

  const url = `${API_BASE}/analytics/course/${encodeURIComponent(
    courseId
  )}/grades-over-time${params.toString() ? `?${params.toString()}` : ""}`;

  // אופציונלי: תמיכה גם ב-Bearer אם תרצה
  const token =
    typeof localStorage !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers,
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Failed to fetch course grades over time: ${response.status} ${
        body || ""
      }`.trim()
    );
  }
  return response.json();
};

/**
 * Get practice attempts per day for student analytics
 * @param {string|number} userId - The student's user ID
 * @param {number} days - Number of days to look back (default: 14)
 * @returns {Promise<Object>} Response with series data
 */
export const getPracticePerDay = async (userId, days = 14) => {
  const response = await fetch(
    `${API_BASE}/analytics/student/${userId}/practice-per-day?days=${days}`
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch practice per day: ${response.status}`);
  }
  return response.json();
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
 * Record a practice attempt
 * @param {Object} data - Practice attempt data
 * @param {string|number} data.userId - The student's user ID
 * @param {string|number} data.exerciseId - The exercise ID
 * @param {string} data.selectedAnswer - The student's selected answer
 * @returns {Promise<Object>} Response with attempt result
 */
export const postPracticeAttempt = async ({
  userId,
  exerciseId,
  selectedAnswer,
}) => {
  const response = await fetch(`${API_BASE}/practice-tracking/attempt`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, exerciseId, selectedAnswer }),
  });

  if (!response.ok) {
    throw new Error(`Failed to record practice attempt: ${response.status}`);
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
