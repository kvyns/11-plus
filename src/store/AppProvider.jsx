import { useState } from 'react'
import { AppContext } from './appStore.jsx'
import { authApi, childApi, mockApi, notificationApi, purchaseApi, quizApi } from '../services/api.js'

const PARENT_TOKEN_KEY = 'eleven_plus_parent_token'
const CHILD_TOKEN_KEY = 'eleven_plus_child_token'
const USER_KEY = 'eleven_plus_user'
const ACCOUNT_TYPE_KEY = 'eleven_plus_account_type'

function readStorage(key, fallback = null) {
  try {
    const value = localStorage.getItem(key)
    return value ?? fallback
  } catch {
    return fallback
  }
}

function readJsonStorage(key, fallback = null) {
  const raw = readStorage(key)
  if (!raw) {
    return fallback
  }

  try {
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function writeStorage(key, value) {
  try {
    if (value === null || value === undefined || value === '') {
      localStorage.removeItem(key)
      return
    }

    localStorage.setItem(key, value)
  } catch {
    // Ignore storage failures in private/incognito browsers.
  }
}

function writeJsonStorage(key, value) {
  try {
    if (value === null || value === undefined) {
      localStorage.removeItem(key)
      return
    }

    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore storage failures in private/incognito browsers.
  }
}

function extractToken(payload) {
  if (!payload || typeof payload !== 'object') {
    return null
  }

  return (
    payload.token ||
    payload.accessToken ||
    payload.idToken ||
    payload.authToken ||
    payload.jwt ||
    payload.result?.token ||
    payload.result?.accessToken ||
    payload.data?.token ||
    null
  )
}

function normalizeMobileToE164(value) {
  if (!value) {
    return ''
  }

  const digits = String(value).replace(/\D/g, '')
  if (!digits) {
    return ''
  }

  if (digits.startsWith('44')) {
    return `+${digits}`
  }

  if (digits.startsWith('0')) {
    return `+44${digits.slice(1)}`
  }

  return `+44${digits}`
}

export function AppProvider({ children }) {
  const [currentPage, setCurrentPage] = useState('landing')
  const [authToken, setAuthToken] = useState(() => readStorage(PARENT_TOKEN_KEY, ''))
  const [childToken, setChildToken] = useState(() => readStorage(CHILD_TOKEN_KEY, ''))
  const [accountType, setAccountType] = useState(() => readStorage(ACCOUNT_TYPE_KEY, 'parent'))
  const [user, setUserState] = useState(() => readJsonStorage(USER_KEY, null))

  const isLoggedIn = Boolean(authToken || childToken)

  const setUser = (nextUser) => {
    setUserState(nextUser)
    writeJsonStorage(USER_KEY, nextUser)
  }

  const setIsLoggedIn = (value) => {
    if (!value) {
      setAuthToken('')
      setChildToken('')
      writeStorage(PARENT_TOKEN_KEY, '')
      writeStorage(CHILD_TOKEN_KEY, '')
      writeStorage(ACCOUNT_TYPE_KEY, '')
    }
  }

  const setParentSession = (token, userPayload = null) => {
    setAuthToken(token || '')
    setChildToken('')
    setAccountType('parent')
    writeStorage(PARENT_TOKEN_KEY, token || '')
    writeStorage(CHILD_TOKEN_KEY, '')
    writeStorage(ACCOUNT_TYPE_KEY, 'parent')
    if (userPayload) {
      setUser(userPayload)
    }
  }

  const setChildSession = (token, userPayload = null) => {
    setChildToken(token || '')
    setAuthToken('')
    setAccountType('child')
    writeStorage(CHILD_TOKEN_KEY, token || '')
    writeStorage(PARENT_TOKEN_KEY, '')
    writeStorage(ACCOUNT_TYPE_KEY, 'child')
    if (userPayload) {
      setUser(userPayload)
    }
  }

  const refreshCurrentUser = async (tokenOverride) => {
    const token = tokenOverride || authToken
    if (!token) {
      return null
    }

    const response = await authApi.currentUser(token)
    const fetchedUser = response.user || response.result || response.data || null
    if (fetchedUser) {
      setUser(fetchedUser)
    }

    return response
  }

  const loginParent = async (payload) => {
    const response = await authApi.login(payload)
    if (response.responseCode === 2) {
      const error = new Error(response.responseMessage || 'Please verify your email before logging in.')
      error.responseCode = 2
      error.data = response
      throw error
    }

    const token = extractToken(response)
    if (!token) {
      throw new Error(response.responseMessage || 'Login succeeded but no token was returned')
    }

    setParentSession(token)
    await refreshCurrentUser(token).catch(() => null)
    return response
  }

  const registerParent = async (payload) => {
    const response = await authApi.register({
      ...payload,
      mobileNumber: normalizeMobileToE164(payload.mobileNumber || payload.mobile || ''),
    })

    const token = extractToken(response)
    if (token) {
      setParentSession(token)
      await refreshCurrentUser(token).catch(() => null)
    }

    return response
  }

  const loginChild = async (payload) => {
    const response = await childApi.childLogin(payload)
    const token = extractToken(response)
    if (!token) {
      throw new Error(response.responseMessage || 'Child login succeeded but no token was returned')
    }

    const childUser = {
      username: payload.username,
      ...(response.child || response.user || response.result || {}),
      childID: response.childID || response.child?.childID || response.result?.childID,
      sessionID: response.sessionID || response.child?.sessionID || response.result?.sessionID,
    }
    setChildSession(token, childUser)
    return response
  }

  const updateProfile = async (payload) => {
    if (!authToken) {
      throw new Error('You need to login first')
    }

    const normalizedPayload = {
      ...payload,
      mobileNumber: normalizeMobileToE164(payload.mobileNumber || payload.mobile || ''),
    }
    const response = await authApi.updateProfile(authToken, normalizedPayload)
    await refreshCurrentUser().catch(() => null)
    return response
  }

  const uploadProfilePic = async (file, extra = {}) => {
    if (!authToken) {
      throw new Error('You need to login first')
    }

    const response = await authApi.updateProfilePic(authToken, {
      userID: user?.email,
      parent: true,
      fileName: file.name,
      fileType: file.type,
      ...extra,
    })

    const uploadUrl = response.uploadUrl || response.result?.uploadUrl || response.data?.uploadUrl
    if (!uploadUrl) {
      throw new Error('Unable to start image upload right now.')
    }

    const putResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    })

    if (!putResponse.ok) {
      throw new Error('Image upload failed. Please try again.')
    }

    // The presigned URL's path *is* the S3 object key — the API doesn't
    // separately return one, so this is the only reliable way to know it.
    const imageKey = new URL(uploadUrl).pathname.replace(/^\//, '')
    setUser({ ...user, profilePic: imageKey })
    return imageKey
  }

  const deleteAccount = async () => {
    if (!authToken) {
      throw new Error('You need to login first')
    }

    const response = await authApi.deleteAccount(authToken)
    logout()
    return response
  }

  const api = {
    auth: {
      register: registerParent,
      verifyEmail: authApi.verifyEmail,
      validateReferral: authApi.validateReferral,
      login: loginParent,
      currentUser: refreshCurrentUser,
      updateProfile,
      changePassword: (payload) => {
        if (!authToken) {
          throw new Error('You need to login first')
        }
        return authApi.changePassword(authToken, payload)
      },
      generateCode: authApi.generateCode,
      resetPassword: authApi.resetPassword,
      deleteAccount,
      activateAccount: authApi.activateAccount,
      updateProfilePic: (payload) => authApi.updateProfilePic(authToken, payload),
      uploadProfilePic,
    },
    child: {
      checkUniqueUsername: (username) => childApi.checkUniqueUsername(authToken, username),
      addChild: (payload) => childApi.addChild(authToken, payload),
      updateChild: (payload) => childApi.updateChild(authToken, payload),
      archiveChild: (payload) => childApi.archiveChild(authToken, payload),
      removeChild: (payload) => childApi.removeChild(authToken, { ...payload, confirmed: true }),
      changeChildPassword: (payload) => childApi.changeChildPassword(authToken, payload),
      childLogin: loginChild,
      childLogout: (payload) => childApi.childLogout(payload),
    },
    quiz: {
      childDashboard: () => quizApi.childDashboard(childToken || authToken),
      quizConfig: (params) => quizApi.quizConfig(childToken || authToken, params),
      subjectDashboard: (subject) => quizApi.subjectDashboard(childToken || authToken, subject),
      categoryDashboard: (params) => quizApi.categoryDashboard(childToken || authToken, params),
      generateQuiz: (payload) => quizApi.generateQuiz(childToken || authToken, payload),
      submitQuiz: (payload) => quizApi.submitQuiz(childToken || authToken, payload),
      resumeQuiz: (payload) => quizApi.resumeQuiz(childToken || authToken, payload),
      reviewQuiz: (payload) => quizApi.reviewQuiz(childToken || authToken, payload),
      retryQuiz: (payload) => quizApi.retryQuiz(childToken || authToken, payload),
      getQuestionJson: (payload) => quizApi.getQuestionJson(childToken || authToken, payload),
      quizHistory: (payload) => quizApi.quizHistory(childToken || authToken, payload),
      parentDashboard: () => quizApi.parentDashboard(authToken),
      childPerformance: (params) => quizApi.childPerformance(childToken || authToken, params),
    },
    purchase: {
      verifyPurchase: (payload) => purchaseApi.verifyPurchase(authToken, payload),
      verifyMockPurchase: (payload) => purchaseApi.verifyMockPurchase(authToken, payload),
      restorePurchase: (payload) => purchaseApi.restorePurchase(authToken, payload),
      calculatePrice: (payload) => purchaseApi.calculatePrice(authToken, payload),
      validateVoucher: (payload) => purchaseApi.validateVoucher(authToken, payload),
      stripePayment: (payload) => purchaseApi.stripePayment(authToken, payload),
      subscriptions: () => purchaseApi.subscriptions(authToken),
      subscriptionStatus: (payload) => purchaseApi.subscriptionStatus(authToken, payload),
    },
    mock: {
      listMocks: (status) => mockApi.listMocks(authToken || childToken, status),
      registerFreeMock: (payload) => mockApi.registerFreeMock(authToken || childToken, payload),
      startMock: (payload) => mockApi.startMock(authToken || childToken, payload),
      submitMock: (payload) => mockApi.submitMock(authToken || childToken, payload),
      reviewMock: (payload) => mockApi.reviewMock(authToken || childToken, payload),
      mockResult: (payload) => mockApi.mockResult(authToken || childToken, payload),
      mockLeaderboard: (payload) => mockApi.mockLeaderboard(authToken || childToken, payload),
    },
    notifications: {
      list: (payload) => notificationApi.list(authToken, payload),
      count: () => notificationApi.count(authToken),
      markOne: (payload) => notificationApi.markOne(authToken, payload),
      markAll: (payload) => notificationApi.markAll(authToken, payload),
      registerDeviceToken: (payload) => notificationApi.registerDeviceToken(authToken, payload),
    },
  }

  const logout = () => {
    if (childToken && user?.childID && user?.sessionID) {
      childApi.childLogout({ childID: user.childID, sessionID: user.sessionID }).catch(() => null)
    }

    setAuthToken('')
    setChildToken('')
    setAccountType('parent')
    setIsLoggedIn(false)
    setUserState(null)
    writeStorage(PARENT_TOKEN_KEY, '')
    writeStorage(CHILD_TOKEN_KEY, '')
    writeStorage(ACCOUNT_TYPE_KEY, '')
    writeJsonStorage(USER_KEY, null)
    setCurrentPage('landing')
  }

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        isLoggedIn,
        setIsLoggedIn,
        user,
        setUser,
        authToken,
        childToken,
        accountType,
        loginParent,
        registerParent,
        loginChild,
        refreshCurrentUser,
        updateProfile,
        deleteAccount,
        api,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
