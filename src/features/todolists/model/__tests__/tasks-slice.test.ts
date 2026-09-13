import { beforeEach, expect, test } from "vitest"
import {
  changeTaskStatusAC,
  changeTaskTitleAC,
  createTaskAC,
  createTaskTC,
  deleteTaskAC,
  deleteTaskTC,
  tasksReducer,
  tasksSlice,
  type TasksState,
  updateTaskTC,
} from "../tasks-slice"
import { createTodolistAC, deleteTodolistAC } from "../todolists-slice"
import { TaskPriority, TaskStatus } from "@/common/enums"
import { UpdateTaskModel } from "@/features/todolists/api/tasksApi.types.ts"

let startState: TasksState = {}

const taskDefaultValues = {
  description: "",
  deadline: "",
  addedDate: "",
  startDate: "",
  priority: TaskPriority.Low,
  order: 0,
}

beforeEach(() => {
  startState = {
    todolistId1: [
      {
        id: "1",
        title: "CSS",
        status: TaskStatus.New,
        todoListId: "todolistId1",
        ...taskDefaultValues,
      },
      {
        id: "2",
        title: "JS",
        status: TaskStatus.Completed,
        todoListId: "todolistId1",
        ...taskDefaultValues,
      },
      {
        id: "3",
        title: "React",
        status: TaskStatus.New,
        todoListId: "todolistId1",
        ...taskDefaultValues,
      },
    ],
    todolistId2: [
      {
        id: "1",
        title: "bread",
        status: TaskStatus.New,
        todoListId: "todolistId2",
        ...taskDefaultValues,
      },
      {
        id: "2",
        title: "milk",
        status: TaskStatus.Completed,
        todoListId: "todolistId2",
        ...taskDefaultValues,
      },
      {
        id: "3",
        title: "tea",
        status: TaskStatus.New,
        todoListId: "todolistId2",
        ...taskDefaultValues,
      },
    ],
  }
})

test("correct task should be deleted", () => {
  const endState = tasksReducer(
    startState,
    deleteTaskTC.fulfilled({ todolistId: "todolistId2", taskId: "2" }, "requestId", {
      todolistId: "todolistId2",
      taskId: "2",
    }),
  )

  expect(endState.todolistId2.length).toBe(2)
  expect(endState.todolistId1.length).toBe(3)
})

test("correct task should be created at correct array", () => {
  const newTask = {
    id: "4",
    title: "new task",
    status: TaskStatus.New,
    todoListId: "todolistId1",
    ...taskDefaultValues,
  }
  const endState = tasksReducer(
    startState,
    createTaskTC.fulfilled({ task: newTask }, "requestId", { todolistId: "todolistId1", title: "new task" }),
  )

  expect(endState.todolistId1.length).toBe(4)
  expect(endState.todolistId2.length).toBe(3)
  expect(endState.todolistId1[0].id).toBeDefined()
  expect(endState.todolistId1[0].title).toBe("new task")
  expect(endState.todolistId1[0].status).toBe(TaskStatus.New)
})

test("correct task should change its status", () => {
  const updateTask = {
    id: "1",
    title: "CSS",
    status: TaskStatus.Completed,
    todoListId: "todolistId1",
    ...taskDefaultValues,
  }
  const endState = tasksReducer(
    startState,
    updateTaskTC.fulfilled({ task: updateTask, todolistId: "todolistId1" }, "requestId", {
      todolistId: "todolistId1",
      taskId: "1",
      domainModel: { status: TaskStatus.Completed },
    }),
  )

  expect(endState.todolistId2[0].status).toBe(TaskStatus.New)
  expect(endState.todolistId1[0].status).toBe(TaskStatus.Completed)
})

test("correct task should change its title", () => {
  const endState = tasksSlice(
    startState,
    changeTaskTitleAC({ todolistId: "todolistId2", taskId: "2", title: "coffee" }),
  )

  expect(endState.todolistId2[1].title).toBe("coffee")
  expect(endState.todolistId1[1].title).toBe("JS")
})

test("array should be created for new todolist", () => {
  const endState = tasksSlice(startState, createTodolistAC("New todolist"))

  const keys = Object.keys(endState)
  const newKey = keys.find((k) => k !== "todolistId1" && k !== "todolistId2")
  if (!newKey) {
    throw Error("New key should be added")
  }

  expect(keys.length).toBe(3)
  expect(endState[newKey]).toEqual([])
})

test("property with todolistId should be deleted", () => {
  const endState = tasksSlice(startState, deleteTodolistAC({ id: "todolistId2" }))

  const keys = Object.keys(endState)

  expect(keys.length).toBe(1)
  expect(endState["todolistId2"]).not.toBeDefined()
  // or
  expect(endState["todolistId2"]).toBeUndefined()
})
