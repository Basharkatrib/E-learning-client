// redux/api/apiSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://e-learning-server-me-production.up.railway.app/api/' }),
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
      query: (email) => ({
        url: 'resend-email-verification-link',
        method: 'POST',
        body: { email },
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
    courseMyProgress: builder.query({
      query: ({ token, courseId }) => ({
        url: `v1/courses/${courseId}/progress`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
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
  useMarkVideoAsWatchedMutation
} = apiSlice;
