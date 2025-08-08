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
import DragIndicatorIcon from "@mui/icons-material/DragIndicator"
import styles from "./TodolistItem.module.css"

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
    <Grid ref={setNodeRef} style={{ ...style, position: "relative" }}>
      <Paper sx={{ p: "0 20px 20px 20px" }}>
        <div {...attributes} {...listeners} className={styles.dragIndicatorWrapper}>
          <DragIndicatorIcon
            sx={{
              fontSize: 16,
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              color: "#666",
            }}
          />
        </div>
        <TodolistTitle todolist={todolist} />
        <CreateItemForm onCreateItem={createTask} disabled={todolist.entityStatus === "loading"} />
        <Tasks todolist={todolist} />
        <FilterButtons todolist={todolist} />
      </Paper>
    </Grid>
  )
}
