import { CreateItemForm } from "@/common/components/CreateItemForm/CreateItemForm"
import { useAddTaskMutation } from "@/features/todolists/api/tasksApi"
import type { DomainTodolist } from "@/features/todolists/lib/types"
import { FilterButtons } from "./FilterButtons/FilterButtons"
import { Tasks } from "./Tasks/Tasks"
import { TodolistTitle } from "./TodolistTitle/TodolistTitle"
import Grid from "@mui/material/Grid"
import Paper from "@mui/material/Paper"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

type Props = {
  todolist: DomainTodolist
}

export const TodolistItem = ({ todolist }: Props) => {
  const [addTask] = useAddTaskMutation()
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: todolist.id })

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  }

  const createTask = (title: string) => {
    addTask({ todolistId: todolist.id, title })
  }

  return (
    <Grid ref={setNodeRef} {...attributes} {...listeners} style={style}>
      <Paper sx={{ p: "0 20px 20px 20px" }}>
        <TodolistTitle todolist={todolist} />
        <CreateItemForm onCreateItem={createTask} disabled={todolist.entityStatus === "loading"} />
        <Tasks todolist={todolist} />
        <FilterButtons todolist={todolist} />
      </Paper>
    </Grid>
  )
}
