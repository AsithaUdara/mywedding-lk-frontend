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
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events/${eventId}/budget`;
    const response = await fetch(apiUrl, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Event or budget details not found.');
        }
        throw new Error('Failed to fetch budget overview.');
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json();
    } else {
        throw new Error('Server returned invalid data format.');
    }
};

export const setTotalBudget = async (token: string, eventId: string, totalBudget: number) => {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events/${eventId}/budget`;
    const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ totalBudget }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to set total budget.');
    }
    return response;
};

export const addExpense = async (token: string, eventId: string, expenseData: AddExpenseData) => {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events/${eventId}/expenses`;
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(expenseData),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add expense.');
    }
    return response.json();
};

export const getBudgetCategories = async (token: string): Promise<BudgetCategory[]> => {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/budget-categories`;
    const response = await fetch(apiUrl, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch budget categories.');
    return response.json();
};

export const getExpenses = async (token: string, eventId: string): Promise<Expense[]> => {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events/${eventId}/expenses`;
    const response = await fetch(apiUrl, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch expenses.');
    return response.json();
};

