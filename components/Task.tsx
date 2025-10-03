"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { Checkbox } from "./ui/checkbox";
import { Card, CardContent } from "./ui/card";
import { deleteTask, type Task, updateTask } from "@/lib/api";
import ErrorAlert from "@/components/ErrorAlert";
import { Trash } from "lucide-react";
import { Button } from "./ui/button";

export default function Task({ task, filters }: { task: Task; filters: any }) {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (patch: Partial<Task>) => updateTask(task.id, patch),
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: ["tasks", filters] });
      const previousTasks = queryClient.getQueryData<Task[]>([
        "tasks",
        filters,
      ]);

      if (previousTasks) {
        queryClient.setQueryData<Task[]>(
          ["tasks", filters],
          previousTasks.map((t) => (t.id === task.id ? { ...t, ...patch } : t))
        );
      }

      return { previousTasks };
    },
    onError: (_err, _patch, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(["tasks", filters], context.previousTasks);
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteTask(task.id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["tasks", filters] });
      const previousTasks = queryClient.getQueryData<Task[]>([
        "tasks",
        filters,
      ]);

      if (previousTasks) {
        queryClient.setQueryData<Task[]>(
          ["tasks", filters],
          previousTasks.filter((t) => t.id !== task.id)
        );
      }

      return { previousTasks };
    },
    onError: (_err, _, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(["tasks", filters], context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", filters] });
    },
  });

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleCheckboxChange = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateMutation.mutate({
      status: task.status === "done" ? "undone" : "done",
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteMutation.mutate();
  };

  return (
    <div>
      <Card
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="shadow-sm"
      >
        <CardContent className="flex gap-4 items-start p-4">
          <div
            onClick={handleCheckboxChange}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <Checkbox checked={task.status === "done"} />
          </div>
          <div className="flex-1">
            <h3
              className={`font-medium ${
                task.status === "done" ? "line-through text-gray-400" : ""
              }`}
            >
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-gray-600">{task.description}</p>
            )}
            <div className="flex gap-2 text-xs text-gray-500 mt-1">
              {task.category && <span>🏷 {task.category}</span>}
              {task.due_date && (
                <span>{new Date(task.due_date).toLocaleDateString()}</span>
              )}
              <span>Priority: {task.priority}</span>
            </div>
          </div>
          <Button
            onClick={handleDelete}
            onPointerDown={(e) => e.stopPropagation()} // prevents drag hijack
            className="text-red-500 hover:text-red-700 ml-2 flex gap-2 self-center"
          >
            <Trash size={16} className="self-center" />
            Delete
          </Button>
        </CardContent>
      </Card>

      {(updateMutation.isError || deleteMutation.isError) && (
        <ErrorAlert
          title="Action failed"
          description={
            updateMutation.error?.message ||
            deleteMutation.error?.message ||
            "Something went wrong"
          }
        />
      )}
    </div>
  );
}
