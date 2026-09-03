import { beforeEach, expect, test } from "vitest"
import { createTaskTC, deleteTaskTC, tasksReducer, tasksSlice, type TasksState, updateTaskTC } from "../tasks-slice"
import { TaskPriority, TaskStatus } from "@/common/enums"
import { DomainTask } from "@/features/todolists/api/tasksApi.types.ts"

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
    deleteTaskTC.fulfilled({ todolistId: "todolistId1", taskId: "1" }, "requestId", {
      todolistId: "todolistId1",
      taskId: "1",
    }),
  )

  expect(endState.todolistId1.length).toBe(2)
  expect(endState.todolistId2.length).toBe(3)
})

test("correct task should be created at correct array", () => {
  const newTask: DomainTask = {
    description: "test",
    title: "juice",
    status: TaskStatus.New,
    priority: TaskPriority.Low,
    startDate: "",
    deadline: "",
    id: "4",
    todoListId: "todolistId2",
    order: 0,
    addedDate: "",
  }
  const endState = tasksReducer(
    startState,
    createTaskTC.fulfilled({ task: newTask }, "requestId", {
      todolistId: "todolistId2",
      title: "juice",
    }),
  )

  expect(endState.todolistId1.length).toBe(3)
  expect(endState.todolistId2.length).toBe(4)
  expect(endState.todolistId2[0].id).toBeDefined()
  expect(endState.todolistId2[0].title).toBe("juice")
  expect(endState.todolistId2[0].description).toBe("test")
})

test("correct task should changed", () => {
  const newTask: DomainTask = {
    description: "test",
    title: "test-title",
    status: TaskStatus.New,
    priority: TaskPriority.Low,
    startDate: "",
    deadline: "",
    id: "2",
    todoListId: "todolistId2",
    order: 0,
    addedDate: "",
  }
  const endState = tasksReducer(
    startState,
    updateTaskTC.fulfilled({ task: newTask }, "requestId", {
      todolistId: "todolistId2",
      taskId: "2",
      model: { title: "test-title" },
    }),
  )

  expect(endState.todolistId2[1].title).toBe("test-title")
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
