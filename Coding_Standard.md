# Project Coding Standards

## **1. Universal Coding Standards**

### **1.1. Naming Conventions**
- **Meaningful Names**: Use descriptive names for variables, functions, classes, and methods to clearly indicate their purpose. Examples: `calculateTotalPrice`, `fetchUserData`.
- **Consistent Case Styles**:
  - **camelCase**: Variables and functions (e.g., `userData`, `fetchData`).
  - **PascalCase**: Classes, components, and constructors (e.g., `UserProfile`, `AppController`).
  - **UPPERCASE**: Constants and environment variables (e.g., `MAX_RETRIES`, `DB_PORT`).
- **Avoid Abbreviations**: Use full words unless the abbreviation is widely recognized (e.g., `username` instead of `usrnm`).

---

### **1.2. Code Formatting**
- **Indentation**: Use 2 or 4 spaces per level of indentation; avoid tabs.
- **Line Length**: Limit lines to 80–100 characters for readability.
- **Curly Braces**: Always use braces for code blocks:
  ```javascript
  if (condition) {
    executeTask();
  }
  ```
- **Blank Lines**: Separate logical blocks with blank lines for better readability

---

### **1.3. Code Structure**
- **Avoid Duplicate Code**: Reuse functions and modules to follow the DRY (Don't Repeat Yourself) principle.
- **Organize Logically**: Group related functionality, separate concerns into modules, and follow a consistent folder structure.

--- 

### **1.4. Documentation**
- Documentation explaining each users' contributions in each 4 sprints along with backlogs of activities completed.
- **Update Documentation**: Regularly update comments and documentation to match the current state of the code.

--- 

### **1.5. Error Handling**
- **Descriptive Error Messages**: Provide meaningful error messages for debugging, e.g., Error connecting to database.
- **Graceful Degradation**: Ensure errors do not crash the application. Provide fallback options or user-friendly error messages.

## **2. Database Standards**

### **2.1. SQL Best Practices**
- **Meaningful Table and Column Names**: Use descriptive names, e.g., first_name, user_id.
- **Foreign Keys and Relationships**: Define relationships using foreign keys.
- **Indexing**: Index frequently queried fields for improved performance:


```sql
CREATE INDEX IDX_STUDENT_NAME ON STUDENT(NAME);
```

- **Example Schema**:
```sql
CREATE TABLE STUDENT (
    ID SERIAL PRIMARY KEY,
    NAME VARCHAR(100),
    PASSWORD VARCHAR(1000) NOT NULL,
    ID_GROUP INTEGER REFERENCES GROUPS(ID_GROUP)
);
```

## **3. Environment Variables**

### **3.1. Guidelines**
- Store sensitive configurations in .env files.
- Examples:
```env
DB_USER= "postgres"
DB_HOST= "localhost"
DB_NAME= your_postgres_databasename
DB_PASSWORD= your_postgres_password
DB_PORT= 5432
Gemini_API_key= your_gemini_api_key
```

---

### **3.2. Best Practices**
- Do not commit .env files.
- Provide a .env.example file with placeholders for required configurations.

---

## **4. Testing Standards**

### **4.1. Tools Used**
- **Jest**: For unit testing.
- **Supertest**: For integration testing.

---

### **4.2. Testing Guidelines**
- Test edge cases and typical use cases.
- Keep tests modular and independent.

---

### **4.3. Example Tests**
- Example of a Jest test:

```javascript
describe("Home Page Tests", () => {
  it("should render the home page", async () => {
    const response = await request(app).get("/");
    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("Welcome");
  });
});
```
## **5. CI/CD Workflow**

### **5.1. GitHub Actions Workflow**
Implemented a CI/CD pipeline using GitHub Actions. 

## **6. SonarCloud Integration for Code Quality**

### **6.1. SonarCloud Usage**

**SonarCloud** was used to analyze and maintain code quality. The tool provided metrics such as:

- **Code Smells**: Identify areas of the codebase that could be improved.
- **Vulnerabilities**: Detect potential security issues.
- **Test Coverage**: Ensure the code is well-tested.
- **Duplications**: Avoiding code repetitions.

### **6.2. Benefits**
- Automated checks for coding standards, security, and test coverage.
- Centralized dashboard for tracking issues and metrics.




This coding standards document ensures consistency, quality, and maintainability throughout the project. Tools like Jest, GitHub Actions, and SonarCloud provide automated testing and monitoring to enforce these standards.