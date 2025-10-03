"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCategories, fetchTasks } from "@/lib/api";
import ErrorAlert from "@/components/ErrorAlert";
import Filters from "@/components/Filters";
import SortControls from "@/components/SortControls";
import TaskList from "@/components/TaskList";

export default function Home() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("priority");
  const [order, setOrder] = useState("asc");

  const filters = {
    search: search || undefined,
    status: status === "all" ? undefined : status,
    category: category === "all" ? undefined : category,
    sort_by: sortBy,
    order,
  };

  const {
    data: tasks = [],
    isError: taskError,
    error: tasksErrorMsg,
  } = useQuery({
    queryKey: ["tasks", filters],
    queryFn: () => fetchTasks(filters),
  });

  const { data: categories = [], isError: categoryError } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">TODO</h1>

      {taskError && (
        <ErrorAlert
          title="Failed to load tasks"
          description={
            tasksErrorMsg?.message ||
            "Could not connect to the server. Please check your connection and try again."
          }
        />
      )}

      {categoryError && (
        <ErrorAlert
          title="Failed to load categories"
          description="Could not fetch categories. Category filtering may not work properly."
        />
      )}

      <Filters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        category={category}
        setCategory={setCategory}
        categories={categories}
      />

      <SortControls
        sortBy={sortBy}
        setSortBy={setSortBy}
        order={order}
        setOrder={setOrder}
      />

      <TaskList tasks={tasks} filters={filters} />
    </div>
  );
}
