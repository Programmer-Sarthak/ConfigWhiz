/**
 * Manages user profiles and their permission roles.
 * Roles: 'admin', 'editor', 'viewer'
 */
class UserManager {
    constructor() {
        // Stores user data mapped by email
        this.users = [];
    }

    addUser(name, email, role = 'viewer') {
        if (!name || !email) {
            throw new Error("Name and email are required.");
        }
        
        // Simple regex check for email format
        if (!email.includes('@') || !email.includes('.')) {
            throw new Error("Invalid email format.");
        }

        // Check if user already exists
        const exists = this.users.find(u => u.email === email);
        if (exists) {
            throw new Error(`User with email ${email} already exists.`);
        }

        const validRoles = ['admin', 'editor', 'viewer'];
        if (!validRoles.includes(role)) {
            throw new Error("Invalid role provided.");
        }

        const newUser = {
            id: this.users.length + 1,
            name: name,
            email: email,
            role: role,
            isActive: true
        };

        this.users.push(newUser);
        return newUser;
    }

    getUser(email) {
        return this.users.find(u => u.email === email) || null;
    }

    changeRole(email, newRole) {
        const user = this.getUser(email);
        if (!user) {
            throw new Error("User not found.");
        }

        // Safety check: Prevent removing the last admin
        if (user.role === 'admin' && newRole !== 'admin') {
            const adminCount = this.users.filter(u => u.role === 'admin').length;
            if (adminCount <= 1) {
                throw new Error("Cannot change role: System must have at least one admin.");
            }
        }

        user.role = newRole;
        return true;
    }

    deactivateUser(email) {
        const user = this.getUser(email);
        if (user) {
            user.isActive = false;
        }
    }

    canEditContent(email) {
        // Only admins and editors can edit content
        const user = this.getUser(email);
        if (!user || !user.isActive) return false;
        
        return ['admin', 'editor'].includes(user.role);
    }
}

// Export the class so the test runner can find it
module.exports = { UserManager };