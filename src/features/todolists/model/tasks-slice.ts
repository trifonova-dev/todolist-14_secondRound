import { createTodolistTC, deleteTodolistTC } from "./todolists-slice"
import { createAppSlice } from "@/common/utils"
import { tasksApi } from "@/features/todolists/api/tasksApi.ts"
import { DomainTask } from "@/features/todolists/api/tasksApi.types.ts"
import { TaskStatus } from "@/common/enums"

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
        delete state[action.payload.id]
      })
  },
  reducers: (create) => ({
    deleteTaskTC: create.asyncThunk(
      async (arg: { todolistId: string; taskId: string }, { rejectWithValue }) => {
        try {
          await tasksApi.deleteTask(arg)
          return arg
        } catch (e) {
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
    createTaskTC: create.asyncThunk(
      async (arg: { todolistId: string; title: string }, { rejectWithValue }) => {
        try {
          const res = await tasksApi.createTask(arg)
          return { task: res.data.data.item }
        } catch (e) {
          return rejectWithValue(null)
        }
      },
      {
        fulfilled: (state, action) => {
          state[action.payload.task.todoListId].unshift(action.payload.task)
        },
      },
    ),
    fetchTasksTC: create.asyncThunk(
      async (todolistId: string, { rejectWithValue }) => {
        try {
          const res = await tasksApi.getTasks(todolistId)
          return { todolistId, tasks: res.data.items }
        } catch (e) {
          return rejectWithValue(null)
        }
      },
      {
        fulfilled: (state, action) => {
          state[action.payload.todolistId] = action.payload.tasks
        },
      },
    ),
    changeTaskStatusAC: create.reducer<{ todolistId: string; taskId: string; isDone: boolean }>((state, action) => {
      const task = state[action.payload.todolistId].find((task) => task.id === action.payload.taskId)
      if (task) {
        task.status = action.payload.isDone ? TaskStatus.Completed : TaskStatus.New
      }
    }),
    changeTaskTitleAC: create.reducer<{ todolistId: string; taskId: string; title: string }>((state, action) => {
      const task = state[action.payload.todolistId].find((task) => task.id === action.payload.taskId)
      if (task) {
        task.title = action.payload.title
      }
    }),
  }),
})

export const { selectTasks } = tasksSlice.selectors
export const { changeTaskStatusAC, changeTaskTitleAC, fetchTasksTC, createTaskTC, deleteTaskTC } = tasksSlice.actions
export const tasksReducer = tasksSlice.reducer
