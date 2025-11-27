import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

// A simple class to represent a single expense
class Expense {
    String description;
    double amount;
    String category;
    boolean isApproved;

    public Expense(String description, double amount, String category) {
        this.description = description;
        this.amount = amount;
        this.category = category;
        this.isApproved = false;
    }
}

class ExpenseReport {
    private List<Expense> expenses;
    private String employeeName;

    public ExpenseReport(String employeeName) {
        if (employeeName == null || employeeName.trim().isEmpty()) {
            throw new IllegalArgumentException("Employee name cannot be empty.");
        }
        this.employeeName = employeeName;
        this.expenses = new ArrayList<>();
    }

    public void addExpense(String description, double amount, String category) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Expense amount must be positive.");
        }
        if (category == null) {
            throw new IllegalArgumentException("Category cannot be null.");
        }
        expenses.add(new Expense(description, amount, category));
    }

    public double getTotal() {
        return expenses.stream().mapToDouble(e -> e.amount).sum();
    }

    public void approveExpenses(double limit) {
        for (Expense e : expenses) {
            if (e.amount <= limit) {
                e.isApproved = true;
            }
        }
    }

    public List<Expense> getUnapprovedExpenses() {
        return expenses.stream()
                .filter(e -> !e.isApproved)
                .collect(Collectors.toList());
    }

    public double getCategoryTotal(String category) {
        return expenses.stream()
                .filter(e -> e.category.equalsIgnoreCase(category))
                .mapToDouble(e -> e.amount)
                .sum();
    }

    public int getExpenseCount() {
        return expenses.size();
    }

    // --- THE FIX: PUBLIC GETTERS ---
    // These allow the TestRunner to see the private data safely.

    public String getEmployeeName() {
        return this.employeeName;
    }

    public List<Expense> getExpenses() {
        return this.expenses;
    }
}