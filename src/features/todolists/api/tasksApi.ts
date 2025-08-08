import { baseApi } from "@/app/baseApi"
import type { BaseResponse } from "@/common/types"
import type { DomainTask, GetTasksResponse, UpdateTaskModel } from "./tasksApi.types"
import { PAGE_SIZE } from "@/common/constants"

export const tasksApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTasks: build.query<GetTasksResponse, { id: string; params: { page: number } }>({
      query: ({ id, params }) => ({
        url: `todo-lists/${id}/tasks`,
        params: {
          ...params,
          count: PAGE_SIZE,
        },
      }),
      providesTags: (_result, _error, { id }) => [
        {
          type: "Task",
          id,
        },
      ],
    }),
    addTask: build.mutation<BaseResponse<{ item: DomainTask }>, { todolistId: string; title: string }>({
      query: ({ todolistId, title }) => ({
        url: `todo-lists/${todolistId}/tasks`,
        method: "POST",
        body: { title },
      }),
      invalidatesTags: (_result, _error, { todolistId }) => [{ type: "Task", id: todolistId }],
    }),
    removeTask: build.mutation<BaseResponse, { todolistId: string; taskId: string }>({
      query: ({ todolistId, taskId }) => ({
        url: `todo-lists/${todolistId}/tasks/${taskId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { todolistId }) => [{ type: "Task", id: todolistId }],
    }),
    updateTask: build.mutation<
      BaseResponse<{ item: DomainTask }>,
      { todolistId: string; taskId: string; model: UpdateTaskModel; page: number }
    >({
      query: ({ todolistId, taskId, model }) => ({
        url: `todo-lists/${todolistId}/tasks/${taskId}`,
        method: "PUT",
        body: model,
      }),
      async onQueryStarted({ todolistId, taskId, model, page }, { dispatch, queryFulfilled }) {
        let patchResult = dispatch(
          tasksApi.util.updateQueryData("getTasks", { id: todolistId, params: { page } }, (state) => {
            const index = state.items.findIndex((task) => task.id === taskId)
            if (index !== -1) {
              state.items[index] = { ...state.items[index], ...model }
            }
          }),
        )

        // const args = tasksApi.util.selectCachedArgsForQuery(getState(), "getTasks")
        //
        // let patchResults: any[] = []
        // args.forEach(({ params }) => {
        //   patchResults.push(
        //     dispatch(
        //       tasksApi.util.updateQueryData("getTasks", { id: todolistId, params: { page: params.page } }, (state) => {
        //         const index = state.items.findIndex((task) => task.id === taskId)
        //         if (index !== -1) {
        //           state.items[index] = { ...state.items[index], ...model }
        //         }
        //       }),
        //     ),
        //   )
        // })
        try {
          await queryFulfilled
        } catch {
          patchResult.undo()

          // patchResults.forEach((patchResult) => {
          //   patchResult.undo()
          // })
        }
      },
      invalidatesTags: (_result, _error, { todolistId }) => [{ type: "Task", id: todolistId }],
    }),
  }),
})

export const { useGetTasksQuery, useAddTaskMutation, useRemoveTaskMutation, useUpdateTaskMutation } = tasksApi
