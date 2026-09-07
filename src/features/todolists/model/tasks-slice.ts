import { createTodolistTC, deleteTodolistTC } from "./todolists-slice"
import { createAppSlice } from "@/common/utils"
import { tasksApi } from "@/features/todolists/api/tasksApi.ts"
import { DomainTask, UpdateTaskModel } from "@/features/todolists/api/tasksApi.types.ts"
import { RootState } from "@/app/store.ts"
import { setAppStatusAC } from "@/app/app-slice.ts"

export type TasksState = Record<string, DomainTask[]>

export const tasksSlice = createAppSlice({
  name: "tasks",
  initialState: {} as TasksState,
  selectors: {
    selectTasks: (state) => state,
  },
  extraReducers: (builder) => {
    builder
      .addCase(createTodolistTC.fulfilled, (state, action) => {
        state[action.payload.todolist.id] = []
      })
      .addCase(deleteTodolistTC.fulfilled, (state, action) => {
        delete state[action.payload.todolistId]
      })
  },
  reducers: (create) => ({
    fetchTasksTC: create.asyncThunk(
      async (arg: { todolistId: string }, { rejectWithValue, dispatch }) => {
        try {
          dispatch(setAppStatusAC({ status: "loading" }))
          const res = await tasksApi.getTasks(arg.todolistId)
          dispatch(setAppStatusAC({ status: "succeeded" }))
          return { tasks: res.data.items, todolistId: arg.todolistId }
        } catch (e) {
          dispatch(setAppStatusAC({ status: "failed" }))
          return rejectWithValue(null)
        }
      },
      {
        fulfilled: (state, action) => {
          state[action.payload.todolistId] = action.payload.tasks
        },
      },
    ),
    createTaskTC: create.asyncThunk(
      async (arg: { todolistId: string; title: string }, { rejectWithValue, dispatch }) => {
        try {
          dispatch(setAppStatusAC({ status: "loading" }))
          const res = await tasksApi.createTask(arg)
          dispatch(setAppStatusAC({ status: "succeeded" }))
          return { task: res.data.data.item }
        } catch (e) {
          dispatch(setAppStatusAC({ status: "failed" }))
          return rejectWithValue(null)
        }
      },
      {
        fulfilled: (state, action) => {
          state[action.payload.task.todoListId].unshift(action.payload.task)
        },
      },
    ),
    deleteTaskTC: create.asyncThunk(
      async (arg: { todolistId: string; taskId: string }, { rejectWithValue, dispatch }) => {
        try {
          dispatch(setAppStatusAC({ status: "loading" }))
          await tasksApi.deleteTask(arg)
          dispatch(setAppStatusAC({ status: "succeeded" }))
          return arg
        } catch (e) {
          dispatch(setAppStatusAC({ status: "failed" }))
          return rejectWithValue(null)
        }
      },
      {
        fulfilled: (state, action) => {
          const tasks = state[action.payload.todolistId]
          const index = tasks.findIndex((task) => task.id === action.payload.taskId)
          if (index !== -1) {
            tasks.splice(index, 1)
          }
        },
      },
    ),
    updateTask: create.asyncThunk(
      async (
        arg: { todolistId: string; taskId: string; domainModel: Partial<UpdateTaskModel> },
        { rejectWithValue, getState, dispatch },
      ) => {
        const { todolistId, taskId, domainModel } = arg
        const tasks = (getState() as RootState).tasks[todolistId]
        const updatedTask = tasks.find((task) => task.id === taskId)
        if (!updatedTask) {
          return rejectWithValue(null)
        }

        try {
          dispatch(setAppStatusAC({ status: "loading" }))
          const res = await tasksApi.updateTask(arg)
          dispatch(setAppStatusAC({ status: "succeeded" }))
          return { task: res.data.data.item, todolistId, taskId, domainModel }
        } catch (e) {
          dispatch(setAppStatusAC({ status: "failed" }))
          return rejectWithValue(null)
        }
      },
      {
        fulfilled: (state, action) => {
          const { todolistId, domainModel, taskId } = action.payload
          const index = state[todolistId].findIndex((task) => task.id === taskId)
          if (index !== -1) {
            state[todolistId][index] = { ...state[todolistId][index], ...domainModel }
          }
        },
      },
    ),
  }),
})

export const { selectTasks } = tasksSlice.selectors
export const { deleteTaskTC, createTaskTC, fetchTasksTC, updateTask } = tasksSlice.actions
export const tasksReducer = tasksSlice.reducer
