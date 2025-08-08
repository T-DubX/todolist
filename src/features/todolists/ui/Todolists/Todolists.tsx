import { containerSx } from "@/common/styles"
import { useGetTodolistsQuery, useReorderTodolistMutation } from "@/features/todolists/api/todolistsApi"
import Box from "@mui/material/Box"
import { TodolistSkeleton } from "./TodolistSkeleton/TodolistSkeleton"
import { TodolistItem } from "./TodolistItem/TodolistItem"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { closestCorners, DndContext, DragEndEvent, UniqueIdentifier } from "@dnd-kit/core"

export const Todolists = () => {
  const { data: todolists = [], isLoading } = useGetTodolistsQuery()
  const [reorderTodolist] = useReorderTodolistMutation()

  const handleReorder = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id === over!.id) return

    const findBefore = (activeId: UniqueIdentifier, overId: UniqueIdentifier) => {
      const activeIndex = todolists.findIndex((todolist) => todolist.id === activeId)
      const overIndex = todolists.findIndex((todolist) => todolist.id === overId)

      if (overIndex === 0) return null
      if (activeIndex > overIndex) {
        if (overIndex === 0) return null
        return todolists[overIndex - 1].id
      }

      return todolists[overIndex].id
    }

    reorderTodolist({
      todolistId: active.id,
      putAfterItemId: findBefore(active.id, over!.id),
    })
  }

  if (isLoading) {
    return (
      <Box sx={containerSx} style={{ gap: "32px" }}>
        {Array(3)
          .fill(null)
          .map((_, id) => (
            <TodolistSkeleton key={id} />
          ))}
      </Box>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
      <DndContext onDragEnd={handleReorder} collisionDetection={closestCorners}>
        <SortableContext items={todolists} strategy={verticalListSortingStrategy}>
          {todolists?.map((todolist) => (
            <TodolistItem key={todolist.id} todolist={todolist} />
          ))}
        </SortableContext>
      </DndContext>
      {/*<div ref={drop as unknown as React.Ref<HTMLDivElement>}>*/}
    </div>
  )
}
