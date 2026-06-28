import { z } from "zod";
import type { Task } from "@/shared/lib/api/tasks";
import { pickNullableString, pickString } from "@/shared/lib/api/schemas/zodHelpers";

const taskStatusSchema = z.enum(["ToDo", "InProgress", "Completed"]);

export const taskSchema: z.ZodType<Task> = z
  .record(z.string(), z.unknown())
  .transform((raw) => {
    const statusRaw = pickString(raw, "status", "Status", "ToDo");
    const status = taskStatusSchema.safeParse(statusRaw);
    return {
      id: pickString(raw, "id", "Id"),
      title: pickString(raw, "title", "Title"),
      description: pickNullableString(raw, "description", "Description"),
      status: status.success ? status.data : "ToDo",
      startDate: pickNullableString(raw, "startDate", "StartDate"),
      dueDate: pickNullableString(raw, "dueDate", "DueDate"),
      dependsOnTaskId: pickNullableString(raw, "dependsOnTaskId", "DependsOnTaskId"),
      assignedToUserId: pickNullableString(raw, "assignedToUserId", "AssignedToUserId"),
      assignedToName: pickNullableString(raw, "assignedToName", "AssignedToName"),
      createdAt: pickNullableString(raw, "createdAt", "CreatedAt"),
    };
  });

export const tasksSchema = z.array(taskSchema);
