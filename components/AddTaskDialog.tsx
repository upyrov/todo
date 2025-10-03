"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { createTask, fetchCategories, TaskCreate } from "@/lib/api";
import ErrorAlert from "./ErrorAlert";
import { Plus } from "lucide-react";

export default function AddTaskDialog() {
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<TaskCreate>({
    title: "",
    description: "",
    category: "",
    due_date: "",
    priority: 1,
    status: "undone",
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const mutation = useMutation({
    mutationFn: createTask,
    onSuccess: (newTask) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });

      // Refetch categories if a new category was added
      if (newTask.category && !categories.includes(newTask.category)) {
        queryClient.invalidateQueries({ queryKey: ["categories"] });
      }

      setOpen(false);
      setForm({
        title: "",
        description: "",
        category: "",
        due_date: "",
        priority: 1,
        status: "undone",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus size={16} />
          Add task
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Textarea
            placeholder="Description"
            value={form.description || ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Input
            placeholder="Category"
            value={form.category || ""}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          <Input
            type="date"
            value={form.due_date || ""}
            onChange={(e) => setForm({ ...form, due_date: e.target.value })}
          />
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Priority</label>
            <Input
              type="number"
              min={1}
              max={10}
              value={form.priority}
              onChange={(e) =>
                setForm({ ...form, priority: parseInt(e.target.value) || 1 })
              }
            />
          </div>
          {mutation.isError && (
            <ErrorAlert
              title="Failed to create task"
              description={mutation.error?.message || "Could not create task"}
            />
          )}
        </div>
        <DialogFooter>
          <Button
            onClick={() => mutation.mutate(form)}
            disabled={!form.title || !form.due_date || mutation.isPending}
          >
            {mutation.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
