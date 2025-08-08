import { baseApi } from "@/app/baseApi"
import type { BaseResponse } from "@/common/types"
import type { DomainTodolist } from "@/features/todolists/lib/types"
import type { Todolist } from "./todolistsApi.types"
import { UniqueIdentifier } from "@dnd-kit/core"

export const todolistsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTodolists: build.query<DomainTodolist[], void>({
      query: () => "todo-lists",
      transformResponse: (todolists: Todolist[]): DomainTodolist[] =>
        todolists.map((todolist) => ({ ...todolist, filter: "all", entityStatus: "idle" })),
      providesTags: ["Todolist"],
    }),
    addTodolist: build.mutation<BaseResponse<{ item: Todolist }>, string>({
      query: (title) => ({
        url: "todo-lists",
        method: "POST",
        body: { title },
      }),
      invalidatesTags: ["Todolist"],
    }),
    removeTodolist: build.mutation<BaseResponse, string>({
      async onQueryStarted(id, { queryFulfilled, dispatch }) {
        const patchResult = dispatch(
          todolistsApi.util.updateQueryData("getTodolists", undefined, (state) => {
            const index = state.findIndex((todolist) => todolist.id === id)
            if (index !== -1) {
              state.splice(index, 1)
            }
          }),
        )
        try {
          await queryFulfilled
          // if (res.error) {
          //   patchResult.undo()
          // }
        } catch (e) {
          patchResult.undo()
        }
      },
      query: (id) => ({
        url: `todo-lists/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Todolist"],
    }),
    updateTodolistTitle: build.mutation<BaseResponse, { id: string; title: string }>({
      query: ({ id, title }) => ({
        url: `todo-lists/${id}`,
        method: "PUT",
        body: { title },
      }),
      invalidatesTags: ["Todolist"],
    }),
    reorderTodolist: build.mutation<
      BaseResponse,
      {
        todolistId: UniqueIdentifier
        putAfterItemId: UniqueIdentifier | null
      }
    >({
      query: ({ todolistId, putAfterItemId }) => ({
        url: `/todo-lists/${todolistId}/reorder`,
        method: "PUT",
        body: { putAfterItemId },
      }),
      async onQueryStarted({ todolistId, putAfterItemId }, { dispatch, queryFulfilled }) {
        let patchResult = dispatch(
          todolistsApi.util.updateQueryData("getTodolists", undefined, (state) => {
            const movedIndex = state.findIndex((tl) => tl.id === todolistId)
            if (movedIndex === -1) return

            const [movedTodolist] = state.splice(movedIndex, 1)

            if (!putAfterItemId) {
              state.unshift(movedTodolist)
              return
            }

            const targetIndex = state.findIndex((tl) => tl.id === putAfterItemId)

            state.splice(targetIndex + 1, 0, movedTodolist)
          }),
        )

        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
      invalidatesTags: ["Todolist"],
    }),
  }),
})

export const {
  useGetTodolistsQuery,
  useAddTodolistMutation,
  useRemoveTodolistMutation,
  useUpdateTodolistTitleMutation,
  useReorderTodolistMutation,
} = todolistsApi
