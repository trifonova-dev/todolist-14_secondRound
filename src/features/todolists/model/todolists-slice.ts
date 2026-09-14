import { todolistsApi } from "@/features/todolists/api/todolistsApi"
import type { Todolist } from "@/features/todolists/api/todolistsApi.types"
import { createAsyncThunk } from "@reduxjs/toolkit"
import { createAppSlice } from "@/common/utils"
import { setAppStatusAC } from "@/app/app-slice.ts"

export const todolistsSlice = createAppSlice({
  name: "todolists",
  initialState: [] as DomainTodolist[],
  selectors: {
    selectTodolists: (state) => state,
  },
  extraReducers: (builder) => {
    builder.addCase(changeTodolistTitleTC.fulfilled, (state, action) => {
      const index = state.findIndex((todolist) => todolist.id === action.payload.id)
      if (index !== -1) {
        state[index].title = action.payload.title
      }
    })
  },
  reducers: (create) => ({
    fetchTodolistsTC: create.asyncThunk(
      async (_, { rejectWithValue, dispatch }) => {
        try {
          dispatch(setAppStatusAC({ status: "loading" }))
          const res = await todolistsApi.getTodolists()
          dispatch(setAppStatusAC({ status: "succeeded" }))
          return { todolists: res.data }
        } catch (e) {
          dispatch(setAppStatusAC({ status: "failed" }))
          return rejectWithValue(null)
        }
      },
      {
        fulfilled: (state, action) => {
          action.payload?.todolists.forEach((tl) => {
            state.push({ ...tl, filter: "all" })
          })
        },
      },
    ),
    createTodolistTC: create.asyncThunk(
      async (arg: { title: string }, { rejectWithValue, dispatch }) => {
        try {
          dispatch(setAppStatusAC({ status: "loading" }))
          const res = await todolistsApi.createTodolist(arg.title)
          dispatch(setAppStatusAC({ status: "succeeded" }))
          return { todolist: res.data.data.item }
        } catch (e) {
          dispatch(setAppStatusAC({ status: "failed" }))
          return rejectWithValue(null)
        }
      },
      {
        fulfilled: (state, action) => {
          state.unshift({ ...action.payload.todolist, filter: "all" })
        },
      },
    ),
    deleteTodolistTC: create.asyncThunk(
      async (arg: { id: string }, { rejectWithValue, dispatch }) => {
        try {
          dispatch(setAppStatusAC({ status: "loading" }))
          await todolistsApi.deleteTodolist(arg.id)
          dispatch(setAppStatusAC({ status: "succeeded" }))
          return arg
        } catch (e) {
          dispatch(setAppStatusAC({ status: "failed" }))
          return rejectWithValue(null)
        }
      },
      {
        fulfilled: (state, action) => {
          const index = state.findIndex((t) => t.id === action.payload.id)
          if (index !== -1) {
            state.splice(index, 1)
          }
        },
      },
    ),

    changeTodolistFilterAC: create.reducer<{ id: string; filter: FilterValues }>((state, action) => {
      const todolist = state.find((todolist) => todolist.id === action.payload.id)
      if (todolist) {
        todolist.filter = action.payload.filter
      }
    }),
  }),
})

export const changeTodolistTitleTC = createAsyncThunk(
  `${todolistsSlice.name}/changeTodolistTitleTC`,
  async (payload: { id: string; title: string }, thunkAPI) => {
    try {
      await todolistsApi.changeTodolistTitle(payload)
      return payload
    } catch (error) {
      return thunkAPI.rejectWithValue(null)
    }
  },
)

export const { selectTodolists } = todolistsSlice.selectors
export const { changeTodolistFilterAC, fetchTodolistsTC, createTodolistTC, deleteTodolistTC } = todolistsSlice.actions
export const todolistsReducer = todolistsSlice.reducer

export type DomainTodolist = Todolist & {
  filter: FilterValues
}

export type FilterValues = "all" | "active" | "completed"
