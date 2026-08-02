import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface Profile {
  bio?: string
  avatarUrl?: string
}

interface Notification {
  id: string
  message: string
  read: boolean
}

interface UserState {
  profile: Profile | null
  notifications: Notification[]
}

const initialState: UserState = {
  profile: null,
  notifications: [],
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfile(state, action: PayloadAction<Profile>) {
      state.profile = action.payload
    },
    addNotification(state, action: PayloadAction<Notification>) {
      state.notifications.push(action.payload)
    },
    markNotificationRead(state, action: PayloadAction<string>) {
      const notification = state.notifications.find(
        (item) => item.id === action.payload,
      )
      if (notification) notification.read = true
    },
  },
})

export const { setProfile, addNotification, markNotificationRead } =
  userSlice.actions
export default userSlice.reducer
