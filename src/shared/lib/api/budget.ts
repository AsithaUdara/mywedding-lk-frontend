import { apiFetch } from "@/shared/lib/api/apiClient";
import { apiRequest, apiRequestJson, apiUrl } from "@/shared/lib/api/apiRequest";
import { parseApiError } from "@/shared/lib/api/parseApiError";

export interface BudgetOverview {
    eventId: string;
    totalBudget: number;
    totalSpent: number;
    remainingBudget: number;
}

export interface BudgetCategory {
    id: string;
    name: string;
}

export interface AddExpenseData {
    title: string;
    amount: number;
    expenseDate: string;
    budgetCategoryId: string;
}

export interface Expense {
    id: string;
    title: string;
    amount: number;
    expenseDate: string;
    budgetCategoryId: string;
}

export const getBudgetOverview = async (token: string, eventId: string): Promise<BudgetOverview> => {
    const response = await apiFetch(token, apiUrl(`/api/events/${eventId}/budget`), { method: "GET" });
    if (response.status === 404) {
        throw new Error("Event or budget details not found.");
    }
    if (!response.ok) {
        throw new Error(await parseApiError(response, "Failed to fetch budget overview."));
    }
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json();
    }
    throw new Error("Server returned invalid data format.");
};

export const setTotalBudget = async (token: string, eventId: string, totalBudget: number) => {
    return apiRequest(
        token,
        `/api/events/${eventId}/budget`,
        {
            method: "PUT",
            body: JSON.stringify({ totalBudget }),
        },
        { fallbackError: "Failed to set total budget." }
    );
};

export const addExpense = async (token: string, eventId: string, expenseData: AddExpenseData) => {
    return apiRequestJson(
        token,
        `/api/events/${eventId}/expenses`,
        {
            method: "POST",
            body: JSON.stringify(expenseData),
        },
        { fallbackError: "Failed to add expense." }
    );
};

export const getBudgetCategories = async (token: string): Promise<BudgetCategory[]> => {
    return apiRequestJson(
        token,
        "/api/budget-categories",
        { method: "GET" },
        { fallbackError: "Failed to fetch budget categories." }
    );
};

export const getExpenses = async (token: string, eventId: string): Promise<Expense[]> => {
    return apiRequestJson(
        token,
        `/api/events/${eventId}/expenses`,
        { method: "GET" },
        { fallbackError: "Failed to fetch expenses." }
    );
};
