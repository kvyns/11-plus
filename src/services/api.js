const AUTH_BASE_URL = 'https://y3hg6ns0xe.execute-api.eu-west-2.amazonaws.com/prod/v1'
const QUIZ_BASE_URL = 'https://6uaslq6fse.execute-api.eu-west-2.amazonaws.com/prod/v1'

function buildUrl(baseUrl, url, params) {
  const search = params ? new URLSearchParams(params).toString() : ''
  if (!search) {
    return `${baseUrl}${url}`
  }

  const separator = url.includes('?') ? '&' : '?'
  return `${baseUrl}${url}${separator}${search}`
}

async function request({ url, method = 'GET', body, headers = {}, baseUrl = AUTH_BASE_URL, params }) {
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData
  const options = {
    method,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
  }

  if (body !== undefined) {
    options.body = isFormData ? body : JSON.stringify(body)
  }

  const response = await fetch(buildUrl(baseUrl, url, params), options)
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.responseMessage || 'Request failed')
  }

  if (data.responseCode === 0 || (data.responseStatus === 'FAILED' && data.responseCode !== 2)) {
    const error = new Error(data.responseMessage || 'Request failed')
    error.responseCode = data.responseCode
    error.responseStatus = data.responseStatus
    error.data = data
    throw error
  }

  return data
}

function getAuthHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function withToken(token, extraHeaders = {}) {
  return {
    ...getAuthHeaders(token),
    ...extraHeaders,
  }
}

export const authApi = {
  register: (payload) => request({ url: '/register', method: 'POST', body: payload, baseUrl: AUTH_BASE_URL }),
  verifyEmail: (payload) => request({ url: '/verifyEmail', method: 'POST', body: payload, baseUrl: AUTH_BASE_URL }),
  validateReferral: (payload) => request({ url: '/validateReferral', method: 'POST', body: payload, baseUrl: AUTH_BASE_URL }),
  login: (payload) => request({ url: '/login', method: 'POST', body: payload, baseUrl: AUTH_BASE_URL }),
  currentUser: (token) => request({ url: '/currentUser', headers: getAuthHeaders(token), baseUrl: AUTH_BASE_URL }),
  updateProfile: (token, payload) => request({ url: '/updateProfile', method: 'POST', body: payload, headers: getAuthHeaders(token), baseUrl: AUTH_BASE_URL }),
  changePassword: (token, payload) => request({ url: '/changePassword', method: 'POST', body: payload, headers: getAuthHeaders(token), baseUrl: AUTH_BASE_URL }),
  generateCode: (payload) => request({ url: '/generateCode', method: 'POST', body: payload, baseUrl: AUTH_BASE_URL }),
  resetPassword: (payload) => request({ url: '/resetPassword', method: 'POST', body: payload, baseUrl: AUTH_BASE_URL }),
  deleteAccount: (token) => request({ url: '/delete/account', headers: getAuthHeaders(token), baseUrl: AUTH_BASE_URL }),
  activateAccount: (payload) => request({ url: '/activate/account', method: 'POST', body: payload, baseUrl: AUTH_BASE_URL }),
  updateProfilePic: (token, payload) => request({ url: '/profile/pic', method: 'POST', body: payload, headers: withToken(token), baseUrl: AUTH_BASE_URL }),
}

export const childApi = {
  checkUniqueUsername: (token, username) => request({ url: `/child/unique?username=${encodeURIComponent(username)}`, headers: getAuthHeaders(token), baseUrl: AUTH_BASE_URL }),
  addChild: (token, payload) => request({ url: '/child/add', method: 'POST', body: payload, headers: getAuthHeaders(token), baseUrl: AUTH_BASE_URL }),
  updateChild: (token, payload) => request({ url: '/child/update', method: 'POST', body: payload, headers: getAuthHeaders(token), baseUrl: AUTH_BASE_URL }),
  archiveChild: (token, payload) => request({ url: '/child/archive', method: 'POST', body: payload, headers: getAuthHeaders(token), baseUrl: AUTH_BASE_URL }),
  removeChild: (token, payload) => request({ url: '/child/remove', method: 'POST', body: payload, headers: getAuthHeaders(token), baseUrl: AUTH_BASE_URL }),
  // Not documented in the API spec (only the parent's own /changePassword is) —
  // this endpoint name is a best guess following the /child/* convention and
  // may need to change once the backend confirms the real path.
  changeChildPassword: (token, payload) => request({ url: '/child/changePassword', method: 'POST', body: payload, headers: getAuthHeaders(token), baseUrl: AUTH_BASE_URL }),
  childLogin: (payload) => request({ url: '/child/login', method: 'POST', body: payload, baseUrl: AUTH_BASE_URL }),
  childLogout: (payload) => request({ url: '/child/logout', method: 'POST', body: payload, baseUrl: AUTH_BASE_URL }),
}

export const quizApi = {
  childDashboard: (token) => request({ url: '/child/dashboard', headers: getAuthHeaders(token), baseUrl: QUIZ_BASE_URL }),
  quizConfig: (token, params = {}) => request({ url: '/quiz/config', params, headers: getAuthHeaders(token), baseUrl: QUIZ_BASE_URL }),
  subjectDashboard: (token, subject) => request({ url: '/subject/dashboard', params: { subject }, headers: getAuthHeaders(token), baseUrl: QUIZ_BASE_URL }),
  categoryDashboard: (token, params = {}) => request({ url: '/category/dashboard', params, headers: getAuthHeaders(token), baseUrl: QUIZ_BASE_URL }),
  generateQuiz: (token, payload) => request({ url: '/quiz/generate', method: 'POST', body: payload, headers: getAuthHeaders(token), baseUrl: QUIZ_BASE_URL }),
  submitQuiz: (token, payload) => request({ url: '/quiz/submit', method: 'POST', body: payload, headers: getAuthHeaders(token), baseUrl: QUIZ_BASE_URL }),
  resumeQuiz: (token, payload) => request({ url: '/quiz/resume', method: 'POST', body: payload, headers: getAuthHeaders(token), baseUrl: QUIZ_BASE_URL }),
  reviewQuiz: (token, payload) => request({ url: '/quiz/review', method: 'POST', body: payload, headers: getAuthHeaders(token), baseUrl: QUIZ_BASE_URL }),
  retryQuiz: (token, payload) => request({ url: '/quiz/retry', method: 'POST', body: payload, headers: getAuthHeaders(token), baseUrl: QUIZ_BASE_URL }),
  getQuestionJson: (token, payload) => request({ url: '/question', method: 'POST', body: payload, headers: getAuthHeaders(token), baseUrl: QUIZ_BASE_URL }),
  quizHistory: (token, payload) => request({ url: '/quiz/history', method: 'POST', body: payload, headers: getAuthHeaders(token), baseUrl: QUIZ_BASE_URL }),
  parentDashboard: (token) => request({ url: '/parent/dashboard', headers: getAuthHeaders(token), baseUrl: QUIZ_BASE_URL }),
  childPerformance: (token, params = {}) => request({ url: '/child/performance', params, headers: getAuthHeaders(token), baseUrl: QUIZ_BASE_URL }),
}

export const purchaseApi = {
  verifyPurchase: (token, payload) => request({ url: '/purchase/verify', method: 'POST', body: payload, headers: getAuthHeaders(token), baseUrl: QUIZ_BASE_URL }),
  verifyMockPurchase: (token, payload) => request({ url: '/mock/purchase/verify', method: 'POST', body: payload, headers: getAuthHeaders(token), baseUrl: QUIZ_BASE_URL }),
  restorePurchase: (token, payload) => request({ url: '/purchase/restore', method: 'POST', body: payload, headers: getAuthHeaders(token), baseUrl: QUIZ_BASE_URL }),
  calculatePrice: (token, payload) => request({ url: '/price/calculate', method: 'POST', body: payload, headers: getAuthHeaders(token), baseUrl: QUIZ_BASE_URL }),
  validateVoucher: (token, payload) => request({ url: '/promotion/validate', method: 'POST', body: payload, headers: getAuthHeaders(token), baseUrl: QUIZ_BASE_URL }),
  stripePayment: (token, payload) => request({ url: '/stripe/payment', method: 'POST', body: payload, headers: getAuthHeaders(token), baseUrl: QUIZ_BASE_URL }),
  subscriptions: (token) => request({ url: '/subscriptions', headers: getAuthHeaders(token), baseUrl: QUIZ_BASE_URL }),
  subscriptionStatus: (token, payload) => request({ url: '/subscription/status', method: 'POST', body: payload, headers: getAuthHeaders(token), baseUrl: QUIZ_BASE_URL }),
}

export const mockApi = {
  listMocks: (token, status = 'upcoming') => request({ url: '/mocks', params: { status }, headers: getAuthHeaders(token), baseUrl: QUIZ_BASE_URL }),
  registerFreeMock: (token, payload) => request({ url: '/mock/register', method: 'POST', body: payload, headers: getAuthHeaders(token), baseUrl: QUIZ_BASE_URL }),
  startMock: (token, payload) => request({ url: '/mock/start', method: 'POST', body: payload, headers: getAuthHeaders(token), baseUrl: QUIZ_BASE_URL }),
  submitMock: (token, payload) => request({ url: '/mock/submit', method: 'POST', body: payload, headers: getAuthHeaders(token), baseUrl: QUIZ_BASE_URL }),
  reviewMock: (token, payload) => request({ url: '/mock/review', method: 'POST', body: payload, headers: getAuthHeaders(token), baseUrl: QUIZ_BASE_URL }),
  mockResult: (token, payload) => request({ url: '/mock/result', method: 'POST', body: payload, headers: getAuthHeaders(token), baseUrl: QUIZ_BASE_URL }),
  mockLeaderboard: (token, payload) => request({ url: '/mock/leaderboard', method: 'POST', body: payload, headers: getAuthHeaders(token), baseUrl: QUIZ_BASE_URL }),
}

export const notificationApi = {
  list: (token, payload = {}) => request({ url: '/notifications', method: 'POST', body: payload, headers: withToken(token), baseUrl: AUTH_BASE_URL }),
  count: (token) => request({ url: '/notification/count', headers: withToken(token), baseUrl: AUTH_BASE_URL }),
  markOne: (token, payload) => request({ url: '/notification/mark', method: 'POST', body: payload, headers: withToken(token), baseUrl: AUTH_BASE_URL }),
  markAll: (token, payload = {}) => request({ url: '/notification/mark/all', method: 'POST', body: payload, headers: withToken(token), baseUrl: AUTH_BASE_URL }),
  registerDeviceToken: (token, payload) => request({ url: '/device/token', method: 'POST', body: payload, headers: withToken(token), baseUrl: AUTH_BASE_URL }),
}

export const mediaBaseUrl = 'https://d1rbn1wov6bp1h.cloudfront.net'
export const buildMediaUrl = (imageKey) => `${mediaBaseUrl}/${imageKey}`
