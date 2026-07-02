import { z } from "zod";
import type { PlannerEventListItem } from "@/shared/lib/api/planner";
import { pickNumber, pickString } from "@/shared/lib/api/schemas/zodHelpers";

const lifecycleSchema = z.enum(["Lead", "Onboarding", "Planning", "Execution", "Archived"]);
const taskPlanSchema = z.enum(["None", "Discovery", "Full"]);

export const plannerEventListItemSchema: z.ZodType<PlannerEventListItem> = z
  .record(z.string(), z.unknown())
  .transform((raw) => {
    const lifecycle = lifecycleSchema.safeParse(
      pickString(raw, "eventLifecycleStage", "EventLifecycleStage", "Lead")
    );
    const taskPlan = taskPlanSchema.safeParse(
      pickString(raw, "taskPlanPhase", "TaskPlanPhase", "None")
    );
    return {
      plannerClientEventId: pickString(raw, "plannerClientEventId", "PlannerClientEventId"),
      eventId: pickString(raw, "eventId", "EventId"),
      eventName: pickString(raw, "eventName", "EventName"),
      eventDate: pickString(raw, "eventDate", "EventDate"),
      clientUserId: pickString(raw, "clientUserId", "ClientUserId"),
      clientEmail: pickString(raw, "clientEmail", "ClientEmail"),
      status: pickString(raw, "status", "Status"),
      totalBudget: pickNumber(raw, "totalBudget", "TotalBudget"),
      spentBudget: pickNumber(raw, "spentBudget", "SpentBudget"),
      requestedBookings: pickNumber(raw, "requestedBookings", "RequestedBookings"),
      confirmedBookings: pickNumber(raw, "confirmedBookings", "ConfirmedBookings"),
      completedBookings: pickNumber(raw, "completedBookings", "CompletedBookings"),
      eventLifecycleStage: lifecycle.success ? lifecycle.data : "Lead",
      taskPlanPhase: taskPlan.success ? taskPlan.data : "None",
    };
  });

export const plannerEventsSchema = z.array(plannerEventListItemSchema);
