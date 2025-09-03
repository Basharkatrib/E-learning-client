// redux/api/apiSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://e-learning-server-me-production.up.railway.app/api/' }),
  // baseQuery: fetchBaseQuery({ baseUrl: 'https://e-learning-server.test/api/' }),
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (userData) => ({
        url: 'register',
        method: 'POST',
        body: userData,
      }),
    }),
    login: builder.mutation({
      query: (credentials) => ({
        url: 'login',
        method: 'POST',
        body: credentials,
      }),
    }),
    forgotPassword: builder.mutation({
      query: (data) => ({
        url: 'forgot-password',
        method: 'POST',
        body: data,
      }),
    }),
    resetPassword: builder.mutation({
      query: (data) => ({
        url: 'reset-password',
        method: 'POST',
        body: data,
      }),
    }),
    getCurrentUser: builder.query({
      query: (token) => ({
        url: 'user',
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
   updateProfile: builder.mutation({
  query: ({ token, firstName, lastName, phoneNumber, profileImage, bio, country, specialization }) => {
    const formData = new FormData();

    if (firstName) formData.append("firstName", firstName);
    if (lastName) formData.append("lastName", lastName);
    if (phoneNumber) formData.append("phoneNumber", phoneNumber);
    if (profileImage) formData.append("profile_image", profileImage);
    if (bio) formData.append("bio", bio);
    if (country) formData.append("country", country);
    if (specialization) formData.append("specialization", specialization);

    return {
      url: 'v1/profile',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    };
  },
  transformErrorResponse: (response) => {
    console.error('Update Profile API Error:', response);
    return response;
  },
}),   
addContact: builder.mutation({
  query: (data) => ({
    url: 'v1/contact',
    method: 'POST',
    body: {
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      phone: data.phone,
      subject: data.subject,
      message: data.message,
    },
  }),
}),
    logout: builder.mutation({
      query: (token) => ({
        url: 'logout',
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    resendVerification: builder.mutation({
      query: (data) => ({
        url: 'resend-email-verification-link',
        method: 'POST',
        body: data,
      }),
    }),
    getCategories: builder.query({
      query: () => ({
        url: 'v1/categories',
        method: 'GET',
      }),
    }),
    getCourses: builder.query({
      query: () => ({
        url: 'v1/courses',
        method: 'GET',
        headers: {
          "ngrok-skip-browser-warning": "1",
        }
      }),
    }),
    getTrendingCourses: builder.query({
      query: () => ({
        url: 'v1/courses/trending',
        method: 'GET',
        headers: {
          "ngrok-skip-browser-warning": "1",
        }
      }),
    }),
    getCourse: builder.query({
      query: (id) => ({
        url: `v1/courses/${id}`,
        method: 'GET',
      }),
    }),
    enrollUser: builder.mutation({
      query: ({ id, token }) => ({
        url: `v1/courses/${id}/enroll`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    unenrollUser: builder.mutation({
      query: ({ id, token }) => ({
        url: `v1/courses/${id}/unenroll`,
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      invalidatesTags: ['UserEnrollments'],
    }),
    isEnrolled: builder.mutation({
      query: ({ userId, courseId, token }) => ({
        url: `v1/enrollment/check`,
        method: 'POST',
        body: {
          'user_id': userId,
          'course_id': courseId
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    userEnrollments: builder.query({
      query: ({ id, token }) => ({
        url: `v1/users/${id}/enrollments`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      providesTags: ['UserEnrollments'],
    }),
    courseEnrollments: builder.query({
      query: ({ id, token }) => ({
        url: `v1/courses/${id}/enrollments`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    courseRatings: builder.mutation({
      query: ({ id, token, rating, review }) => ({
        url: `v1/courses/${id}/ratings`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: {
          'rating': rating,
          'review': review
        },
      }),
    }),
    courseRatingsUpdate: builder.mutation({
      query: ({ id, token, ratingId, rating, review }) => ({
        url: `v1/courses/${id}/ratings/${ratingId}`,
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: {
          'rating': rating,
          'review': review
        },
      }),
    }),
    courseRatingsDelete: builder.mutation({
      query: ({ token, courseId, ratingId }) => ({
        url: `v1/courses/${courseId}/ratings/${ratingId}`,
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    courseMyRating: builder.query({
      query: ({ token, courseId }) => ({
        url: `v1/courses/${courseId}/my-rating`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
        checkPaymentStatus: builder.query({
      query: ({ token, courseId }) => ({
        url: `v1/courses/${courseId}/payment-status`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    courseMyProgress: builder.query({
      query: ({ token, courseId }) => ({
        url: `v1/courses/${courseId}/progress`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      // Transform response to standardized format
      transformResponse: (response) => ({
        courseId: response.courseId,
        progress: response.progress,
        videosCompleted: response.videosCompleted,
        completedAt: response.completedAt,
        canTakeQuiz: response.canTakeQuiz
      }),
      // Provide tags for cache invalidation
      providesTags: (result, error, { courseId }) => [
        { type: 'CourseProgress', id: courseId }
      ],
      // Skip if no token or courseId
      skip: (arg) => !arg?.token || !arg?.courseId,
    }),
    courseMyProgressUpdate: builder.mutation({
      query: ({ token, courseId, progress, videosCompleted }) => ({
        url: `v1/courses/${courseId}/progress`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: {
          progress,
          videos_completed: videosCompleted,
        },
      }),
      // Invalidate relevant queries after mutation
      invalidatesTags: (result, error, { courseId }) => [
        { type: 'CourseProgress', id: courseId },
        'UserEnrollments'
      ],
      // Transform the response
      transformResponse: (response) => {
        return {
          courseId: response.courseId,
          progress: response.progress,
          videosCompleted: response.videosCompleted,
          completedAt: response.completedAt,
          canTakeQuiz: response.canTakeQuiz
        };
      },
      // Handle errors
      transformErrorResponse: (response) => {
        return {
          status: response.status,
          message: response?.data?.message || 'Failed to update progress'
        };
      }
    }),
    getWatchedVideos: builder.query({
      query: (token) => ({
        url: 'v1/user/watched-videos',
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    
    markVideoAsWatched: builder.mutation({
      query: ({ token, videoId }) => ({
        url: `v1/videos/${videoId}/watch`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),

    // Quiz endpoints
    getQuizzes: builder.query({
      query: ({ courseId, token }) => ({
        url: `v1/courses/${courseId}/quiz`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      providesTags: (result, error, { courseId }) => [
        { type: 'Quiz', id: courseId }
      ]
    }),

    getQuiz: builder.query({
      query: ({ courseId, token }) => ({
        url: `v1/courses/${courseId}/quiz`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      transformResponse: (response) => {
        console.log('Quiz API Response:', response);
        if (!response) return [];
        return Array.isArray(response) ? response : response.data || [];
      },
      transformErrorResponse: (response) => {
        console.error('Quiz API Error:', response);
        if (!response) {
          return {
            status: 500,
            message: 'Failed to fetch quiz'
          };
        }
        return {
          status: response.status,
          message: response?.data?.message || 'Failed to fetch quiz'
        };
      },
      providesTags: (result, error, { courseId }) => [
        { type: 'Quiz', id: courseId }
      ]
    }),
    checkQuizAttempt: builder.query({
      query: ({ courseId, quizId, token }) => ({
        url: `v1/courses/${courseId}/quizzes/${quizId}/attempt-status`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      transformResponse: (response) => ({
        hasAttempted: response.has_attempted,
        latestAttempt: response.latest_attempt,
      }),
    }),
    // Get quiz attempt history
    getQuizAttempts: builder.query({
      query: ({ courseId, quizId, token }) => ({
        url: `v1/courses/${courseId}/quiz/${quizId}/attempts`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      providesTags: (result, error, { courseId, quizId }) => [
        { type: 'QuizAttempts', id: `${courseId}-${quizId}` }
      ]
    }),

    // Get latest quiz attempt result
    getLatestQuizAttempt: builder.query({
      query: ({ courseId, quizId, token }) => ({
        url: `v1/courses/${courseId}/quiz/${quizId}/latest-attempt`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      providesTags: (result, error, { courseId, quizId }) => [
        { type: 'QuizAttempt', id: `${courseId}-${quizId}` }
      ]
    }),

    // Submit quiz attempt
    submitQuiz: builder.mutation({
      query: ({ courseId, quizId, answers, token }) => ({
        url: `v1/courses/${courseId}/quiz/${quizId}/submit`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: { answers },
      }),
      invalidatesTags: (result, error, { courseId, quizId }) => [
        { type: 'QuizAttempts', id: `${courseId}-${quizId}` },
        { type: 'QuizAttempt', id: `${courseId}-${quizId}` }
      ]
    }),
    
    submitQuizAttempt: builder.mutation({
      query: ({ token, quizId, answers, score }) => ({
        url: `v1/quizzes/${quizId}/submit`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: {
          answers,
          score,
          completed_at: new Date().toISOString(),
        },
      }),
    }),
    getQuizResults: builder.mutation({
      query: ({ attemptId, token }) => ({
        url: `v1/quiz-attempts/${attemptId}/results`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    getCertificate: builder.mutation({
      query: ({ token, courseId, quizId }) => ({
        url: `v1/courses/${courseId}/certificate`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept': 'application/pdf',
        },
        body: {
          quiz_id: quizId
        }
      }),
    }),
    
    // Saved Courses endpoints
    getSavedCourses: builder.query({
      query: (token) => ({
        url: 'v1/saved-courses',
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      providesTags: ['SavedCourses']
    }),
    
    saveCourse: builder.mutation({
      query: ({courseId, token}) => ({
        url: `v1/saved-courses/${courseId}`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      invalidatesTags: ['SavedCourses']
    }),
    
    unsaveCourse: builder.mutation({
      query: ({courseId, token}) => ({
        url: `v1/saved-courses/${courseId}`,
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      invalidatesTags: ['SavedCourses']
    }),
    
    checkSavedCourse: builder.mutation({
      query: ({courseId, token}) => ({
        url: `v1/saved-courses/${courseId}/check`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      invalidatesTags: ['SavedCourses']
    }),

    // Notes endpoints
    getNotes: builder.query({
      query: ({ token, courseId }) => ({
        url: `v1/notes?course_id=${courseId}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      providesTags: ['Notes'],
    }),

    createNote: builder.mutation({
      query: ({ token, data }) => ({
        url: 'v1/notes',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      }),
      invalidatesTags: ['Notes'],
    }),

    updateNote: builder.mutation({
      query: ({ token, noteId, data }) => ({
        url: `v1/notes/${noteId}`,
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      }),
      invalidatesTags: ['Notes'],
    }),

    deleteNote: builder.mutation({
      query: ({ token, noteId }) => ({
        url: `v1/notes/${noteId}`,
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      invalidatesTags: ['Notes'],
    }),

    googleLogin: builder.mutation({
        query: () => ({
            url: '/auth/google',
            method: 'GET',
            headers: {
                "ngrok-skip-browser-warning": "1",
            }
        }),
    }),
    removeProfileImage:builder.mutation({
    query: (token) => ({
    url: 'v1/profile/image',
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }),
    }),
    checkPaymentStatus: builder.query({
      query: ({ token, courseId }) => ({
        url: `v1/courses/${courseId}/payment-status`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),

  }),
});

export const {
  useGetCategoriesQuery,
  useRegisterMutation,
  useLoginMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetCurrentUserQuery,
  useLogoutMutation,
  useResendVerificationMutation,
  useGetCoursesQuery,
  useGetCourseQuery,
  useEnrollUserMutation,
  useUnenrollUserMutation,
  useUserEnrollmentsQuery,
  useIsEnrolledMutation,
  useCourseEnrollmentsQuery,
  useCourseRatingsMutation,
  useCourseRatingsUpdateMutation,
  useCourseRatingsDeleteMutation,
  useCourseMyRatingQuery,
  useCourseMyProgressQuery,
  useCourseMyProgressUpdateMutation,
  useGetWatchedVideosQuery,
  useMarkVideoAsWatchedMutation,
  useUpdateProfileMutation,
  useGetQuizzesQuery,
  useGetQuizQuery,
  useSubmitQuizMutation,
  useGetLatestQuizAttemptQuery,
  useCheckQuizAttemptQuery,
  useGetTrendingCoursesQuery,
  useGetSavedCoursesQuery,
  useSaveCourseMutation,
  useUnsaveCourseMutation,
  useCheckSavedCourseMutation,
  useGetNotesQuery,
  useCreateNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
  useAddContactMutation,
  useSubmitQuizAttemptMutation,
  useGetCertificateMutation,
  useGoogleLoginMutation,
  useGetQuizResultsMutation,
  useCheckPaymentStatusQuery,
  useRemoveProfileImageMutation,
} = apiSlice;