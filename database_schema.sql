-- =========================================
-- JIRA-LIKE BUG TRACKING SYSTEM DATABASE SCHEMA
-- =========================================
-- This script creates all necessary tables for a comprehensive
-- Jira-like issue tracking system with custom fields, workflows,
-- and advanced features.
--
-- WARNING: This script DROPS existing tables and recreates them.
-- BACKUP YOUR DATA BEFORE RUNNING THIS SCRIPT!

-- =========================================
-- 0. CLEANUP EXISTING TABLES
-- =========================================

-- Drop tables in reverse dependency order to avoid foreign key conflicts
IF EXISTS (SELECT * FROM sysobjects WHERE name='Comments' AND xtype='U')
    DROP TABLE Comments;

IF EXISTS (SELECT * FROM sysobjects WHERE name='Bugs' AND xtype='U')
    DROP TABLE Bugs;

IF EXISTS (SELECT * FROM sysobjects WHERE name='WorkLogs' AND xtype='U')
    DROP TABLE WorkLogs;

IF EXISTS (SELECT * FROM sysobjects WHERE name='Attachments' AND xtype='U')
    DROP TABLE Attachments;

IF EXISTS (SELECT * FROM sysobjects WHERE name='IssueLinks' AND xtype='U')
    DROP TABLE IssueLinks;

IF EXISTS (SELECT * FROM sysobjects WHERE name='CustomFieldValues' AND xtype='U')
    DROP TABLE CustomFieldValues;

IF EXISTS (SELECT * FROM sysobjects WHERE name='CustomFields' AND xtype='U')
    DROP TABLE CustomFields;

IF EXISTS (SELECT * FROM sysobjects WHERE name='WorkflowTransitions' AND xtype='U')
    DROP TABLE WorkflowTransitions;

IF EXISTS (SELECT * FROM sysobjects WHERE name='WorkflowSteps' AND xtype='U')
    DROP TABLE WorkflowSteps;

IF EXISTS (SELECT * FROM sysobjects WHERE name='Workflows' AND xtype='U')
    DROP TABLE Workflows;

IF EXISTS (SELECT * FROM sysobjects WHERE name='Versions' AND xtype='U')
    DROP TABLE Versions;

IF EXISTS (SELECT * FROM sysobjects WHERE name='Components' AND xtype='U')
    DROP TABLE Components;

IF EXISTS (SELECT * FROM sysobjects WHERE name='Issues' AND xtype='U')
    DROP TABLE Issues;

IF EXISTS (SELECT * FROM sysobjects WHERE name='Projects' AND xtype='U')
    DROP TABLE Projects;

IF EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
    DROP TABLE Users;

PRINT 'Existing tables dropped successfully.';

-- =========================================
-- 1. CORE TABLES (Updated from original)
-- =========================================

-- Users table (enhanced)
CREATE TABLE Users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(50) UNIQUE NOT NULL,
    email NVARCHAR(100) UNIQUE NOT NULL,
    password NVARCHAR(255) NOT NULL,
    role NVARCHAR(20) NOT NULL CHECK (role IN ('Admin', 'Developer', 'Tester')),
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE()
);

-- Projects table (enhanced)
CREATE TABLE Projects (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX),
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE()
);

-- Issues table (replaces Bugs table - comprehensive issue tracking)
CREATE TABLE Issues (
    id INT IDENTITY(1,1) PRIMARY KEY,
    [key] NVARCHAR(20) UNIQUE, -- e.g., PROJ-123 (escaped because 'key' is reserved)
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    type NVARCHAR(20) NOT NULL CHECK (type IN ('Bug', 'Task', 'Story', 'Epic', 'Subtask')),
    priority NVARCHAR(20) DEFAULT 'Medium' CHECK (priority IN ('Lowest', 'Low', 'Medium', 'High', 'Highest')),
    status NVARCHAR(20) DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved', 'Closed', 'To Do', 'In Review', 'Done', 'Backlog')),
    reporterId INT NOT NULL,
    assigneeId INT,
    projectId INT NOT NULL,
    parentId INT, -- For subtasks
    epicId INT, -- For stories belonging to epics
    storyPoints INT,
    labels NVARCHAR(MAX), -- JSON array of labels
    components NVARCHAR(MAX), -- JSON array of components
    affectsVersions NVARCHAR(MAX), -- JSON array of affected versions
    fixVersions NVARCHAR(MAX), -- JSON array of fix versions
    dueDate DATETIME2,
    environment NVARCHAR(255),
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (reporterId) REFERENCES Users(id),
    FOREIGN KEY (assigneeId) REFERENCES Users(id),
    FOREIGN KEY (projectId) REFERENCES Projects(id),
    FOREIGN KEY (parentId) REFERENCES Issues(id),
    FOREIGN KEY (epicId) REFERENCES Issues(id)
);

-- Comments table (enhanced for issues)
CREATE TABLE Comments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    content NVARCHAR(MAX) NOT NULL,
    authorId INT NOT NULL,
    issueId INT NOT NULL, -- Changed from bugId to issueId
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (authorId) REFERENCES Users(id),
    FOREIGN KEY (issueId) REFERENCES Issues(id) ON DELETE CASCADE
);

-- =========================================
-- 2. CUSTOM FIELDS SYSTEM
-- =========================================

-- Custom Fields table
CREATE TABLE CustomFields (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    label NVARCHAR(255) NOT NULL,
    type NVARCHAR(50) NOT NULL CHECK (type IN ('text', 'textarea', 'select', 'multiselect', 'date', 'datetime', 'number', 'checkbox', 'radio', 'user', 'version', 'component')),
    description NVARCHAR(MAX),
    projectId INT NOT NULL,
    required BIT DEFAULT 0,
    defaultValue NVARCHAR(MAX), -- JSON
    options NVARCHAR(MAX), -- JSON array for select/multiselect/radio
    validation NVARCHAR(MAX), -- JSON validation rules
    [order] INT DEFAULT 0,
    isActive BIT DEFAULT 1,
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (projectId) REFERENCES Projects(id),
    UNIQUE(name, projectId)
);

-- Custom Field Values table
CREATE TABLE CustomFieldValues (
    id INT IDENTITY(1,1) PRIMARY KEY,
    issueId INT NOT NULL,
    customFieldId INT NOT NULL,
    value NVARCHAR(MAX) NOT NULL, -- JSON stored value
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (issueId) REFERENCES Issues(id) ON DELETE CASCADE,
    FOREIGN KEY (customFieldId) REFERENCES CustomFields(id) ON DELETE CASCADE,
    UNIQUE(issueId, customFieldId)
);

-- =========================================
-- 3. WORKFLOW SYSTEM
-- =========================================

-- Workflows table
CREATE TABLE Workflows (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX),
    projectId INT NOT NULL,
    issueType NVARCHAR(20), -- NULL means applies to all types
    isDefault BIT DEFAULT 0,
    isActive BIT DEFAULT 1,
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (projectId) REFERENCES Projects(id)
);

-- Workflow Steps table (statuses in workflow)
CREATE TABLE WorkflowSteps (
    id INT IDENTITY(1,1) PRIMARY KEY,
    workflowId INT NOT NULL,
    name NVARCHAR(100) NOT NULL,
    status NVARCHAR(50) NOT NULL,
    [order] INT DEFAULT 0,
    isInitial BIT DEFAULT 0,
    isFinal BIT DEFAULT 0,
    properties NVARCHAR(MAX), -- JSON additional properties
    FOREIGN KEY (workflowId) REFERENCES Workflows(id) ON DELETE CASCADE
);

-- Workflow Transitions table
CREATE TABLE WorkflowTransitions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    workflowId INT NOT NULL,
    fromStepId INT NOT NULL,
    toStepId INT NOT NULL,
    name NVARCHAR(100) NOT NULL,
    type NVARCHAR(20) DEFAULT 'global' CHECK (type IN ('global', 'conditional')),
    conditions NVARCHAR(MAX), -- JSON conditions for conditional transitions
    requiredRoles NVARCHAR(MAX), -- JSON array of required roles
    screenId INT, -- Future: link to transition screens
    validators NVARCHAR(MAX), -- JSON array of validator names
    postFunctions NVARCHAR(MAX), -- JSON array of post-function names
    properties NVARCHAR(MAX), -- JSON additional properties
    FOREIGN KEY (workflowId) REFERENCES Workflows(id) ON DELETE CASCADE,
    FOREIGN KEY (fromStepId) REFERENCES WorkflowSteps(id),
    FOREIGN KEY (toStepId) REFERENCES WorkflowSteps(id)
);

-- =========================================
-- 4. ADDITIONAL FEATURES TABLES
-- =========================================

-- Components table (for issue organization)
CREATE TABLE Components (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX),
    projectId INT NOT NULL,
    leadId INT,
    createdAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (projectId) REFERENCES Projects(id),
    FOREIGN KEY (leadId) REFERENCES Users(id),
    UNIQUE(name, projectId)
);

-- Versions table (for release management)
CREATE TABLE Versions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX),
    projectId INT NOT NULL,
    releaseDate DATETIME2,
    released BIT DEFAULT 0,
    archived BIT DEFAULT 0,
    createdAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (projectId) REFERENCES Projects(id),
    UNIQUE(name, projectId)
);

-- Issue Links table (for linking related issues)
CREATE TABLE IssueLinks (
    id INT IDENTITY(1,1) PRIMARY KEY,
    linkType NVARCHAR(50) NOT NULL, -- 'blocks', 'is blocked by', 'relates to', etc.
    sourceIssueId INT NOT NULL,
    targetIssueId INT NOT NULL,
    createdBy INT NOT NULL,
    createdAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (sourceIssueId) REFERENCES Issues(id),
    FOREIGN KEY (targetIssueId) REFERENCES Issues(id),
    FOREIGN KEY (createdBy) REFERENCES Users(id)
);

-- Attachments table
CREATE TABLE Attachments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    filename NVARCHAR(255) NOT NULL,
    originalName NVARCHAR(255) NOT NULL,
    mimeType NVARCHAR(100) NOT NULL,
    size BIGINT NOT NULL,
    path NVARCHAR(500) NOT NULL,
    issueId INT NOT NULL,
    uploadedBy INT NOT NULL,
    createdAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (issueId) REFERENCES Issues(id) ON DELETE CASCADE,
    FOREIGN KEY (uploadedBy) REFERENCES Users(id)
);

-- Time Tracking table
CREATE TABLE WorkLogs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    issueId INT NOT NULL,
    authorId INT NOT NULL,
    timeSpent INT NOT NULL, -- in minutes
    startDate DATETIME2,
    description NVARCHAR(MAX),
    createdAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (issueId) REFERENCES Issues(id) ON DELETE CASCADE,
    FOREIGN KEY (authorId) REFERENCES Users(id)
);

-- =========================================
-- 5. INDEXES FOR PERFORMANCE
-- =========================================

-- Issues table indexes
CREATE INDEX IX_Issues_Project_Status ON Issues(projectId, status);
CREATE INDEX IX_Issues_Reporter ON Issues(reporterId);
CREATE INDEX IX_Issues_Assignee ON Issues(assigneeId);
CREATE INDEX IX_Issues_Type ON Issues(type);
CREATE INDEX IX_Issues_Status ON Issues(status);
CREATE INDEX IX_Issues_Epic ON Issues(epicId);
CREATE INDEX IX_Issues_Parent ON Issues(parentId);
CREATE INDEX IX_Issues_CreatedAt ON Issues(createdAt DESC);

-- Comments table indexes
CREATE INDEX IX_Comments_Issue ON Comments(issueId);
CREATE INDEX IX_Comments_Author ON Comments(authorId);

-- Custom Fields indexes
CREATE INDEX IX_CustomFields_Project ON CustomFields(projectId, isActive);
CREATE INDEX IX_CustomFieldValues_Issue ON CustomFieldValues(issueId);
CREATE INDEX IX_CustomFieldValues_Field ON CustomFieldValues(customFieldId);

-- Workflow indexes
CREATE INDEX IX_Workflows_Project ON Workflows(projectId, isActive);
CREATE INDEX IX_WorkflowSteps_Workflow ON WorkflowSteps(workflowId, [order]);
CREATE INDEX IX_WorkflowTransitions_Workflow ON WorkflowTransitions(workflowId);

-- =========================================
-- 6. DATA MIGRATION (Optional)
-- =========================================

-- Migrate existing Bugs data to Issues (run this only if you have existing data)
-- Uncomment and modify as needed based on your existing data

/*
-- Step 1: Insert existing bugs as issues
INSERT INTO Issues (
    title, description, type, priority, status, reporterId, assigneeId, projectId,
    labels, components, affectsVersions, fixVersions, createdAt, updatedAt
)
SELECT
    title,
    description,
    'Bug' as type,
    CASE
        WHEN severity = 'low' THEN 'Low'
        WHEN severity = 'medium' THEN 'Medium'
        WHEN severity = 'high' THEN 'High'
        WHEN severity = 'critical' THEN 'Highest'
        ELSE 'Medium'
    END as priority,
    status,
    reporterId,
    developerId as assigneeId,
    projectId,
    '[]' as labels,
    '[]' as components,
    '[]' as affectsVersions,
    '[]' as fixVersions,
    createdAt,
    createdAt as updatedAt
FROM Bugs;

-- Step 2: Update comments to reference issues instead of bugs
UPDATE Comments
SET issueId = (
    SELECT i.id
    FROM Issues i
    INNER JOIN Bugs b ON b.title = i.title AND b.reporterId = i.reporterId
    WHERE Comments.bugId = b.id
)
WHERE issueId IS NULL;

-- Step 3: Generate issue keys (you may want to customize this)
UPDATE Issues
SET key = CONCAT('PROJ-', RIGHT('000' + CAST(id AS NVARCHAR(10)), 3))
WHERE key IS NULL;

-- Step 4: Drop old Bugs table (after verifying migration)
-- DROP TABLE Bugs;
*/

-- =========================================
-- 7. DEFAULT DATA INSERTION
-- =========================================

-- Insert default admin user (change password in production!)
INSERT INTO Users (username, email, password, role)
VALUES ('admin', 'admin@example.com', '$2b$10$8K1p/5w6QyT3MZdHnJcUOeJc8qTJ9YqXqJc8qTJ9YqXqJc8qTJ9Yq', 'Admin');

-- Insert sample project
INSERT INTO Projects (name, description)
VALUES ('Sample Project', 'A sample project for testing the Jira-like system');

-- Insert default workflow
INSERT INTO Workflows (name, description, projectId, isDefault, isActive)
VALUES ('Default Workflow', 'Default workflow for all issue types', 1, 1, 1);

-- Insert workflow steps
INSERT INTO WorkflowSteps (workflowId, name, status, [order], isInitial)
VALUES (1, 'Open', 'Open', 1, 1);

INSERT INTO WorkflowSteps (workflowId, name, status, [order])
VALUES (1, 'In Progress', 'In Progress', 2);

INSERT INTO WorkflowSteps (workflowId, name, status, [order])
VALUES (1, 'Resolved', 'Resolved', 3);

INSERT INTO WorkflowSteps (workflowId, name, status, [order], isFinal)
VALUES (1, 'Closed', 'Closed', 4, 1);

-- Insert workflow transitions
INSERT INTO WorkflowTransitions (workflowId, fromStepId, toStepId, name, requiredRoles)
VALUES (1, 1, 2, 'Start Progress', '["Developer","Tester"]');

INSERT INTO WorkflowTransitions (workflowId, fromStepId, toStepId, name, requiredRoles)
VALUES (1, 2, 3, 'Resolve Issue', '["Developer","Tester"]');

INSERT INTO WorkflowTransitions (workflowId, fromStepId, toStepId, name, requiredRoles)
VALUES (1, 3, 4, 'Close Issue', '["Admin"]');

INSERT INTO WorkflowTransitions (workflowId, fromStepId, toStepId, name, requiredRoles)
VALUES (1, 3, 1, 'Reopen Issue', '["Admin"]');

INSERT INTO WorkflowTransitions (workflowId, fromStepId, toStepId, name, requiredRoles)
VALUES (1, 2, 1, 'Stop Progress', '["Developer","Tester"]');

PRINT 'Jira-like database schema created successfully!';
PRINT 'Default admin user: admin@example.com / admin';
PRINT 'Default project and workflow have been created.';