"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AddTaskDialog from "@/components/AddTaskDialog";

export default function SortControls({
  sortBy,
  setSortBy,
  order,
  setOrder,
}: {
  sortBy: string;
  setSortBy: (v: string) => void;
  order: string;
  setOrder: (v: string) => void;
}) {
  return (
    <div className="flex gap-4 mb-4">
      <Select value={sortBy} onValueChange={setSortBy}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="priority">Priority</SelectItem>
          <SelectItem value="title">Title</SelectItem>
          <SelectItem value="id">ID</SelectItem>
        </SelectContent>
      </Select>
      <Select value={order} onValueChange={setOrder}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="asc">Ascending</SelectItem>
          <SelectItem value="desc">Descending</SelectItem>
        </SelectContent>
      </Select>
      <AddTaskDialog />
    </div>
  );
}
