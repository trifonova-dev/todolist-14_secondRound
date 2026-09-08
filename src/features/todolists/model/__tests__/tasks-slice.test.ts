import { beforeEach, expect, test } from "vitest"
import { createTaskTC, deleteTaskTC, tasksReducer, tasksSlice, type TasksState, updateTask } from "../tasks-slice"
import { createTodolistAC, createTodolistTC, deleteTodolistAC } from "../todolists-slice"
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
    deleteTaskTC.fulfilled({ todolistId: "todolistId2", taskId: "2" }, "reqestId", {
      todolistId: "todolistId2",
      taskId: "2",
    }),
  )

  expect(endState.todolistId1.length).toBe(3)
  expect(endState.todolistId2.length).toBe(2)
})

test("correct task should be created at correct array", () => {
  const NewTask = {
    description: "",
    title: "NewTitle",
    status: TaskStatus.New,
    priority: TaskPriority.Low,
    startDate: "",
    deadline: "",
    id: "00",
    todoListId: "todolistId2",
    order: 0,
    addedDate: "",
  }
  const endState = tasksReducer(
    startState,
    createTaskTC.fulfilled({ task: NewTask }, "requestId", {
      todolistId: "todolistId2",
      title: "NewTitle",
    }),
  )

  expect(endState.todolistId1.length).toBe(3)
  expect(endState.todolistId2.length).toBe(4)
  expect(endState.todolistId2[0].id).toBeDefined()
  expect(endState.todolistId2[0].title).toBe("NewTitle")
  expect(endState.todolistId2[0].status).toBe(TaskStatus.New)
})

test("correct task should change its status", () => {
  const updatedTask = {
    id: "3",
    title: "CSS",
    status: TaskStatus.Completed,
    todoListId: "todolistId2",
    ...taskDefaultValues,
  }
  const endState = tasksReducer(
    startState,
    updateTask.fulfilled(
      { task: updatedTask, todolistId: "todolistId2", taskId: "3", domainModel: { status: TaskStatus.Completed } },
      "reqestId",
      {
        todolistId: "todolistId2",
        taskId: "3",
        domainModel: { status: TaskStatus.Completed },
      },
    ),
  )

  expect(endState.todolistId2[2].status).toBe(TaskStatus.Completed)
  expect(endState.todolistId1[2].status).toBe(TaskStatus.New)
})

test("array should be created for new todolist", () => {
  const endState = tasksReducer(startState, createTodolistTC.fulfilled("New todolist"))

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
