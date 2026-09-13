import { createAppSlice } from "@/common/utils"
import { todolistsApi } from "@/features/todolists/api/todolistsApi"
import type { Todolist } from "@/features/todolists/api/todolistsApi.types"
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
      async (arg: { title: string }, { rejectWithValue }) => {
        try {
          const res = await todolistsApi.createTodolist(arg.title)
          return { todolist: res.data.data }
        } catch (e) {
          return rejectWithValue(null)
        }
      },
      {
        fulfilled: (state, action) => {
          state.unshift({ ...action.payload.todolist.item, filter: "all", addedDate: "", order: 0 })
        },
      },
    ),
    deleteTodolistTC: create.asyncThunk(
      async (arg: { todolistId: string }, { rejectWithValue }) => {
        try {
          await todolistsApi.deleteTodolist(arg.todolistId)
          return arg
        } catch (e) {
          return rejectWithValue(null)
        }
      },
      {
        fulfilled: (state, action) => {
          const index = state.findIndex((todolist) => todolist.id === action.payload.todolistId)
          if (index !== -1) {
            state.splice(index, 1)
          }
        },
      },
    ),
    changeTodolistTitleTC: create.asyncThunk(
      async (arg: { id: string; title: string }, { rejectWithValue }) => {
        try {
          await todolistsApi.changeTodolistTitle(arg)
          return arg
        } catch (e) {
          return rejectWithValue(null)
        }
      },
      {
        fulfilled: (state, action) => {
          const index = state.findIndex((todolist) => todolist.id === action.payload.id)
          if (index !== -1) {
            state[index].title = action.payload.title
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

export const { selectTodolists } = todolistsSlice.selectors
export const { changeTodolistFilterAC, fetchTodolistsTC, createTodolistTC, deleteTodolistTC, changeTodolistTitleTC } =
  todolistsSlice.actions
export const todolistsReducer = todolistsSlice.reducer

export type DomainTodolist = Todolist & {
  filter: FilterValues
}

export type FilterValues = "all" | "active" | "completed"
